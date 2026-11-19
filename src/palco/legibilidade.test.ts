import { describe, expect, it } from 'vitest';
import { IDIOMAS } from '../i18n/idiomas';
import { licoesDoIdioma } from '../licoes';

/** Todas as licoes de todos os idiomas: um texto traduzido mais comprido tambem precisa caber. */
const licoes = IDIOMAS.flatMap((idioma) => licoesDoIdioma(idioma));
import { CenaSchema, type CenaFonte } from '../schema/licao';
import { dentro, problemasDeLegibilidade, sobrepoem } from './legibilidade';
import { planejarCena } from './plano';

const quadrado = (x: number, y: number, l = 10) => [
  { x, y },
  { x: x + l, y },
  { x: x + l, y: y + l },
  { x, y: y + l },
];

describe('geometria do detector', () => {
  it('sobrepoem: separados, encostados e cruzados', () => {
    expect(sobrepoem(quadrado(0, 0), quadrado(20, 0))).toBe(false);
    expect(sobrepoem(quadrado(0, 0), quadrado(10, 0))).toBe(false); // so encostam
    expect(sobrepoem(quadrado(0, 0), quadrado(5, 5))).toBe(true);
  });

  it('sobrepoem funciona com um segmento (ligacao) contra um poligono', () => {
    expect(sobrepoem([{ x: -5, y: 5 }, { x: 15, y: 5 }], quadrado(0, 0))).toBe(true);
    expect(sobrepoem([{ x: -5, y: 20 }, { x: 15, y: 20 }], quadrado(0, 0))).toBe(false);
  });

  it('dentro, com e sem folga', () => {
    expect(dentro({ x: 5, y: 5 }, quadrado(0, 0))).toBe(true);
    expect(dentro({ x: 11, y: 5 }, quadrado(0, 0))).toBe(false);
    expect(dentro({ x: 11, y: 5 }, quadrado(0, 0), 2)).toBe(true);
  });
});

function problemas(fonte: CenaFonte) {
  return problemasDeLegibilidade(planejarCena(CenaSchema.parse(fonte)));
}

describe('problemasDeLegibilidade', () => {
  it('uma cena espacada nao tem problema', () => {
    expect(
      problemas({
        foco: 'x',
        entidades: { a: { pos: [0, 0], rotulo: 'A' }, b: { pos: [4, 0], rotulo: 'B' } },
        ligacoes: { 'a-b': { de: 'a', para: 'b', rotulo: 'pede' } },
      }),
    ).toEqual([]);
  });

  it('acusa peca sobre peca e ligacao curta demais', () => {
    const p = problemas({
      foco: 'x',
      entidades: { a: { pos: [0, 0], rotulo: 'A' }, b: { pos: [1, 0], rotulo: 'B' } },
      ligacoes: { 'a-b': { de: 'a', para: 'b' } },
    });
    expect(p).toContain('peça a cobre a peça b');
    expect(p.some((x) => x.includes('curta demais'))).toBe(true);
  });

  it('acusa rotulo que vaza da peca', () => {
    expect(problemas({ foco: 'x', entidades: { a: { pos: [0, 0], rotulo: 'um nome comprido demais para o bloco' } } })).toContain(
      'o rótulo de a vaza da peça',
    );
  });

  it('acusa ligacao atravessando uma terceira peca', () => {
    const p = problemas({
      foco: 'x',
      entidades: {
        a: { pos: [0, 0], rotulo: 'A' },
        meio: { pos: [3, 0], rotulo: 'M' },
        b: { pos: [6, 0], rotulo: 'B' },
      },
      ligacoes: { 'a-b': { de: 'a', para: 'b' } },
    });
    expect(p).toContain('ligação a-b atravessa a peça meio');
  });

  it('um cartao apoiado numa placa nao conta como sobreposicao', () => {
    expect(
      problemas({
        foco: 'x',
        entidades: {
          placa: { tipo: 'placa', pos: [0, 0], rotulo: 'Fila', tamanho: [3, 2] },
          cartao: { tipo: 'cartao', pos: [0, 0, 9], rotulo: 'cb' },
        },
      }),
    ).toEqual([]);
  });
});

describe('ordem de pintura', () => {
  it('um cartao na ponta de tras de uma placa e pintado por cima dela, nao escondido', () => {
    const plano = planejarCena(
      CenaSchema.parse({
        foco: 'x',
        entidades: {
          pagina: { tipo: 'placa', pos: [0, 0.6], rotulo: 'Página', tamanho: [6, 2.4] },
          // ponta de tras: linha menor que a da placa
          hero: { tipo: 'cartao', pos: [-0.95, -0.35, 9], rotulo: 'hero' },
        },
      }),
    );
    expect(plano.pecas.get('hero')!.camada).toBeGreaterThan(plano.pecas.get('pagina')!.camada);
    expect(problemasDeLegibilidade(plano)).toEqual([]);
  });
});

describe('cenas publicadas', () => {
  it('nenhum passo de nenhuma licao tem texto sobre texto, peca sobre peca ou ligacao atravessando', () => {
    const todos: string[] = [];
    for (const licao of licoes) {
      for (const passo of licao.passos) {
        for (const problema of problemasDeLegibilidade(planejarCena(passo.cena))) {
          todos.push(`${licao.slug}/${passo.id}: ${problema}`);
        }
      }
    }
    expect(todos).toEqual([]);
  });
});
