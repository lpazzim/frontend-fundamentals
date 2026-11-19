/**
 * Geometria do palco. Tudo aqui e funcao pura sobre numeros: nenhuma toca no
 * DOM, entao os testes cobrem a matematica sem browser.
 *
 * Projecao isometrica classica (30 graus): uma celula da grade vira um losango
 * de 2*COS de largura por 2*SEN de altura na tela.
 */
export const COS = 34.64; // 40 * cos(30)
export const SEN = 20; // 40 * sin(30)

export interface Ponto {
  x: number;
  y: number;
}

export interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/** Ponto da grade local (gx, gy) a uma altura z (px) na tela. */
export function iso(gx: number, gy: number, z = 0): Ponto {
  return { x: (gx - gy) * COS, y: (gx + gy) * SEN - z };
}

/**
 * Posicao de autoria -> mundo. [coluna, linha]: coluna anda 2*COS na
 * horizontal, linha anda 2*SEN na vertical. Equivale a gx = col + lin,
 * gy = lin - col, entao inteiros caem sempre em cruzamentos da grade.
 */
export function noMundo(coluna: number, linha: number, altura = 0): Ponto {
  return { x: coluna * 2 * COS, y: linha * 2 * SEN - altura };
}

export interface Prisma {
  topo: Ponto[];
  esquerda: Ponto[];
  direita: Ponto[];
}

/**
 * Prisma de base largura x profundidade (em celulas) e altura em px, com o
 * centro do chao na origem. So as faces visiveis: topo, frente-esquerda e
 * frente-direita (o observador olha de +gx +gy).
 */
export function prisma(largura: number, profundidade: number, altura: number): Prisma {
  const a = largura / 2;
  const b = profundidade / 2;
  return {
    topo: [iso(-a, -b, altura), iso(a, -b, altura), iso(a, b, altura), iso(-a, b, altura)],
    direita: [iso(a, -b, altura), iso(a, b, altura), iso(a, b, 0), iso(a, -b, 0)],
    esquerda: [iso(-a, b, altura), iso(a, b, altura), iso(a, b, 0), iso(-a, b, 0)],
  };
}

function distancia(a: Ponto, b: Ponto): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function arredondar(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Caminho SVG fechado de um poligono com os cantos arredondados (curva quadratica em cada canto). */
export function caminhoArredondado(pontos: Ponto[], raio: number): string {
  const n = pontos.length;
  if (n < 3) throw new Error('um poligono precisa de ao menos 3 pontos');
  const partes: string[] = [];
  pontos.forEach((p, i) => {
    const anterior = pontos[(i - 1 + n) % n]!;
    const seguinte = pontos[(i + 1) % n]!;
    const r = Math.min(raio, distancia(p, anterior) / 2, distancia(p, seguinte) / 2);
    const ida = recuar(p, anterior, r);
    const volta = recuar(p, seguinte, r);
    partes.push(
      `${i === 0 ? 'M' : 'L'}${arredondar(ida.x)},${arredondar(ida.y)}`,
      `Q${arredondar(p.x)},${arredondar(p.y)} ${arredondar(volta.x)},${arredondar(volta.y)}`,
    );
  });
  return `${partes.join(' ')} Z`;
}

/** O ponto a distancia d de `de`, andando na direcao de `para`. */
function recuar(de: Ponto, para: Ponto, d: number): Ponto {
  const total = distancia(de, para);
  if (total === 0) return { ...de };
  return { x: de.x + ((para.x - de.x) / total) * d, y: de.y + ((para.y - de.y) / total) * d };
}

export function limites(pontos: Ponto[]): Retangulo {
  const xs = pontos.map((p) => p.x);
  const ys = pontos.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, largura: Math.max(...xs) - x, altura: Math.max(...ys) - y };
}

export function unirRetangulos(retangulos: Retangulo[]): Retangulo {
  if (retangulos.length === 0) return { x: 0, y: 0, largura: 0, altura: 0 };
  const pontos = retangulos.flatMap((r) => [
    { x: r.x, y: r.y },
    { x: r.x + r.largura, y: r.y + r.altura },
  ]);
  return limites(pontos);
}

/**
 * Distancia do centro ate a borda de um losango de semi-eixos (rx, ry) na
 * direcao (dx, dy). E a pegada de uma peca isometrica vista de cima.
 */
