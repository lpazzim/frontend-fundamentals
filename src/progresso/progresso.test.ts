import { describe, expect, it } from 'vitest';
import {
  licaoConcluida,
  lerProgresso,
  passosVistos,
  registrarPasso,
  resumoDeProgresso,
} from './progresso';

describe('progresso', () => {
  it('registra passos sem repetir e em ordem', () => {
    let p = registrarPasso({}, 'a', 3);
    p = registrarPasso(p, 'a', 1);
    p = registrarPasso(p, 'a', 3);
    expect(p.a!.vistos).toEqual([1, 3]);
  });

  it('registrar um passo ja visto devolve o mesmo objeto (sem rerender a toa)', () => {
    const p = registrarPasso({}, 'a', 1);
    expect(registrarPasso(p, 'a', 1)).toBe(p);
  });

  it('a licao so conclui quando todos os passos foram vistos', () => {
    let p = registrarPasso({}, 'a', 1);
    p = registrarPasso(p, 'a', 2);
    expect(licaoConcluida(p, 'a', 3)).toBe(false);
    p = registrarPasso(p, 'a', 3);
    expect(licaoConcluida(p, 'a', 3)).toBe(true);
  });

  it('ignora passos alem do total (licao que encolheu)', () => {
    const p = registrarPasso({}, 'a', 9);
    expect(passosVistos(p, 'a', 3)).toBe(0);
  });

  it('resume para o menu: vazio, n/total ou check', () => {
    expect(resumoDeProgresso({}, 'a', 3)).toBe('');
    expect(resumoDeProgresso(registrarPasso({}, 'a', 1), 'a', 3)).toBe('1/3');
    let p = {};
    for (const n of [1, 2, 3]) p = registrarPasso(p, 'a', n);
    expect(resumoDeProgresso(p, 'a', 3)).toBe('✓');
  });
});

describe('lerProgresso', () => {
  const com = (valor: string | null) => ({ getItem: () => valor });

  it('le um progresso valido', () => {
    expect(lerProgresso(com('{"a":{"vistos":[1,2]}}'))).toEqual({ a: { vistos: [1, 2] } });
  });

  it('JSON corrompido, formato errado ou storage ausente viram progresso vazio', () => {
    expect(lerProgresso(com('{nao-e-json'))).toEqual({});
    expect(lerProgresso(com('{"a":{"vistos":["x"]}}'))).toEqual({});
    expect(lerProgresso(com(null))).toEqual({});
    expect(lerProgresso(undefined)).toEqual({});
  });

  it('storage que lanca (janela privada) nao derruba', () => {
    expect(
      lerProgresso({
        getItem: () => {
          throw new Error('bloqueado');
        },
      }),
    ).toEqual({});
  });
});
