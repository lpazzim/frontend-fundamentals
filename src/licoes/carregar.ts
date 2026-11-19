import { IDIOMA_PADRAO, type Idioma } from '../i18n/idiomas';
import { LicaoSchema, type Licao, type LicaoFonte } from '../schema/licao';
import { traduzirLicao, type PacoteDeIdioma, type TraducaoDeLicao } from './traducao';

/**
 * Carregamento sob demanda: cada arquivo de licao (e cada traducao) vira um
 * chunk proprio, baixado so quando o leitor abre aquela licao. E a licao de
 * code splitting aplicada a este projeto: o bundle inicial leva o catalogo
 * (titulos e resumos), nao as cenas e narracoes de 19 licoes em dois idiomas.
 */
const ORIGINAIS = import.meta.glob<Record<string, unknown>>(['./pt-BR/*.ts', '!./pt-BR/index.ts']);
const TRADUCOES = import.meta.glob<{ default: TraducaoDeLicao }>([
  './*/*.ts',
  '!./pt-BR/*.ts',
  '!./*/index.ts',
  '!./*/termos.ts',
]);
const PACOTES = import.meta.glob<{ default: PacoteDeIdioma }>('./*/termos.ts');

function ehLicaoFonte(valor: unknown): valor is LicaoFonte {
  return typeof valor === 'object' && valor !== null && 'slug' in valor && 'passos' in valor;
}

async function montar(slug: string, idioma: Idioma): Promise<Licao | null> {
  const carregarOriginal = ORIGINAIS[`./${IDIOMA_PADRAO}/${slug}.ts`];
  if (!carregarOriginal) return null;
  // As tres partes viajam em paralelo: original, traducao e termos do idioma.
  const traducao = idioma === IDIOMA_PADRAO ? undefined : TRADUCOES[`./${idioma}/${slug}.ts`]?.();
  const pacote = idioma === IDIOMA_PADRAO ? undefined : PACOTES[`./${idioma}/termos.ts`]?.();
  const modulo = await carregarOriginal();
  const fonte = Object.values(modulo).find(ehLicaoFonte);
  if (!fonte) throw new Error(`o arquivo da licao ${slug} nao exporta uma licao`);
  const original = LicaoSchema.parse(fonte);
  if (!traducao || !pacote) return original;
  const [{ default: texto }, { default: termos }] = await Promise.all([traducao, pacote]);
  return LicaoSchema.parse(traduzirLicao(original, texto, termos).licao);
}

const carregadas = new Map<string, Promise<Licao | null>>();
/** As que ja chegaram, para a pagina ler sem suspender entre um passo e outro. */
const prontas = new Map<string, Licao | null>();

/** A licao completa num idioma, ou null se o slug nao existe. Cada par licao/idioma carrega uma vez. */
export function carregarLicao(slug: string, idioma: Idioma): Promise<Licao | null> {
  const chave = `${idioma}:${slug}`;
  let promessa = carregadas.get(chave);
  if (!promessa) {
    promessa = montar(slug, idioma);
    promessa.then((licao) => prontas.set(chave, licao), () => undefined);
    // Falha de rede nao fica em cache: a proxima tentativa baixa de novo.
    promessa.catch(() => carregadas.delete(chave));
    carregadas.set(chave, promessa);
  }
  return promessa;
}

/** A licao se ja chegou: Licao, null (slug inexistente) ou undefined (ainda nao carregou). */
export function licaoCarregada(slug: string, idioma: Idioma): Licao | null | undefined {
  return prontas.get(`${idioma}:${slug}`);
}
