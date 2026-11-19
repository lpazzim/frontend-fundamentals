/**
 * Navegacao entre passos. Tudo aqui e funcao pura: o passo atual mora na URL,
 * nao em estado de componente, entao estas funcoes nunca tocam no React.
 *
 * Convencao: passos sao 1-based, para bater com o que o leitor ve na tela.
 */

/** Converte o que veio da URL num passo valido. Qualquer lixo vira 1. */
export function normalizarPasso(total: number, bruto: string | number): number {
  if (total < 1) return 1;
  const n = typeof bruto === 'number' ? bruto : Number.parseInt(bruto, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.trunc(n), 1), total);
}

export function proximoPasso(total: number, atual: number): number {
  return Math.min(atual + 1, total);
}

export function passoAnterior(atual: number): number {
  return Math.max(atual - 1, 1);
}

export function ehPrimeiro(atual: number): boolean {
  return atual <= 1;
}

export function ehUltimo(total: number, atual: number): boolean {
  return atual >= total;
}
