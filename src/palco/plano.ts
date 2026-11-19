import type { Cena, Entidade } from '../schema/licao';
import {
  COS,
  SEN,
  aparar,
  distanciaAteABorda,
  limites,
  noMundo,
  pontoMedio,
  prisma,
  unirRetangulos,
  type Ponto,
  type Prisma,
  type Retangulo,
} from './geometria';

/** Tamanho padrao de cada tipo de peca: [largura, profundidade] em celulas e altura em px. */
export const FORMA_PADRAO: Record<Entidade['tipo'], { base: [number, number]; altura: number }> = {
  bloco: { base: [2, 2], altura: 26 },
  placa: { base: [3, 2], altura: 8 },
  cartao: { base: [1.4, 1.4], altura: 9 },
};

const FOLGA_DA_LIGACAO = 7;

/**
 * Metricas de texto do palco: os mesmos tamanhos do CSS (.palco__rotulo,
 * .palco__pilula, .palco__etiqueta, .palco__rotulo-ligacao). Servem para o
 * plano saber quanto espaco cada texto ocupa SEM medir no DOM: assim o
 * detector de sobreposicao (legibilidade.ts) roda em teste, sem browser.
 * A largura e estimada por caractere, com folga.
 */
export const TEXTO = {
  nome: 12,
  nomeDoCartao: 10.5,
  sub: 10,
  pilula: 11.5,
  etiqueta: 11,
  ligacao: 10.5,
  icone: 15,
  iconeDoCartao: 11,
  iconeDaPilula: 13,
} as const;

export function larguraDoTexto(texto: string, tamanho: number, estilo: 'negrito' | 'normal' | 'mono'): number {
  // O palco usa JetBrains Mono: todo caractere tem 0,6em; o negrito e o rotulo de ligacao ganham folga.
  const fator = estilo === 'mono' ? 0.62 : estilo === 'negrito' ? 0.61 : 0.6;
  return Math.ceil(texto.length * tamanho * fator) + 2;
}

export type TipoDeTexto = 'rotulo' | 'pilula' | 'etiquetas' | 'rotulo-ligacao';

export interface TextoPlanejado {
  tipo: TipoDeTexto;
  /** Peca ou ligacao dona do texto. */
  dono: string;
  /** Caixa no mundo. */
  caixa: Retangulo;
}

export interface PecaPlanejada {
  id: string;
  entidade: Entidade;
  /** Centro do chao da peca, no mundo. E onde o elemento e posicionado (translate). */
  posicao: Ponto;
  /** Quanto a peca esta levantada do chao (cartao em cima de placa). */
  elevacao: number;
  largura: number;
  profundidade: number;
  altura: number;
  prisma: Prisma;
  /** Contorno da peca no mundo (topo + faces): o que ela cobre na tela. */
  silhueta: Ponto[];
  /** Topo da peca no mundo: e onde um cartao pode apoiar. */
  topo: Ponto[];
  /** Onde as ligacoes se prendem: o centro da peca a meia altura. */
  ancora: Ponto;
  /** Semi-eixos do losango da pegada na tela, para aparar ligacoes. */
  raioX: number;
  raioY: number;
  /**
   * Ancoras dos textos, relativas a posicao (o motor posiciona os elementos
   * por aqui; o detector mede pelas mesmas ancoras). rotulo: centro.
   * pilula: centro do topo. etiquetas: centro da base.
   */
  ancoras: { rotulo: Ponto; pilula: Ponto; etiquetas: Ponto };
  textos: TextoPlanejado[];
  /** Caixa ocupada no mundo, incluindo os textos. A camera enquadra a uniao delas. */
  caixa: Retangulo;
  /** Ordem de pintura: quem esta mais "na frente" (mais embaixo na tela) por cima. */
  camada: number;
}

export interface LigacaoPlanejada {
  id: string;
  de: string;
  para: string;
  pontos: [Ponto, Ponto];
  meio: Ponto;
  /** Estilo, setas e rotulo serializados: mudou qualquer um, a ligacao e redesenhada. */
  assinatura: string;
  caixa: Retangulo;
  texto: TextoPlanejado | null;
}

