import type { Ponto, Retangulo } from './geometria';
import type { PecaPlanejada, PlanoDaCena, TextoPlanejado } from './plano';

/**
 * Detector de cena ilegivel. Funcao pura sobre o plano: nao precisa de
 * browser. O teste de conteudo roda isto em todos os passos de todas as
 * licoes, entao "texto em cima de texto" e "bloco em cima de bloco" quebram
 * o CI em vez de chegar na tela.
 *
 * O que conta como problema:
 *  - duas pecas se cobrindo (exceto um cartao apoiado em cima de outra peca);
 *  - um texto sobre uma peca que nao e a dele, ou sobre outro texto;
 *  - o rotulo de uma peca vazando para fora dela;
 *  - uma ligacao atravessando uma peca que nao e ponta dela, ou um texto;
 *  - uma ligacao curta demais para a seta e o rotulo caberem.
 */

const TOLERANCIA = 1.5;
const LIGACAO_MINIMA = 26;

function retangulo(r: Retangulo): Ponto[] {
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.largura, y: r.y },
    { x: r.x + r.largura, y: r.y + r.altura },
    { x: r.x, y: r.y + r.altura },
  ];
}

function eixos(poligono: Ponto[]): Ponto[] {
  if (poligono.length === 2) {
    const [a, b] = poligono as [Ponto, Ponto];
    return [{ x: -(b.y - a.y), y: b.x - a.x }];
  }
  return poligono.map((p, i) => {
    const q = poligono[(i + 1) % poligono.length]!;
    return { x: -(q.y - p.y), y: q.x - p.x };
  });
}

function projetar(poligono: Ponto[], eixo: Ponto): [number, number] {
  const comprimento = Math.hypot(eixo.x, eixo.y) || 1;
  const valores = poligono.map((p) => (p.x * eixo.x + p.y * eixo.y) / comprimento);
  return [Math.min(...valores), Math.max(...valores)];
}

/** Um segmento vira uma faixa da largura do traco: linha de espessura zero nunca "sobrepoe" nada. */
function engrossar(poligono: Ponto[], meia = 2.5): Ponto[] {
  if (poligono.length !== 2) return poligono;
  const [a, b] = poligono as [Ponto, Ponto];
  const total = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = (-(b.y - a.y) / total) * meia;
  const ny = ((b.x - a.x) / total) * meia;
  return [
    { x: a.x + nx, y: a.y + ny },
    { x: b.x + nx, y: b.y + ny },
    { x: b.x - nx, y: b.y - ny },
    { x: a.x - nx, y: a.y - ny },
  ];
}

/** Teorema do eixo separador: dois poligonos convexos (ou um segmento) se sobrepoem mais que a tolerancia? */
export function sobrepoem(poligonoA: Ponto[], poligonoB: Ponto[], tolerancia = TOLERANCIA): boolean {
  const a = engrossar(poligonoA);
  const b = engrossar(poligonoB);
  for (const eixo of [...eixos(a), ...eixos(b)]) {
    if (eixo.x === 0 && eixo.y === 0) continue;
    const [aMin, aMax] = projetar(a, eixo);
    const [bMin, bMax] = projetar(b, eixo);
    if (Math.min(aMax, bMax) - Math.max(aMin, bMin) <= tolerancia) return false;
  }
  return true;
}

/** Ponto dentro de poligono convexo, com folga (positiva = aceita um pouco fora). */
export function dentro(p: Ponto, poligono: Ponto[], folga = 0): boolean {
  let sinal = 0;
  for (let i = 0; i < poligono.length; i++) {
    const a = poligono[i]!;
    const b = poligono[(i + 1) % poligono.length]!;
    const cruz = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    const distancia = cruz / (Math.hypot(b.x - a.x, b.y - a.y) || 1);
    if (Math.abs(distancia) <= folga) continue;
    const s = Math.sign(distancia);
    if (sinal === 0) sinal = s;
    else if (s !== sinal) return false;
  }
  return true;
}

