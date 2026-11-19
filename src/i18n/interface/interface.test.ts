import { describe, expect, it } from 'vitest';
import { IDIOMA_PADRAO, IDIOMAS, ehIdioma } from '../idiomas';
import { textos } from './index';

/** Caminhos de todas as folhas de um dicionario: "menu.curso", "licao.fidelidade.medido.rotulo"... */
function chaves(objeto: object, prefixo = ''): string[] {
  return Object.entries(objeto).flatMap(([chave, valor]) =>
    valor && typeof valor === 'object' ? chaves(valor, `${prefixo}${chave}.`) : [`${prefixo}${chave}`],
  );
}

describe('dicionarios da interface', () => {
  it('todo idioma declarado tem dicionario, com as mesmas chaves do padrao', () => {
    const referencia = chaves(textos(IDIOMA_PADRAO)).sort();
    for (const idioma of IDIOMAS) {
      expect(chaves(textos(idioma)).sort(), idioma).toEqual(referencia);
    }
  });

  it('nenhum texto vazio', () => {
    for (const idioma of IDIOMAS) {
      const t = textos(idioma);
      const folhas = chaves(t).map((caminho) => caminho.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], t));
      for (const folha of folhas) {
        if (typeof folha === 'string') expect(folha.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('frases com numero tratam o singular', () => {
    const t = textos('pt-BR');
    expect(t.menu.totalDeLicoes(1)).toBe('1 lição');
    expect(t.menu.totalDeLicoes(19)).toBe('19 lições');
    expect(t.licao.passos(1)).toBe('1 passo');
    expect(t.fontes.total(5)).toBe('5 fontes');
  });

  it('o codigo do dicionario e o do idioma', () => {
    for (const idioma of IDIOMAS) expect(textos(idioma).idioma.codigo).toBe(idioma);
    expect(ehIdioma('pt-BR')).toBe(true);
    expect(ehIdioma('xx')).toBe(false);
  });
});
