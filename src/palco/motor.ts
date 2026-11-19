import { CORES, type Cena, type TipoDePacote } from '../schema/licao';
import { CURVAS, TEMPOS, planejarTransicao } from './coreografia';
import { planejarViagem, sementeDe, sorteador, PAUSA_NO_NO, type Viagem } from './fluxos';
import {
  COS,
  SEN,
  caminhoArredondado,
  enquadrar,
  limites,
  pontaDeSeta,
  transformDaCamera,
  transladar,
  type Camera,
  type Ponto,
} from './geometria';
import { ICONE } from './icones';
import { mesmaPosicao, mesmoConteudo, planejarCena, type LigacaoPlanejada, type PecaPlanejada, type PlanoDaCena } from './plano';

/**
 * O motor do palco. Imperativo de proposito (como o do designed-to-scale e o
 * do hairline): o React entrega a cena do passo, o motor cuida do DOM dentro
 * da raiz e da animacao.
 *
 * A diferenca para a referencia e a regra deste projeto: TUDO que se mexe e um
 * elemento HTML animado so em transform e opacity pela Web Animations API.
 *  - a camera e um transform no "mundo", nao um viewBox animado;
 *  - cada ligacao e o proprio <svg>, alinhado ao seu eixo: ela se "desenha"
 *    crescendo em scaleX a partir da origem, sem animar stroke nem geometria;
 *  - o piso isometrico mora num plano proprio que recebe o mesmo transform da
 *    camera: o chao anda junto com a cena, e o fade das bordas fica parado;
 *  - pacotes e explosoes saem de um pool criado uma vez: enquanto os fluxos
 *    rodam, nenhum elemento entra ou sai do DOM, entao nao ha layout.
 * O e2e confere isso no Chromium (LayoutCount via CDP).
 */

/** Um quadro-chave do motor. O tipo e a regra: so transform e opacity passam. */
export interface Quadro {
  transform?: string;
  opacity?: number;
  offset?: number;
  easing?: string;
}

/** A unica porta de animacao do motor. Sem Web Animations (jsdom), devolve null e a cena so salta. */
export function animar(el: Element, quadros: Quadro[], opcoes: KeyframeAnimationOptions): Animation | null {
  if (typeof (el as { animate?: unknown }).animate !== 'function') return null;
  return el.animate(quadros as Keyframe[], opcoes);
}

export interface OpcoesDoMotor {
  /** Consultado a cada troca de passo: com reduced motion, a cena salta e os fluxos ficam parados. */
  reduzirMovimento?: () => boolean;
}

export interface Motor {
  irPara(cena: Cena, opcoes?: { instantaneo?: boolean; semente?: string }): void;
  /** Refaz a transicao do passo anterior para o atual. */
  repetir(): void;
  pausar(): void;
  retomar(): void;
  /** Um pacote avulso por uma rota de ligacoes da cena atual (usado pelo laboratorio). */
  disparar(rota: string[], tipo?: TipoDePacote): void;
  /** Uma batida numa peca: escala para cima e volta. */
  pulsar(id: string): void;
  destruir(): void;
}

const TAMANHO_DO_POOL = 28;
const TAMANHO_DO_POOL_DE_EXPLOSOES = 10;
const JANELA_PADRAO = { largura: 920, altura: 480 };
/** Meia largura do piso, em px do mundo: cobre qualquer enquadramento da camera. */
const EXTENSAO_DO_PISO = 3200;
/** Meia altura do <svg> de uma ligacao: espaco para a ponta de seta. */
const MEIA_ALTURA_DA_LIGACAO = 8;
let proximoPrefixo = 0;

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  elemento.className = classe;
  return elemento;
}