export function raioDoLosango(rx: number, ry: number, dx: number, dy: number): number {
  const comprimento = Math.hypot(dx, dy);
  if (comprimento === 0) return 0;
  const cos = Math.abs(dx / comprimento);
  const sen = Math.abs(dy / comprimento);
  return 1 / (cos / rx + sen / ry);
}

/**
 * Distancia do `centro` ate a borda de um poligono convexo, andando na direcao
 * (dx, dy). E onde uma ligacao deve parar: na borda real da peca, nao numa
 * aproximacao (um losango deixaria a seta entrar no rotulo).
 */
export function distanciaAteABorda(centro: Ponto, dx: number, dy: number, poligono: Ponto[]): number {
  const total = Math.hypot(dx, dy);
  if (total === 0 || poligono.length < 3) return 0;
  const ux = dx / total;
  const uy = dy / total;
  let melhor = Infinity;
  for (let i = 0; i < poligono.length; i++) {
    const a = poligono[i]!;
    const b = poligono[(i + 1) % poligono.length]!;
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const denominador = ux * ey - uy * ex;
    if (Math.abs(denominador) < 1e-9) continue;
    const t = ((a.x - centro.x) * ey - (a.y - centro.y) * ex) / denominador;
    const s = ((a.x - centro.x) * uy - (a.y - centro.y) * ux) / denominador;
    if (t >= 0 && s >= -1e-9 && s <= 1 + 1e-9) melhor = Math.min(melhor, t);
  }
  return Number.isFinite(melhor) ? melhor : 0;
}

/** Corta `inicio` px do comeco e `fim` px do final de um segmento. Segmento curto demais encolhe pelo meio. */
export function aparar(de: Ponto, para: Ponto, inicio: number, fim: number): [Ponto, Ponto] {
  const total = distancia(de, para);
  if (total <= inicio + fim + 8) {
    const meio = { x: (de.x + para.x) / 2, y: (de.y + para.y) / 2 };
    return [recuar(meio, de, 4), recuar(meio, para, 4)];
  }
  return [recuar(de, para, inicio), recuar(para, de, fim)];
}

export function comprimento(pontos: Ponto[]): number {
  let soma = 0;
  for (let i = 1; i < pontos.length; i++) soma += distancia(pontos[i - 1]!, pontos[i]!);
  return soma;
}

export function pontoMedio(a: Ponto, b: Ponto): Ponto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Triangulo da ponta de seta em `ponta`, apontando na direcao de `de` -> `ponta`. */
export function pontaDeSeta(de: Ponto, ponta: Ponto, tamanho = 9): Ponto[] {
  const total = distancia(de, ponta) || 1;
  const ux = (ponta.x - de.x) / total;
  const uy = (ponta.y - de.y) / total;
  const base = { x: ponta.x - ux * tamanho, y: ponta.y - uy * tamanho };
  const meia = tamanho * 0.55;
  return [ponta, { x: base.x - uy * meia, y: base.y + ux * meia }, { x: base.x + uy * meia, y: base.y - ux * meia }];
}

export interface Camera {
  x: number;
  y: number;
  escala: number;
}

/**
 * A camera que enquadra `caixa` no centro de uma janela, com margem, sem
 * passar de `escalaMaxima` (uma cena com uma peca so nao vira um close).
 * Aplicada como transform: translate(x, y) scale(escala), origem em 0 0.
 */
export function enquadrar(
  caixa: Retangulo,
  janela: { largura: number; altura: number },
  margem = 28,
  escalaMaxima = 1.35,
): Camera {
  const larguraUtil = Math.max(1, janela.largura - 2 * margem);
  const alturaUtil = Math.max(1, janela.altura - 2 * margem);
  const escala = Math.min(
    larguraUtil / Math.max(caixa.largura, 1),
    alturaUtil / Math.max(caixa.altura, 1),
    escalaMaxima,
  );
  const centroX = caixa.x + caixa.largura / 2;
  const centroY = caixa.y + caixa.altura / 2;
  return {
    x: janela.largura / 2 - centroX * escala,
    y: janela.altura / 2 - centroY * escala,
    escala,
  };
}

export function transformDaCamera(camera: Camera): string {
  return `translate(${arredondar(camera.x)}px, ${arredondar(camera.y)}px) scale(${camera.escala.toFixed(4)})`;
}

export function transladar(p: Ponto): string {
  return `translate(${arredondar(p.x)}px, ${arredondar(p.y)}px)`;
}
