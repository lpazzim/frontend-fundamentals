import { describe, expect, it } from 'vitest';
import { CenaSchema, type CenaFonte } from '../schema/licao';
import { TEMPOS, planejarTransicao } from './coreografia';
import { planejarCena } from './plano';

function plano(fonte: CenaFonte) {
  return planejarCena(CenaSchema.parse(fonte));
}

const base: CenaFonte = {
  foco: 'x',
  entidades: {
    a: { pos: [0, 0], rotulo: 'A' },
    b: { pos: [3, 0], rotulo: 'B' },
  },
  ligacoes: { 'a-b': { de: 'a', para: 'b' } },
};

describe('planejarTransicao', () => {
  it('na primeira cena tudo entra, escalonado, e as ligacoes esperam as pontas', () => {
    const t = planejarTransicao(null, plano(base));
    expect(t.saem).toEqual([]);
    expect(t.entram.map((e) => e.atraso)).toEqual([0, TEMPOS.escalonamento]);
    const ligacao = t.ligacoesEntram[0]!;
    expect(ligacao.atraso).toBeGreaterThanOrEqual(t.entram[1]!.atraso);
    expect(t.camera.duracao).toBe(0); // sem camera anterior, nao ha de onde animar
  });

  it('a mesma cena de novo nao anima nada', () => {
    const t = planejarTransicao(plano(base), plano(base));
    expect(t.total).toBe(0);
  });

  it('fases: sai primeiro, depois move, depois entra', () => {
    const depois: CenaFonte = {
      foco: 'x',
      entidades: {
        b: { pos: [1, 1], rotulo: 'B' }, // moveu
        c: { pos: [5, 0], rotulo: 'C' }, // entrou
      },
    };
    const t = planejarTransicao(plano(base), plano(depois));
    expect(t.saem.map((s) => s.id)).toEqual(['a']);
    expect(t.movem.map((m) => m.id)).toEqual(['b']);
    expect(t.entram.map((e) => e.id)).toEqual(['c']);
    expect(t.movem[0]!.atraso).toBeCloseTo(TEMPOS.saida * 0.55);
    expect(t.entram[0]!.atraso).toBeGreaterThan(t.movem[0]!.atraso);
    // a ligacao a-b sumiu junto com a
    expect(t.ligacoesSaem.map((l) => l.id)).toEqual(['a-b']);
    expect(t.total).toBeGreaterThanOrEqual(t.entram[0]!.atraso + TEMPOS.entrada);
  });

  it('mesma posicao com conteudo diferente pulsa em vez de mover', () => {
    const depois: CenaFonte = { ...base, entidades: { ...base.entidades, a: { pos: [0, 0], rotulo: 'A', destaque: true } } };
    const t = planejarTransicao(plano(base), plano(depois));
    expect(t.movem).toEqual([]);
    expect(t.mudam.map((m) => m.id)).toEqual(['a']);
  });

  it('ligacao com outro estilo ou rotulo e redesenhada', () => {
    const depois: CenaFonte = { ...base, ligacoes: { 'a-b': { de: 'a', para: 'b', estilo: 'desligada' } } };
    const t = planejarTransicao(plano(base), plano(depois));
    expect(t.ligacoesSaem.map((l) => l.id)).toEqual(['a-b']);
    expect(t.ligacoesEntram.map((l) => l.id)).toEqual(['a-b']);
  });
});
