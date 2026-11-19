import { describe, expect, it } from 'vitest';
import { IDIOMAS } from '../i18n/idiomas';
import { licoesDoIdioma } from '../licoes';

/** Todas as licoes de todos os idiomas: um texto traduzido mais comprido tambem precisa caber. */
const licoes = IDIOMAS.flatMap((idioma) => licoesDoIdioma(idioma));
import { CenaSchema } from '../schema/licao';
import { planejarCena } from './plano';

describe('planejarCena', () => {
  const cena = CenaSchema.parse({
    foco: 'x',
    entidades: {
      a: { pos: [0, 0], rotulo: 'A' },
      b: { pos: [4, 0], rotulo: 'B', etiquetas: [{ texto: 'tag' }] },
      cartao: { tipo: 'cartao', pos: [0, 0, 9], rotulo: 'c' },
    },
    ligacoes: { 'a-b': { de: 'a', para: 'b' } },
  });
  const plano = planejarCena(cena);

  it('a ligacao comeca e termina fora das pecas, sem invadir', () => {
    const a = plano.pecas.get('a')!;
    const b = plano.pecas.get('b')!;
    const [inicio, fim] = plano.ligacoes.get('a-b')!.pontos;
    expect(inicio.x).toBeGreaterThan(a.posicao.x + a.raioX - 1);
    expect(fim.x).toBeLessThan(b.posicao.x - b.raioX + 1);
  });

  it('etiquetas aumentam a caixa para cima (a camera nao corta)', () => {
    const a = plano.pecas.get('a')!;
    const b = plano.pecas.get('b')!;
    expect(b.caixa.y).toBeLessThan(a.caixa.y);
  });

  it('um cartao em cima da placa fica numa camada acima dela', () => {
    expect(plano.pecas.get('cartao')!.camada).toBeGreaterThan(plano.pecas.get('a')!.camada);
  });
});

describe('cenas publicadas', () => {
  it('toda cena de toda licao tem enquadramento finito e cabe numa camera razoavel', () => {
    for (const licao of licoes) {
      for (const passo of licao.passos) {
        const { caixa } = planejarCena(passo.cena);
        const onde = `${licao.slug}/${passo.id}`;
        expect(Number.isFinite(caixa.largura) && caixa.largura > 0, onde).toBe(true);
        // Mais largo que isto e o texto fica pequeno demais num palco de ~600px.
        expect(caixa.largura, onde).toBeLessThan(900);
        expect(caixa.altura, onde).toBeLessThan(560);
      }
    }
  });
});