export interface PlanoDaCena {
  pecas: Map<string, PecaPlanejada>;
  ligacoes: Map<string, LigacaoPlanejada>;
  caixa: Retangulo;
}

function mover(pontos: Ponto[], d: Ponto): Ponto[] {
  return pontos.map((p) => ({ x: p.x + d.x, y: p.y + d.y }));
}

/** Contorno convexo (cadeia monotona). */
export function contorno(pontos: Ponto[]): Ponto[] {
  const ps = [...pontos].sort((a, b) => a.x - b.x || a.y - b.y);
  const cruz = (o: Ponto, a: Ponto, b: Ponto) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const baixo: Ponto[] = [];
  for (const p of ps) {
    while (baixo.length >= 2 && cruz(baixo[baixo.length - 2]!, baixo[baixo.length - 1]!, p) <= 0) baixo.pop();
    baixo.push(p);
  }
  const cima: Ponto[] = [];
  for (const p of [...ps].reverse()) {
    while (cima.length >= 2 && cruz(cima[cima.length - 2]!, cima[cima.length - 1]!, p) <= 0) cima.pop();
    cima.push(p);
  }
  return [...baixo.slice(0, -1), ...cima.slice(0, -1)];
}

function caixaCentrada(centro: Ponto, largura: number, altura: number): Retangulo {
  return { x: centro.x - largura / 2, y: centro.y - altura / 2, largura, altura };
}

export function planejarPeca(id: string, entidade: Entidade): PecaPlanejada {
  const forma = FORMA_PADRAO[entidade.tipo];
  const [largura, profundidade] = entidade.tamanho ?? forma.base;
  const altura = forma.altura;
  const [coluna, linha, elevacao = 0] = entidade.pos;
  const posicao = noMundo(coluna, linha, elevacao);
  const solido = prisma(largura, profundidade, altura);
  const pontosLocais = [...solido.topo, ...solido.direita, ...solido.esquerda];
  const silhueta = mover(contorno(pontosLocais), posicao);
  const topoY = Math.min(...solido.topo.map((p) => p.y));
  const frenteY = Math.max(...pontosLocais.map((p) => p.y));

  const ancoras = {
    // Um pouco abaixo do centro do topo: e onde a silhueta e mais larga, o texto cabe melhor.
    rotulo: { x: 0, y: -altura + 5 },
    pilula: { x: 0, y: frenteY + 6 },
    etiquetas: { x: 0, y: topoY - 8 },
  };

  const textos: TextoPlanejado[] = [];
  const noMundoLocal = (p: Ponto): Ponto => ({ x: posicao.x + p.x, y: posicao.y + p.y });

  if (entidade.tipo === 'placa') {
    const icone = entidade.icone ? TEXTO.iconeDaPilula + 4 : 0;
    const sub = entidade.sub ? 4 + larguraDoTexto(entidade.sub, TEXTO.sub, 'normal') : 0;
    const w = icone + larguraDoTexto(entidade.rotulo, TEXTO.pilula, 'negrito') + sub + 23;
    const topoDaPilula = noMundoLocal(ancoras.pilula);
    textos.push({ tipo: 'pilula', dono: id, caixa: { x: topoDaPilula.x - w / 2, y: topoDaPilula.y, largura: w, altura: 20 } });
  } else {
    const cartao = entidade.tipo === 'cartao';
    const icone = entidade.icone ? (cartao ? TEXTO.iconeDoCartao : TEXTO.icone) + 4 : 0;
    const nome = icone + larguraDoTexto(entidade.rotulo, cartao ? TEXTO.nomeDoCartao : TEXTO.nome, 'negrito');
    const sub = entidade.sub ? larguraDoTexto(entidade.sub, TEXTO.sub, 'normal') : 0;
    const h = (cartao ? 12 : 15) + (entidade.sub ? 12 : 0);
    textos.push({ tipo: 'rotulo', dono: id, caixa: caixaCentrada(noMundoLocal(ancoras.rotulo), Math.max(nome, sub), h) });
  }

  if (entidade.etiquetas.length > 0) {
    const w =
      entidade.etiquetas.reduce((soma, e) => soma + larguraDoTexto(e.texto, TEXTO.etiqueta, 'negrito') + 21, 0) +
      6 * (entidade.etiquetas.length - 1);
    const base = noMundoLocal(ancoras.etiquetas);
    textos.push({ tipo: 'etiquetas', dono: id, caixa: { x: base.x - w / 2, y: base.y - 19, largura: w, altura: 19 } });
  }

  const caixa = unirRetangulos([limites(silhueta), ...textos.map((t) => t.caixa)]);

  return {
    id,
    entidade,
    posicao,
    elevacao,
    largura,
    profundidade,
    altura,
    prisma: solido,
    silhueta,
    topo: mover(solido.topo, posicao),
    ancora: { x: posicao.x, y: posicao.y - altura / 2 },
    raioX: ((largura + profundidade) / 2) * COS,
    raioY: ((largura + profundidade) / 2) * SEN + altura / 2,
    ancoras,
    textos,
    caixa,
    // Peca levantada (cartao sobre placa) pinta sempre acima das pecas no chao: pela linha
    // sozinha, um cartao na ponta de tras da placa ficaria escondido atras dela.
    camada: 1000 + Math.round(linha * 20) + (elevacao > 0 ? 500 + Math.round(elevacao) : 0),
  };
}