function interpolar(a: Ponto, b: Ponto, t: number): Ponto {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function svgIcone(nome: keyof typeof ICONE, classe: string): string {
  return `<svg class="${classe}" viewBox="0 0 24 24" aria-hidden="true">${ICONE[nome]}</svg>`;
}

export function criarMotor(raiz: HTMLElement, opcoes: OpcoesDoMotor = {}): Motor {
  const prefixo = `palco-${proximoPrefixo++}`;
  const reduzir = () => opcoes.reduzirMovimento?.() ?? false;

  // ---- estrutura fixa -------------------------------------------------------
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('class', 'palco__defs');
  defs.setAttribute('aria-hidden', 'true');
  defs.innerHTML = `<defs>${CORES.map(
    (cor) => `
      <linearGradient id="${prefixo}-${cor}-topo" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" style="stop-color: var(--palco-${cor}-topo-1)"/>
        <stop offset="1" style="stop-color: var(--palco-${cor}-topo-2)"/>
      </linearGradient>
      <linearGradient id="${prefixo}-${cor}-lado" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: var(--palco-${cor}-lado-1)"/>
        <stop offset="1" style="stop-color: var(--palco-${cor}-lado-2)"/>
      </linearGradient>`,
  ).join('')}</defs>`;

  // Piso: losangos de meia celula, alinhados a grade do mundo (um cruzamento na origem).
  const piso = el('div', 'palco__piso');
  const pisoMundo = el('div', 'palco__piso-mundo');
  const e = EXTENSAO_DO_PISO;
  pisoMundo.innerHTML = `<svg class="palco__grade" viewBox="${-e} ${-e} ${2 * e} ${2 * e}"
      style="left:${-e}px;top:${-e}px;width:${2 * e}px;height:${2 * e}px" aria-hidden="true">
      <defs><pattern id="${prefixo}-piso" patternUnits="userSpaceOnUse" x="0" y="${-SEN / 2}" width="${COS}" height="${SEN}">
        <path d="M0 ${SEN / 2} L${COS / 2} 0 L${COS} ${SEN / 2} L${COS / 2} ${SEN} Z"/>
      </pattern></defs>
      <rect x="${-e}" y="${-e}" width="${2 * e}" height="${2 * e}" fill="url(#${prefixo}-piso)"/>
    </svg>`;
  piso.append(pisoMundo);

  const mundo = el('div', 'palco__mundo');
  const camadaLigacoes = el('div', 'palco__camada palco__camada--ligacoes');
  const camadaPecas = el('div', 'palco__camada palco__camada--pecas');
  const camadaRotulos = el('div', 'palco__camada palco__camada--rotulos');
  const camadaPacotes = el('div', 'palco__camada palco__camada--pacotes');
  mundo.append(camadaLigacoes, camadaPecas, camadaRotulos, camadaPacotes);
  raiz.append(defs, piso, mundo);

  // Pools: criados uma vez. Um pacote "livre" esta em opacidade 0 no CSS base.
  const livres: HTMLElement[] = [];
  for (let i = 0; i < TAMANHO_DO_POOL; i++) {
    const pacote = el('div', 'palco__pacote');
    pacote.innerHTML = '<span class="palco__pacote-ida"></span><span class="palco__pacote-volta"></span>';
    camadaPacotes.append(pacote);
    livres.push(pacote);
  }
  const explosoesLivres: HTMLElement[] = [];
  for (let i = 0; i < TAMANHO_DO_POOL_DE_EXPLOSOES; i++) {
    const explosao = el('div', 'palco__explosao');
    explosao.innerHTML = '<span class="palco__explosao-anel"></span><span class="palco__explosao-x"></span>';
    camadaPacotes.append(explosao);
    explosoesLivres.push(explosao);
  }

  // ---- estado ------------------------------------------------------------------
  let cenaAtual: Cena | null = null;
  let cenaAnterior: Cena | null = null;
  let planoAtual: PlanoDaCena | null = null;
  let camera: Camera | null = null;
  let sorteio = sorteador(1);
  let pausado = false;
  const pecas = new Map<string, HTMLElement>();
  const ligacoes = new Map<string, { desenho: SVGSVGElement; rotulo: HTMLElement | null }>();
  const daTransicao = new Set<Animation>();
  const dosPacotes = new Set<Animation>();
  const temporizadores = new Set<ReturnType<typeof setTimeout>>();
  let assentar: ReturnType<typeof setTimeout> | null = null;

  function rastrear(conjunto: Set<Animation>, animacao: Animation | null): Animation | null {
    if (!animacao) return null;
    conjunto.add(animacao);
    animacao.finished.then(
      () => conjunto.delete(animacao),
      () => conjunto.delete(animacao),
    );
    return animacao;
  }

  function janela() {
    const largura = raiz.clientWidth;
    const altura = raiz.clientHeight;
    return largura > 0 && altura > 0 ? { largura, altura } : JANELA_PADRAO;
  }

  // ---- pecas -------------------------------------------------------------------
  function preencherPeca(elemento: HTMLElement, peca: PecaPlanejada) {
    const { entidade, prisma } = peca;
    const cor = entidade.cor;
    elemento.className = [
      'palco__peca',
      `palco__peca--${entidade.tipo}`,
      `palco-cor--${cor}`,
      entidade.destaque ? 'is-destaque' : '',
      entidade.apagado ? 'is-apagado' : '',
    ]
      .filter(Boolean)
      .join(' ');
    elemento.style.zIndex = String(peca.camada);

    const caixa = limites([...prisma.topo, ...prisma.direita, ...prisma.esquerda]);
    // Brilho do topo: o mesmo losango, um pouco menor, so com um filete claro (como na referencia).
    const centroDoTopo = prisma.topo.reduce((soma, p) => ({ x: soma.x + p.x / 4, y: soma.y + p.y / 4 }), { x: 0, y: 0 });
    const brilho = prisma.topo.map((p) => ({
      x: centroDoTopo.x + (p.x - centroDoTopo.x) * 0.82,
      y: centroDoTopo.y + (p.y - centroDoTopo.y) * 0.82,
    }));
    const raio = entidade.tipo === 'cartao' ? 3 : 7;
    // Ancoras do plano: o detector de legibilidade mede os textos nestes mesmos pontos.
    const { ancoras } = peca;
    const icone = entidade.icone ? svgIcone(entidade.icone, 'palco__icone') : '';
    const sub = entidade.sub ? `<small>${escapar(entidade.sub)}</small>` : '';
    const rotulo =
      entidade.tipo === 'placa'
        ? `<div class="palco__pilula" style="transform: translate(-50%, 0) translateY(${ancoras.pilula.y}px)">${icone}<strong>${escapar(entidade.rotulo)}</strong>${sub}</div>`
        : `<div class="palco__rotulo" style="transform: translate(-50%, -50%) translateY(${ancoras.rotulo.y}px)">
             <span class="palco__rotulo-linha">${icone}<strong>${escapar(entidade.rotulo)}</strong></span>${sub}
           </div>`;
    const etiquetas = entidade.etiquetas.length
      ? `<div class="palco__etiquetas" style="transform: translate(-50%, -100%) translateY(${ancoras.etiquetas.y}px)">${entidade.etiquetas
          .map((e) => `<span class="palco__etiqueta" data-tom="${e.tom}">${escapar(e.texto)}</span>`)
          .join('')}</div>`
      : '';

    // Sombra no chao: fica parada enquanto o corpo cai, e cresce quando ele pousa.
    const sombraX = ((peca.largura + peca.profundidade) / 2) * COS * 1.2;
    const sombraY = ((peca.largura + peca.profundidade) / 2) * SEN * 1.2;
    const sombra =
      peca.elevacao > 0
        ? ''
        : `<div class="palco__sombra" style="left:${-sombraX}px;top:${-sombraY + 5}px;width:${sombraX * 2}px;height:${sombraY * 2}px"></div>`;

    elemento.innerHTML = `
      ${sombra}
      <div class="palco__corpo">
        <div class="palco__halo" style="width:${peca.raioX * 2.5}px;height:${peca.raioY * 2.5}px"></div>
        <svg class="palco__solido" viewBox="${caixa.x} ${caixa.y} ${caixa.largura} ${caixa.altura}"
             style="left:${caixa.x}px;top:${caixa.y}px;width:${caixa.largura}px;height:${caixa.altura}px" aria-hidden="true">
          <path class="palco__face" d="${caminhoArredondado(prisma.esquerda, raio)}" fill="url(#${prefixo}-${cor}-lado)"/>
          <path class="palco__face palco__face--direita" d="${caminhoArredondado(prisma.direita, raio)}"/>
          <path class="palco__face" d="${caminhoArredondado(prisma.topo, raio)}" fill="url(#${prefixo}-${cor}-topo)"/>
          <path class="palco__brilho" d="${caminhoArredondado(brilho, raio * 0.8)}"/>
        </svg>
        ${rotulo}
        ${etiquetas}
      </div>`;
  }

  function criarPeca(peca: PecaPlanejada): HTMLElement {
    const elemento = el('div', 'palco__peca');
    elemento.dataset.entidade = peca.id;
    elemento.style.transform = transladar(peca.posicao);
    preencherPeca(elemento, peca);
    return elemento;
  }

  // ---- ligacoes ----------------------------------------------------------------
  /**
   * A ligacao e um <svg> deitado no proprio eixo: comprimento na horizontal,
   * linha no meio da altura. O transform leva a origem do svg ao ponto de
   * partida e gira; e assim que a ligacao se desenha, crescendo em scaleX.
   */
  function eixoDaLigacao(ligacao: LigacaoPlanejada, escalaX = 1): string {
    const [a, b] = ligacao.pontos;
    const angulo = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    return `${transladar(a)} rotate(${angulo.toFixed(3)}deg) scaleX(${escalaX}) translateY(-${MEIA_ALTURA_DA_LIGACAO}px)`;
  }

  function criarLigacao(id: string, ligacao: LigacaoPlanejada, cena: Cena) {
    const fonte = cena.ligacoes[id]!;
    const [a, b] = ligacao.pontos;
    const m = MEIA_ALTURA_DA_LIGACAO;
    const comprimento = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const inicio = { x: 0, y: m };
    const fim = { x: comprimento, y: m };
    const pontas: Ponto[][] = [];
    if (fonte.setas !== 'nenhuma') pontas.push(pontaDeSeta(inicio, fim));
    if (fonte.setas === 'ambas') pontas.push(pontaDeSeta(fim, inicio));

    const desenho = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    desenho.setAttribute('class', `palco__ligacao palco__ligacao--${fonte.estilo}`);
    desenho.setAttribute('viewBox', `0 0 ${comprimento} ${2 * m}`);
    desenho.setAttribute('aria-hidden', 'true');
    desenho.dataset.ligacao = id;
    desenho.style.cssText = `width:${comprimento}px;height:${2 * m}px;transform:${eixoDaLigacao(ligacao)}`;
    desenho.innerHTML = `
      <line x1="0" y1="${m}" x2="${comprimento}" y2="${m}"/>
      ${pontas.map((p) => `<path class="palco__seta" d="M${p.map((q) => `${q.x},${q.y}`).join(' L')} Z"/>`).join('')}`;
    camadaLigacoes.append(desenho);

    let rotulo: HTMLElement | null = null;
    if (fonte.rotulo) {
      rotulo = el('div', 'palco__rotulo-ligacao');
      rotulo.textContent = fonte.rotulo;
      rotulo.style.transform = `${transladar(ligacao.meio)} translate(-50%, -50%)`;
      camadaRotulos.append(rotulo);
    }
    ligacoes.set(id, { desenho, rotulo });
    return { desenho, rotulo };
  }

  function sumir(elemento: Element, duracao: number, instantaneo: boolean) {
    if (instantaneo) {
      elemento.remove();
      return;
    }
    const animacao = rastrear(
      daTransicao,
      animar(elemento, [{ opacity: 1 }, { opacity: 0 }], { duration: duracao, easing: CURVAS.entraESai, fill: 'forwards' }),
    );
    if (!animacao) elemento.remove();
    else animacao.finished.then(() => elemento.remove(), () => elemento.remove());
  }

  // ---- transicao de passo ------------------------------------------------------
  function concluirTransicao() {
    for (const animacao of [...daTransicao]) animacao.finish();
    daTransicao.clear();
    if (assentar) clearTimeout(assentar);
    assentar = null;
  }

  function aplicarCamera(proximo: PlanoDaCena, duracao: number) {
    const nova = enquadrar(proximo.caixa, janela());
    const velha = camera;
    camera = nova;
    for (const plano of [mundo, pisoMundo]) {
      plano.style.transform = transformDaCamera(nova);
      if (velha && duracao > 0) {
        rastrear(
          daTransicao,
          animar(plano, [{ transform: transformDaCamera(velha) }, { transform: transformDaCamera(nova) }], {
            duration: duracao,
            easing: CURVAS.entraESai,
          }),
        );
      }
    }
  }

  function irPara(cena: Cena, { instantaneo = false, semente }: { instantaneo?: boolean; semente?: string } = {}) {
    concluirTransicao();
    pararFluxos();
    if (pausado) retomarAnimacoes();
    pausado = false;
    raiz.dataset.pausado = 'nao';
    sorteio = sorteador(sementeDe(semente ?? cena.foco));

    const imediato = instantaneo || reduzir();
    const proximo = planejarCena(cena);
    const anterior = planoAtual;
    const t = planejarTransicao(imediato ? null : anterior, proximo);

    // Saem: pecas que nao existem mais.
    const saem = new Map(t.saem.map((s) => [s.id, s]));
    for (const [id, elemento] of [...pecas]) {
      if (proximo.pecas.has(id)) continue;
      pecas.delete(id);
      const velha = anterior?.pecas.get(id);
      const tempo = saem.get(id);
      if (imediato || !velha || !tempo) {
        elemento.remove();
        continue;
      }
      const animacao = rastrear(
        daTransicao,
        animar(
          elemento,
          [
            { transform: transladar(velha.posicao), opacity: 1 },
            { transform: transladar({ x: velha.posicao.x, y: velha.posicao.y + 18 }), opacity: 0 },
          ],
          { duration: tempo.duracao, delay: tempo.atraso, easing: CURVAS.entraESai, fill: 'forwards' },
        ),
      );
      if (!animacao) elemento.remove();
      else animacao.finished.then(() => elemento.remove(), () => elemento.remove());
    }

    // Ligacoes que sumiram ou mudaram de geometria saem por opacidade.
    const ligacoesQueSaem = new Set(t.ligacoesSaem.map((l) => l.id));
    for (const [id, { desenho, rotulo }] of [...ligacoes]) {
      const mudou = ligacoesQueSaem.has(id) || !proximo.ligacoes.has(id) || imediato;
      if (!mudou) continue;
      ligacoes.delete(id);
      sumir(desenho, TEMPOS.saidaDaLigacao, imediato);
      if (rotulo) sumir(rotulo, TEMPOS.saidaDaLigacao, imediato);
    }

    // Ficam, se movem, mudam ou entram.
    const movem = new Map(t.movem.map((m) => [m.id, m]));
    const mudam = new Map(t.mudam.map((m) => [m.id, m]));
    const entram = new Map(t.entram.map((e) => [e.id, e]));
    for (const [id, peca] of proximo.pecas) {
      let elemento = pecas.get(id);
      const velha = anterior?.pecas.get(id);
      if (!elemento) {
        elemento = criarPeca(peca);
        camadaPecas.append(elemento);
        pecas.set(id, elemento);
        const tempo = entram.get(id);
        if (!imediato && tempo) {
          // O corpo cai de cima com um quique (transform) enquanto a peca aparece (opacity),
          // e a sombra cresce no chao conforme ele se aproxima: tres curvas, como na referencia.
          const corpo = elemento.querySelector('.palco__corpo');
          const sombra = elemento.querySelector('.palco__sombra');
          const tempos = { duration: tempo.duracao, delay: tempo.atraso, fill: 'backwards' as const };
          if (corpo) {
            rastrear(
              daTransicao,
              animar(corpo, [{ transform: 'translateY(-90px)' }, { transform: 'translateY(0)' }], {
                ...tempos,
                easing: CURVAS.quica,
              }),
            );
          }
          if (sombra) {
            rastrear(
              daTransicao,
              animar(sombra, [{ transform: 'scale(0.3)' }, { transform: 'scale(1)' }], {
                ...tempos,
                easing: CURVAS.assenta,
              }),
            );
          }
          rastrear(
            daTransicao,
            animar(elemento, [{ opacity: 0 }, { opacity: 1 }], {
              duration: tempo.duracao * 0.6,
              delay: tempo.atraso,
              easing: CURVAS.assenta,
              fill: 'backwards',
            }),
          );
        }
        continue;
      }

      if (velha && !mesmoConteudo(velha.entidade, peca.entidade)) preencherPeca(elemento, peca);
      elemento.style.zIndex = String(peca.camada);
      elemento.style.transform = transladar(peca.posicao);
      if (imediato || !velha) continue;

      const movimento = movem.get(id);
      if (movimento && !mesmaPosicao(velha, peca)) {
        rastrear(
          daTransicao,
          animar(elemento, [{ transform: transladar(velha.posicao) }, { transform: transladar(peca.posicao) }], {
            duration: movimento.duracao,
            delay: movimento.atraso,
            easing: CURVAS.entraESai,
            fill: 'backwards',
          }),
        );
      }
      const mudanca = mudam.get(id);
      if (mudanca) batida(elemento, peca.posicao, mudanca.atraso);
    }

    // Ligacoes novas aparecem quando as duas pontas ja estao no lugar.
    const ligacoesQueEntram = new Map(t.ligacoesEntram.map((l) => [l.id, l]));
    for (const [id, ligacao] of proximo.ligacoes) {
      if (ligacoes.has(id)) continue;
      const { desenho, rotulo } = criarLigacao(id, ligacao, cena);
      const tempo = ligacoesQueEntram.get(id);
      if (imediato || !tempo) continue;
      // A linha cresce da origem ate o destino; o rotulo aparece quando ela ja passou do meio.
      rastrear(
        daTransicao,
        animar(desenho, [{ transform: eixoDaLigacao(ligacao, 0) }, { transform: eixoDaLigacao(ligacao, 1) }], {
          duration: tempo.duracao,
          delay: tempo.atraso,
          easing: CURVAS.assenta,
          fill: 'backwards',
        }),
      );
      if (rotulo) {
        const base = `${transladar(ligacao.meio)} translate(-50%, -50%)`;
        rastrear(
          daTransicao,
          animar(rotulo, [{ transform: `${base} scale(0.85)`, opacity: 0 }, { transform: `${base} scale(1)`, opacity: 1 }], {
            duration: tempo.duracao * 0.6,
            delay: tempo.atraso + tempo.duracao * 0.45,
            easing: CURVAS.quica,
            fill: 'backwards',
          }),
        );
      }
    }

    aplicarCamera(proximo, imediato ? 0 : t.camera.duracao);

    planoAtual = proximo;
    cenaAnterior = cenaAtual;
    cenaAtual = cena;
    raiz.dataset.foco = cena.foco;

    const pronto = () => {
      assentar = null;
      raiz.dataset.estado = 'pronto';
      if (!reduzir()) iniciarFluxos();
    };
    if (imediato || t.total === 0 || daTransicao.size === 0) {
      raiz.dataset.estado = 'pronto';
      if (!reduzir()) iniciarFluxos();
    } else {
      raiz.dataset.estado = 'animando';
      assentar = setTimeout(pronto, t.total);
    }
  }

  function batida(elemento: HTMLElement, posicao: Ponto, atraso = 0) {
    const base = transladar(posicao);
    rastrear(
      daTransicao,
      animar(
        elemento,
        [{ transform: `${base} scale(1)` }, { transform: `${base} scale(1.08)`, offset: 0.4 }, { transform: `${base} scale(1)` }],
        { duration: TEMPOS.pulso, delay: atraso, easing: CURVAS.entraESai },
      ),
    );
  }

  // ---- fluxos de pacotes -------------------------------------------------------
  function pararFluxos() {
    for (const id of temporizadores) clearTimeout(id);
    temporizadores.clear();
    for (const animacao of [...dosPacotes]) animacao.cancel();
    dosPacotes.clear();
  }

  function esperar(animacao: Animation | null): Promise<void> {
    if (!animacao) return Promise.reject(new Error('sem animacao'));
    rastrear(dosPacotes, animacao);
    return animacao.finished.then(() => undefined);
  }

  function explodir(ponto: Ponto, desfecho: Viagem['desfecho']) {
    const explosao = explosoesLivres.pop();
    if (!explosao) return;
    explosao.dataset.desfecho = desfecho;
    const base = transladar(ponto);
    const animacao = rastrear(
      dosPacotes,
      animar(
        explosao,
        [
          { transform: `${base} scale(0.6)`, opacity: 1 },
          { transform: `${base} scale(1.25)`, opacity: 1, offset: 0.45 },
          { transform: `${base} scale(1.7)`, opacity: 0 },
        ],
        { duration: desfecho === 'falha' ? 900 : 650, easing: 'ease-out' },
      ),
    );
    const devolver = () => explosoesLivres.push(explosao);
    if (!animacao) devolver();
    else animacao.finished.then(devolver, devolver);
  }

  async function viajar(viagem: Viagem) {
    const pacote = livres.pop();
    if (!pacote) return; // pool cheio: o fluxo perde um pacote em vez de criar elemento novo
    const ida = pacote.firstElementChild as HTMLElement;
    const volta = pacote.lastElementChild as HTMLElement;
    pacote.dataset.tipo = viagem.tipo;
    ida.style.opacity = '1';
    volta.style.opacity = '0';
    try {
      for (let i = 0; i < viagem.trechos.length; i++) {
        const trecho = viagem.trechos[i]!;
        const anterior = viagem.trechos[i - 1];
        const virou = anterior && !anterior.volta && trecho.volta;
        if (virou && viagem.segura > 0) {
          // Retido no destino: pulsa no lugar antes de voltar.
          const base = transladar(trecho.de);
          await esperar(
            animar(
              pacote,
              [
                { transform: `${base} scale(1)`, opacity: 1 },
                { transform: `${base} scale(1.7)`, opacity: 0.7, offset: 0.5 },
                { transform: `${base} scale(1)`, opacity: 1 },
              ],
              { duration: viagem.segura, easing: CURVAS.entraESai },
            ),
          );
        }
        if (trecho.volta) {
          ida.style.opacity = '0';
          volta.style.opacity = '1';
        }
        const atraso = i === 0 || virou ? 0 : PAUSA_NO_NO;
        // O primeiro trecho nasce: o pacote cresce do ponto de partida enquanto ja anda.
        const quadros: Quadro[] =
          i === 0
            ? [
                { transform: `${transladar(trecho.de)} scale(0.2)`, opacity: 0 },
                { transform: `${transladar(interpolar(trecho.de, trecho.para, 0.14))} scale(1)`, opacity: 1, offset: 0.14 },
                { transform: `${transladar(trecho.para)} scale(1)`, opacity: 1 },
              ]
            : [
                { transform: `${transladar(trecho.de)} scale(1)`, opacity: 1 },
                { transform: `${transladar(trecho.para)} scale(1)`, opacity: 1 },
              ];
        await esperar(animar(pacote, quadros, { duration: trecho.duracao, delay: atraso, easing: 'linear' }));
      }
      explodir(viagem.fim, viagem.desfecho);
    } catch {
      // cancelada pela troca de passo: so devolve o pacote
    } finally {
      livres.push(pacote);
    }
  }

  function iniciarFluxos() {
    if (!cenaAtual || !planoAtual) return;
    const plano = planoAtual;
    cenaAtual.fluxos.forEach((fluxo, i) => {
      const lancar = () => {
        const viagem = planejarViagem(fluxo, plano.ligacoes, sorteio);
        if (viagem) void viajar(viagem);
      };
      const intervalo = 1000 / fluxo.taxa;
      const agendar = (espera: number) => {
        const id = setTimeout(() => {
          temporizadores.delete(id);
          lancar();
          agendar(intervalo);
        }, espera);
        temporizadores.add(id);
      };
      agendar(i * 240);
    });
  }

  // ---- pausa -------------------------------------------------------------------
  function animacoesDoPalco(): Animation[] {
    return typeof raiz.getAnimations === 'function' ? raiz.getAnimations({ subtree: true }) : [];
  }

  function retomarAnimacoes() {
    for (const animacao of animacoesDoPalco()) if (animacao.playState === 'paused') animacao.play();
  }

  function pausar() {
    if (pausado) return;
    pausado = true;
    raiz.dataset.pausado = 'sim';
    for (const id of temporizadores) clearTimeout(id);
    temporizadores.clear();
    if (assentar) {
      clearTimeout(assentar);
      assentar = null;
    }
    for (const animacao of animacoesDoPalco()) animacao.pause();
  }

  function retomar() {
    if (!pausado) return;
    pausado = false;
    raiz.dataset.pausado = 'nao';
    retomarAnimacoes();
    if (raiz.dataset.estado === 'pronto') {
      if (!reduzir()) iniciarFluxos();
      return;
    }
    // Pausou no meio da transicao: assenta quando a ultima animacao dela terminar.
    const restante = Math.max(
      0,
      ...[...daTransicao].map((a) => {
        const tempo = a.effect?.getComputedTiming();
        return Number(tempo?.endTime ?? 0) - Number(a.currentTime ?? 0);
      }),
    );
    assentar = setTimeout(() => {
      assentar = null;
      raiz.dataset.estado = 'pronto';
      if (!reduzir()) iniciarFluxos();
    }, restante);
  }

  // ---- reenquadrar quando o palco muda de tamanho ------------------------------
  let tamanho = '';
  const observador =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          const atual = `${raiz.clientWidth}x${raiz.clientHeight}`;
          if (atual === tamanho || !planoAtual) {
            tamanho = atual;
            return;
          }
          tamanho = atual;
          camera = enquadrar(planoAtual.caixa, janela());
          mundo.style.transform = transformDaCamera(camera);
          pisoMundo.style.transform = transformDaCamera(camera);
        });
  observador?.observe(raiz);

  return {
    irPara,
    repetir() {
      if (!cenaAtual) return;
      const alvo = cenaAtual;
      const origem = cenaAnterior;
      if (origem && origem !== alvo) {
        irPara(origem, { instantaneo: true });
      } else {
        // Sem passo anterior: monta do zero.
        concluirTransicao();
        pararFluxos();
        for (const elemento of pecas.values()) elemento.remove();
        for (const { desenho, rotulo } of ligacoes.values()) {
          desenho.remove();
          rotulo?.remove();
        }
        pecas.clear();
        ligacoes.clear();
        planoAtual = null;
        camera = null;
      }
      irPara(alvo);
      cenaAnterior = origem;
    },
    pausar,
    retomar,
    disparar(rota, tipo = 'requisicao') {
      if (!planoAtual || reduzir()) return;
      const viagem = planejarViagem(
        { rota, tipo, taxa: 1, volta: false, segura: 0, falha: 0 },
        planoAtual.ligacoes,
        sorteio,
      );
      if (viagem) void viajar(viagem);
    },
    pulsar(id) {
      const elemento = pecas.get(id);
      const peca = planoAtual?.pecas.get(id);
      if (!elemento || !peca || reduzir()) return;
      batida(elemento, peca.posicao);
    },
    destruir() {
      concluirTransicao();
      pararFluxos();
      observador?.disconnect();
      for (const animacao of animacoesDoPalco()) animacao.cancel();
      raiz.replaceChildren();
      delete raiz.dataset.estado;
      delete raiz.dataset.foco;
      delete raiz.dataset.pausado;
    },
  };
}
