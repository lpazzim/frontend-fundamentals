import { useSyncExternalStore } from 'react';

/**
 * Os idiomas do Render Lab.
 *
 *  - textos da interface: um dicionario tipado por idioma (src/i18n/interface);
 *  - conteudo das licoes: escrito em portugues (src/licoes/pt-BR) e traduzido
 *    por sobreposicao de texto (src/licoes/<idioma>), sem duplicar a cena;
 *  - o idioma ativo mora aqui: escolha salva do leitor, senao o idioma do
 *    navegador, senao o padrao.
 *
 * Para adicionar um idioma: acrescente o codigo em IDIOMAS. O TypeScript passa
 * a exigir o dicionario da interface e as traducoes das licoes.
 */
export const IDIOMAS = ['pt-BR', 'en'] as const;
export type Idioma = (typeof IDIOMAS)[number];

/** O idioma em que o conteudo e escrito primeiro: a fonte da verdade do curriculo. */
export const IDIOMA_PADRAO = 'pt-BR' satisfies Idioma;
export type IdiomaTraduzido = Exclude<Idioma, typeof IDIOMA_PADRAO>;

const CHAVE = 'render-lab:idioma';

export function ehIdioma(valor: unknown): valor is Idioma {
  return typeof valor === 'string' && (IDIOMAS as readonly string[]).includes(valor);
}

/**
 * O primeiro idioma da lista do navegador que o app fala: 'en-US' casa com
 * 'en', 'pt-PT' casa com 'pt-BR' pelo prefixo. Nenhum casa: null.
 */
export function idiomaPreferido(preferencias: readonly string[]): Idioma | null {
  for (const preferencia of preferencias) {
    const exato = IDIOMAS.find((idioma) => idioma.toLowerCase() === preferencia.toLowerCase());
    if (exato) return exato;
    const prefixo = preferencia.split('-')[0]!.toLowerCase();
    const parecido = IDIOMAS.find((idioma) => idioma.split('-')[0]!.toLowerCase() === prefixo);
    if (parecido) return parecido;
  }
  return null;
}

function storage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined; // janela privada ou dados de site bloqueados
  }
}

function lerIdioma(): Idioma {
  try {
    const salvo = storage()?.getItem(CHAVE);
    if (ehIdioma(salvo)) return salvo;
  } catch {
    // sem storage: segue para o navegador
  }
  const doNavegador =
    typeof navigator === 'undefined' ? null : idiomaPreferido(navigator.languages?.length ? navigator.languages : [navigator.language]);
  return doNavegador ?? IDIOMA_PADRAO;
}

// ---- store externo: lido na primeira vez que alguem pergunta, trocado pelo seletor do topo ----

let atual: Idioma | null = null;
const ouvintes = new Set<() => void>();

/** O idioma ativo, fora de componente (loaders, inicializacao). */
export function idiomaAtivo(): Idioma {
  if (atual === null) atual = lerIdioma();
  return atual;
}

export function definirIdioma(idioma: Idioma): void {
  if (idioma === idiomaAtivo()) return;
  atual = idioma;
  try {
    storage()?.setItem(CHAVE, idioma);
  } catch {
    // sem persistencia: vale ate fechar a aba
  }
  if (typeof document !== 'undefined') document.documentElement.lang = idioma;
  for (const ouvinte of ouvintes) ouvinte();
}

/** Avisa quando o idioma muda. Devolve a funcao que cancela o aviso. */
export function assinarIdioma(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function useIdioma(): Idioma {
  return useSyncExternalStore(assinarIdioma, idiomaAtivo, () => IDIOMA_PADRAO);
}