/** `cima` esta apoiado em `baixo`: levantado do chao, com o ponto de apoio dentro do topo de `baixo`. */
function apoiado(cima: PecaPlanejada, baixo: PecaPlanejada): boolean {
  if (cima.elevacao <= 0 || cima.id === baixo.id) return false;
  const apoio = { x: cima.posicao.x, y: cima.posicao.y + cima.elevacao - baixo.altura + baixo.elevacao };
  return dentro(apoio, baixo.topo, 2);
}

function nomeDoTexto(t: TextoPlanejado): string {
  return `${t.tipo} de ${t.dono}`;
}

export function problemasDeLegibilidade(plano: PlanoDaCena): string[] {
  const problemas: string[] = [];
  const pecas = [...plano.pecas.values()];
  const ligacoes = [...plano.ligacoes.values()];
  const textos = [...pecas.flatMap((p) => p.textos), ...ligacoes.flatMap((l) => (l.texto ? [l.texto] : []))];
  const apoio = (a: PecaPlanejada, b: PecaPlanejada) => apoiado(a, b) || apoiado(b, a);
  const peca = (id: string) => plano.pecas.get(id);

  // Peca sobre peca.
  for (let i = 0; i < pecas.length; i++) {
    for (let j = i + 1; j < pecas.length; j++) {
      const a = pecas[i]!;
      const b = pecas[j]!;
      if (!apoio(a, b) && sobrepoem(a.silhueta, b.silhueta)) problemas.push(`peça ${a.id} cobre a peça ${b.id}`);
    }
  }

  // Cartao apoiado tem que ser pintado por cima da base, senao some atras dela.
  for (const cima of pecas) {
    for (const baixo of pecas) {
      if (apoiado(cima, baixo) && cima.camada <= baixo.camada) problemas.push(`peça ${cima.id} fica escondida atrás de ${baixo.id}`);
    }
  }

  // Rotulo dentro da propria peca.
  for (const p of pecas) {
    for (const t of p.textos) {
      if (t.tipo !== 'rotulo') continue;
      if (!retangulo(t.caixa).every((canto) => dentro(canto, p.silhueta, 3))) {
        problemas.push(`o rótulo de ${p.id} vaza da peça`);
      }
    }
  }

  // Texto sobre peca alheia.
  for (const t of textos) {
    const caixa = retangulo(t.caixa);
    const donoPeca = peca(t.dono);
    for (const p of pecas) {
      if (p.id === t.dono) continue;
      if (donoPeca && apoiado(donoPeca, p)) continue; // texto de um cartao sobre a placa que o apoia
      if (sobrepoem(caixa, p.silhueta)) problemas.push(`${nomeDoTexto(t)} cobre a peça ${p.id}`);
    }
  }

  // Texto sobre texto.
  for (let i = 0; i < textos.length; i++) {
    for (let j = i + 1; j < textos.length; j++) {
      const a = textos[i]!;
      const b = textos[j]!;
      if (sobrepoem(retangulo(a.caixa), retangulo(b.caixa))) problemas.push(`${nomeDoTexto(a)} cobre ${nomeDoTexto(b)}`);
    }
  }

  // Ligacoes.
  for (const l of ligacoes) {
    const [a, b] = l.pontos;
    const comprimento = Math.hypot(b.x - a.x, b.y - a.y);
    if (comprimento < LIGACAO_MINIMA) problemas.push(`ligação ${l.id} curta demais (${Math.round(comprimento)}px)`);
    if (l.texto && l.texto.caixa.largura > comprimento - 16) {
      problemas.push(`rótulo da ligação ${l.id} é maior que a ligação`);
    }
    const pontas = [peca(l.de), peca(l.para)].filter((p): p is PecaPlanejada => Boolean(p));
    for (const p of pecas) {
      if (p.id === l.de || p.id === l.para) continue;
      if (pontas.some((ponta) => apoio(p, ponta))) continue; // cartao em cima da ponta
      if (sobrepoem(l.pontos, p.silhueta)) problemas.push(`ligação ${l.id} atravessa a peça ${p.id}`);
    }
    for (const t of textos) {
      if (t.dono === l.id) continue;
      if (sobrepoem(l.pontos, retangulo(t.caixa))) problemas.push(`ligação ${l.id} passa por cima de ${nomeDoTexto(t)}`);
    }
  }

  return problemas;
}
