import { describe, expect, it } from 'vitest';
import { CenaSchema, FluxoSchema, type FluxoFonte } from '../schema/licao';
import { FATOR_DE_VELOCIDADE, VELOCIDADE, planejarViagem, sementeDe, sorteador } from './fluxos';
import { planejarCena } from './plano';

const cena = CenaSchema.parse({
  foco: 'x',
  entidades: {
    a: { pos: [0, 0], rotulo: 'A' },
    b: { pos: [4, 0], rotulo: 'B' },
    c: { pos: [8, 0], rotulo: 'C' },
  },
  ligacoes: { 'a-b': { de: 'a', para: 'b' }, 'b-c': { de: 'b', para: 'c' } },
});
const { ligacoes } = planejarCena(cena);
const fluxo = (f: FluxoFonte) => FluxoSchema.parse(f);
const nuncaFalha = () => 0.99;

describe('sorteador', () => {
  it('a mesma semente da a mesma sequencia, sementes diferentes nao', () => {
    const a = sorteador(42);
    const b = sorteador(42);
    const c = sorteador(43);
    const sa = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(sa);
    expect([c(), c(), c()]).not.toEqual(sa);
    expect(sa.every((n) => n >= 0 && n < 1)).toBe(true);
  });

  it('sementeDe e estavel por texto', () => {
    expect(sementeDe('event-loop:3')).toBe(sementeDe('event-loop:3'));
    expect(sementeDe('event-loop:3')).not.toBe(sementeDe('event-loop:4'));
  });
});

describe('planejarViagem', () => {
  it('ida por varias ligacoes, na ordem, terminando no fim da ultima', () => {
    const v = planejarViagem(fluxo({ rota: ['a-b', 'b-c'] }), ligacoes, nuncaFalha)!;
    expect(v.trechos.map((t) => t.ligacao)).toEqual(['a-b', 'b-c']);
    expect(v.trechos.every((t) => !t.volta)).toBe(true);
    expect(v.fim).toEqual(ligacoes.get('b-c')!.pontos[1]);
    expect(v.desfecho).toBe('ok');
  });

  it('a duracao segue a velocidade do tipo de pacote', () => {
    const comum = planejarViagem(fluxo({ rota: ['a-b'] }), ligacoes, nuncaFalha)!;
    const lento = planejarViagem(fluxo({ rota: ['a-b'], tipo: 'lento' }), ligacoes, nuncaFalha)!;
    const [p0, p1] = ligacoes.get('a-b')!.pontos;
    expect(comum.trechos[0]!.duracao).toBeCloseTo((Math.hypot(p1.x - p0.x, p1.y - p0.y) / VELOCIDADE) * 1000);
    expect(lento.trechos[0]!.duracao / comum.trechos[0]!.duracao).toBeCloseTo(1 / FATOR_DE_VELOCIDADE.lento);
  });

  it('com volta, refaz a rota ao contrario como resposta e termina na origem', () => {
    const v = planejarViagem(fluxo({ rota: ['a-b', 'b-c'], volta: true, segura: 0.5 }), ligacoes, nuncaFalha)!;
    expect(v.trechos.map((t) => [t.ligacao, t.volta])).toEqual([
      ['a-b', false],
      ['b-c', false],
      ['b-c', true],
      ['a-b', true],
    ]);
    expect(v.trechos[2]!.de).toEqual(v.trechos[1]!.para);
    expect(v.fim).toEqual(ligacoes.get('a-b')!.pontos[0]);
    expect(v.segura).toBe(500);
  });

  it('falha no destino: nao volta e termina onde quebrou', () => {
    const v = planejarViagem(fluxo({ rota: ['a-b'], volta: true, falha: 1 }), ligacoes, () => 0.1)!;
    expect(v.desfecho).toBe('falha');
    expect(v.trechos).toHaveLength(1);
    expect(v.fim).toEqual(ligacoes.get('a-b')!.pontos[1]);
  });

  it('rota com ligacao fora da cena devolve null em vez de quebrar', () => {
    expect(planejarViagem(fluxo({ rota: ['x-y'] }), ligacoes, nuncaFalha)).toBeNull();
  });
});
