import type { ResumoDeLicao } from '../licoes/resumo';

/** Minusculas e sem acento: "hidratacao" acha "Hidratação". */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function textoPesquisavel(licao: ResumoDeLicao): string {
  return normalizar([licao.titulo, licao.resumo, licao.modulo, ...licao.passos].join(' '));
}

/**
 * Cada palavra da busca precisa aparecer em algum lugar da licao (titulo,
 * resumo, modulo ou titulo de passo), no idioma do catalogo recebido. Busca
 * vazia devolve tudo, na ordem do catalogo.
 */
export function buscarLicoes<T extends ResumoDeLicao>(licoes: T[], termo: string): T[] {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return licoes;
  return licoes.filter((licao) => {
    const texto = textoPesquisavel(licao);
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
