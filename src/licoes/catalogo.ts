import { useIdioma, type Idioma } from '../i18n/idiomas';
import { CATALOGO } from './catalogo.gerado';
import type { ResumoDeLicao } from './resumo';

export type { ResumoDeLicao } from './resumo';

/**
 * O catalogo leve que o app carrega sempre: titulo, resumo e titulos dos
 * passos de cada licao em cada idioma. A licao completa vem sob demanda
 * (src/licoes/carregar.ts).
 */
export function catalogoDoIdioma(idioma: Idioma): ResumoDeLicao[] {
  return CATALOGO[idioma];
}

export function useCatalogo(): ResumoDeLicao[] {
  return catalogoDoIdioma(useIdioma());
}
