import { describe, expect, it } from 'vitest';
import { IDIOMAS } from '../i18n/idiomas';
import { CATALOGO } from './catalogo.gerado';
import { carregarLicao } from './carregar';
import { licoesDoIdioma } from './index';
import { fonteDoCatalogo, resumirLicao, type Catalogo } from './resumo';

describe('catalogo gerado', () => {
  it('esta em dia com as licoes e traducoes (para atualizar: npm run catalogo)', async () => {
    const catalogo = Object.fromEntries(IDIOMAS.map((idioma) => [idioma, licoesDoIdioma(idioma).map(resumirLicao)])) as Catalogo;
    await expect(fonteDoCatalogo(catalogo)).toMatchFileSnapshot('./catalogo.gerado.ts');
  });

  it('tem as mesmas licoes, na mesma ordem, em todo idioma', () => {
    const slugs = CATALOGO['pt-BR'].map((l) => l.slug);
    for (const idioma of IDIOMAS) expect(CATALOGO[idioma].map((l) => l.slug)).toEqual(slugs);
  });
});

describe('carregamento sob demanda', () => {
  it('carrega a licao no idioma pedido, igual a do conteudo completo', async () => {
    for (const idioma of IDIOMAS) {
      const carregada = await carregarLicao('rendering-path', idioma);
      expect(carregada).toEqual(licoesDoIdioma(idioma).find((l) => l.slug === 'rendering-path'));
    }
    expect((await carregarLicao('rendering-path', 'en'))?.titulo).toBe('How the browser builds the page');
  });

  it('devolve null para slug desconhecido e reaproveita o que ja carregou', async () => {
    expect(await carregarLicao('nao-existe', 'pt-BR')).toBeNull();
    expect(carregarLicao('event-loop', 'en')).toBe(carregarLicao('event-loop', 'en'));
  });
});
