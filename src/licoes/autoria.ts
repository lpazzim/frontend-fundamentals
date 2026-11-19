/**
 * Ajudantes de autoria das cenas. Nao sao conteudo: so encurtam os arquivos de
 * licao, do mesmo jeito que o designed-to-scale usa construtores por licao.
 */

type Pos = [number, number] | [number, number, number];

/**
 * Espacamento entre pecas. Posicoes escritas com g() sao multiplicadas por
 * isto: ligacoes ficam compridas o bastante para a seta e o rotulo, e
 * etiquetas nao encostam no vizinho. O detector de legibilidade
 * (src/palco/legibilidade.ts) confere o resultado em todo passo.
 */
export const ESPACO = 1.5;

/**
 * Posicao pela grade isometrica: gx anda na diagonal para baixo-direita,
 * gy na diagonal para baixo-esquerda. Pecas alinhadas num eixo da grade
 * ficam "no chao" do desenho, como na referencia. Converte para [coluna, linha].
 */
export function g(gx: number, gy: number, altura?: number): Pos {
  const coluna = ((gx - gy) / 2) * ESPACO;
  const linha = ((gx + gy) / 2) * ESPACO;
  return altura === undefined ? [coluna, linha] : [coluna, linha, altura];
}

/** Altura (px) que poe um cartao em cima de uma placa. */
export const SOBRE_A_PLACA = 9;
/** Altura que poe um cartao em cima de um bloco. */
export const SOBRE_O_BLOCO = 27;

/**
 * Um cartao em cima de outra peca: a posicao da base mais um deslocamento em
 * celulas (sem o ESPACO, para o cartao nao escorregar para fora da base).
 */
export function sobre(base: Pos, dgx = 0, dgy = 0, altura = SOBRE_A_PLACA): Pos {
  return [base[0] + (dgx - dgy) / 2, base[1] + (dgx + dgy) / 2, altura];
}
