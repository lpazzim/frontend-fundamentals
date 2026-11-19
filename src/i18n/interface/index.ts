import { idiomaAtivo, useIdioma, type Idioma } from '../idiomas';
import { en } from './en';
import { ptBR, type TextosDaInterface } from './pt-BR';

export type { TextosDaInterface } from './pt-BR';

/**
 * Um dicionario por idioma. `Record<Idioma, ...>` faz o TypeScript exigir a
 * entrada de cada idioma novo em IDIOMAS, e `TextosDaInterface` exige que ela
 * tenha todas as chaves do portugues. Os dois juntos pesam poucos kB: ficam no
 * bundle inicial, para a troca de idioma ser instantanea.
 */
const DICIONARIOS: Record<Idioma, TextosDaInterface> = {
  'pt-BR': ptBR,
  en,
};

/** Os textos de um idioma. Fora de componente (testes, constantes), passe o idioma. */
export function textos(idioma: Idioma = idiomaAtivo()): TextosDaInterface {
  return DICIONARIOS[idioma];
}

/** Os textos do idioma ativo, para componentes. */
export function useTextos(): TextosDaInterface {
  return textos(useIdioma());
}
