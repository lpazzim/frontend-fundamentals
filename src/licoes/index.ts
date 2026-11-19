import { IDIOMA_PADRAO, type Idioma, type IdiomaTraduzido } from '../i18n/idiomas';
import { LicaoSchema, type Licao } from '../schema/licao';
import { pacoteEn, traducoesEn } from './en';
import { licoesPtBR } from './pt-BR';
import { traduzirLicao, type PacoteDeIdioma, type TraducaoDeLicao } from './traducao';

/**
 * O conteudo completo, carregado de uma vez. Serve aos testes, ao e2e e a
 * geracao do catalogo: o app NAO importa este modulo (ele carrega cada licao
 * sob demanda por src/licoes/carregar.ts), senao todas as licoes de todos os
 * idiomas voltariam para o bundle inicial.
 *
 * O portugues e a fonte da verdade do curriculo: define quais licoes existem,
 * em que ordem e com que cena. Os outros idiomas trazem so texto.
 */
export interface TraducoesDoIdioma {
  pacote: PacoteDeIdioma;
  licoes: Record<string, TraducaoDeLicao>;
}

export const TRADUCOES: Record<IdiomaTraduzido, TraducoesDoIdioma> = {
  en: { pacote: pacoteEn, licoes: traducoesEn },
};

const porIdioma = new Map<Idioma, Licao[]>();

/** Todas as licoes num idioma, na ordem do curriculo. Licao sem traducao aparece no idioma padrao. */
export function licoesDoIdioma(idioma: Idioma): Licao[] {
  const pronto = porIdioma.get(idioma);
  if (pronto) return pronto;
  const originais = licoesPtBR.map((fonte) => LicaoSchema.parse(fonte));
  const lista =
    idioma === IDIOMA_PADRAO
      ? originais
      : originais.map((original) => {
          const { pacote, licoes: traducoes } = TRADUCOES[idioma];
          const traducao = traducoes[original.slug];
          return traducao ? LicaoSchema.parse(traduzirLicao(original, traducao, pacote).licao) : original;
        });
  porIdioma.set(idioma, lista);
  return lista;
}

/** O catalogo no idioma padrao: a ordem do curriculo. */
export const licoes: Licao[] = licoesDoIdioma(IDIOMA_PADRAO);

export function acharLicao(slug: string, idioma: Idioma = IDIOMA_PADRAO): Licao | undefined {
  return licoesDoIdioma(idioma).find((licao) => licao.slug === slug);
}
