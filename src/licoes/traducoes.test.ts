import { describe, expect, it } from 'vitest';
import { IDIOMA_PADRAO, IDIOMAS, type IdiomaTraduzido } from '../i18n/idiomas';
import { estruturaDaLicao } from './estrutura';
import { TRADUCOES, licoes, licoesDoIdioma } from './index';
import { parecePortugues, traduzirLicao } from './traducao';

/**
 * Garantias das traducoes: troca texto, nao geometria; nada fica pela metade;
 * e nenhum texto em portugues escapa para a versao traduzida.
 */
const traduzidos = IDIOMAS.filter((idioma): idioma is IdiomaTraduzido => idioma !== IDIOMA_PADRAO);

describe('traduzirLicao', () => {
  const original = licoes[0]!;
  const { pacote, licoes: traducoes } = TRADUCOES.en;

  it('aponta passo, nota e objetivo que faltam', () => {
    const incompleta = { ...traducoes[original.slug]!, passos: {}, objetivos: [] };
    const { pendencias } = traduzirLicao(original, incompleta, pacote);
    expect(pendencias.some((p) => p.startsWith('objetivos'))).toBe(true);
    expect(pendencias.some((p) => p.startsWith('passo sem traducao'))).toBe(true);
    expect(pendencias.some((p) => p.startsWith('nota sem traducao'))).toBe(true);
  });

  it('mantem a geometria da cena', () => {
    const { licao } = traduzirLicao(original, traducoes[original.slug]!, pacote);
    expect(estruturaDaLicao(licao)).toEqual(estruturaDaLicao(original));
  });

  it('ajusta a virgula decimal de um termo sem traducao', () => {
    expect(pacote.ajustar?.('0,4 s')).toBe('0.4 s');
  });

  it('reconhece texto que parece portugues', () => {
    expect(parecePortugues('só repassa')).toBe(true);
    expect(parecePortugues('cópia remota')).toBe(true);
    expect(parecePortugues('useState')).toBe(false);
    expect(parecePortugues('A D C B')).toBe(false);
  });
});

describe('catalogo por idioma', () => {
  for (const idioma of traduzidos) {
    const { pacote, licoes: traducoes } = TRADUCOES[idioma];

    it(`${idioma}: toda licao do curriculo tem traducao, e nenhuma traducao sobra`, () => {
      expect(Object.keys(traducoes).sort()).toEqual(licoes.map((l) => l.slug).sort());
    });

    it(`${idioma}: nenhuma traducao esta incompleta`, () => {
      const pendentes: string[] = [];
      for (const original of licoes) {
        const traducao = traducoes[original.slug];
        if (!traducao) continue;
        for (const p of traduzirLicao(original, traducao, pacote).pendencias) pendentes.push(`${original.slug}: ${p}`);
      }
      expect(pendentes).toEqual([]);
    });

    it(`${idioma}: nenhum texto curto em portugues passou sem traducao`, () => {
      const escaparam = new Set<string>();
      for (const original of licoes) {
        const traducao = traducoes[original.slug];
        if (!traducao) continue;
        for (const termo of traduzirLicao(original, traducao, pacote).semTraducao) {
          if (parecePortugues(termo)) escaparam.add(termo);
        }
      }
      expect([...escaparam].sort()).toEqual([]);
    });

    it(`${idioma}: a cena traduzida e a mesma cena`, () => {
      const traduzidas = licoesDoIdioma(idioma);
      licoes.forEach((original, i) => {
        expect(estruturaDaLicao(traduzidas[i]!), `${idioma}/${original.slug}`).toEqual(estruturaDaLicao(original));
      });
    });
  }
});