export function planejarCena(cena: Cena): PlanoDaCena {
  const pecas = new Map<string, PecaPlanejada>();
  for (const [id, entidade] of Object.entries(cena.entidades)) {
    pecas.set(id, planejarPeca(id, entidade));
  }

  const ligacoes = new Map<string, LigacaoPlanejada>();
  for (const [id, ligacao] of Object.entries(cena.ligacoes)) {
    const a = pecas.get(ligacao.de);
    const b = pecas.get(ligacao.para);
    if (!a || !b) continue; // o schema ja recusa; aqui so nao derruba a cena
    const dx = b.ancora.x - a.ancora.x;
    const dy = b.ancora.y - a.ancora.y;
    // Para na borda real de cada peca (a silhueta), mais uma folga.
    const pontos = aparar(
      a.ancora,
      b.ancora,
      distanciaAteABorda(a.ancora, dx, dy, a.silhueta) + FOLGA_DA_LIGACAO,
      distanciaAteABorda(b.ancora, -dx, -dy, b.silhueta) + FOLGA_DA_LIGACAO,
    );
    const meio = pontoMedio(pontos[0], pontos[1]);
    const texto: TextoPlanejado | null = ligacao.rotulo
      ? {
          tipo: 'rotulo-ligacao',
          dono: id,
          caixa: caixaCentrada(meio, larguraDoTexto(ligacao.rotulo, TEXTO.ligacao, 'mono') + 19, 18),
        }
      : null;
    ligacoes.set(id, {
      id,
      de: ligacao.de,
      para: ligacao.para,
      pontos,
      meio,
      assinatura: JSON.stringify(ligacao),
      caixa: limites(pontos),
      texto,
    });
  }

  const caixa = unirRetangulos([
    ...[...pecas.values()].map((p) => p.caixa),
    ...[...ligacoes.values()].flatMap((l) => (l.texto ? [l.texto.caixa] : [])),
  ]);
  return { pecas, ligacoes, caixa };
}

/** Duas pecas iguais em tudo menos posicao? Entao so precisam se mover, sem redesenhar. */
export function mesmoConteudo(a: Entidade, b: Entidade): boolean {
  const { pos: _a, ...restoA } = a;
  const { pos: _b, ...restoB } = b;
  return JSON.stringify(restoA) === JSON.stringify(restoB);
}

export function mesmaPosicao(a: PecaPlanejada, b: PecaPlanejada): boolean {
  return Math.abs(a.posicao.x - b.posicao.x) < 0.01 && Math.abs(a.posicao.y - b.posicao.y) < 0.01;
}
