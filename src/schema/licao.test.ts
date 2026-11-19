import { describe, expect, it } from 'vitest';
import { CenaSchema, LicaoSchema, type CenaFonte, type LicaoFonte } from './licao';

function cenaValida(): CenaFonte {
  return {
    foco: 'A',
    entidades: {
      a: { pos: [0, 0], rotulo: 'A' },
      b: { pos: [3, 0], rotulo: 'B' },
      c: { pos: [6, 0], rotulo: 'C' },
    },
    ligacoes: {
      'a-b': { de: 'a', para: 'b' },
      'b-c': { de: 'b', para: 'c' },
    },
    fluxos: [{ rota: ['a-b', 'b-c'] }],
  };
}

function licaoValida(): LicaoFonte {
  return {
    slug: 'exemplo',
    modulo: 'renderizacao',
    titulo: 'Exemplo',
    resumo: 'Uma licao de exemplo.',
    dificuldade: 'iniciante',
    minutos: 5,
    passos: [
      { id: 'a', titulo: 'A', narracao: 'Primeiro passo.', cena: cenaValida() },
      { id: 'b', titulo: 'B', narracao: 'Segundo passo.', cena: cenaValida() },
    ],
  };
}

describe('LicaoSchema', () => {
  it('aceita uma licao bem formada', () => {
    expect(() => LicaoSchema.parse(licaoValida())).not.toThrow();
  });

  it('preenche os defaults da cena e das entidades', () => {
    const licao = LicaoSchema.parse(licaoValida());
    const cena = licao.passos[0]!.cena;
    expect(cena.metricas).toEqual([]);
    expect(cena.entidades.a).toMatchObject({ tipo: 'bloco', cor: 'neutro', destaque: false, etiquetas: [] });
    expect(cena.fluxos[0]).toMatchObject({ tipo: 'requisicao', taxa: 0.8, volta: false, falha: 0 });
    expect(licao.fidelidade).toBe('modelo');
  });

  it('recusa uma licao com menos de dois passos', () => {
    const fonte = licaoValida();
    fonte.passos = [fonte.passos[0]!];
    expect(() => LicaoSchema.parse(fonte)).toThrow();
  });

  it('recusa um slug com maiuscula ou espaco', () => {
    const fonte = licaoValida();
    fonte.slug = 'Render Path';
    expect(() => LicaoSchema.parse(fonte)).toThrow();
  });

  it('recusa narracao vazia', () => {
    const fonte = licaoValida();
    fonte.passos[0]!.narracao = '';
    expect(() => LicaoSchema.parse(fonte)).toThrow();
  });
});

describe('CenaSchema', () => {
  it('recusa ligacao que aponta para entidade inexistente', () => {
    const cena = cenaValida();
    cena.ligacoes!['x'] = { de: 'a', para: 'fantasma' };
    expect(() => CenaSchema.parse(cena)).toThrow(/fantasma/);
  });

  it('recusa fluxo por ligacao inexistente', () => {
    const cena = cenaValida();
    cena.fluxos = [{ rota: ['a-z'] }];
    expect(() => CenaSchema.parse(cena)).toThrow(/a-z/);
  });

  it('recusa rota quebrada: o fim de uma ligacao tem que ser o comeco da proxima', () => {
    const cena = cenaValida();
    cena.fluxos = [{ rota: ['b-c', 'a-b'] }];
    expect(() => CenaSchema.parse(cena)).toThrow(/rota quebrada/);
  });

  it('recusa cena sem entidades e chance de falha fora de 0..1', () => {
    expect(() => CenaSchema.parse({ foco: 'x', entidades: {} })).toThrow();
    const cena = cenaValida();
    cena.fluxos = [{ rota: ['a-b'], falha: 1.5 }];
    expect(() => CenaSchema.parse(cena)).toThrow();
  });
});
