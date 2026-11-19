import { describe, expect, it } from 'vitest';
import {
  ehPrimeiro,
  ehUltimo,
  normalizarPasso,
  passoAnterior,
  proximoPasso,
} from './passo';

describe('normalizarPasso', () => {
  it('aceita um passo valido vindo da URL', () => {
    expect(normalizarPasso(6, '3')).toBe(3);
  });

  it('prende no primeiro quando o valor e menor que 1', () => {
    expect(normalizarPasso(6, '0')).toBe(1);
    expect(normalizarPasso(6, '-4')).toBe(1);
  });

  it('prende no ultimo quando o valor passa do total', () => {
    expect(normalizarPasso(6, '99')).toBe(6);
  });

  it('cai no primeiro quando a URL traz lixo', () => {
    expect(normalizarPasso(6, 'abc')).toBe(1);
    expect(normalizarPasso(6, '')).toBe(1);
    expect(normalizarPasso(6, Number.NaN)).toBe(1);
  });

  it('descarta a parte fracionaria', () => {
    expect(normalizarPasso(6, 2.9)).toBe(2);
  });

  it('nao estoura quando a licao esta vazia', () => {
    expect(normalizarPasso(0, '3')).toBe(1);
  });
});

describe('navegacao', () => {
  it('avanca ate o ultimo e para', () => {
    expect(proximoPasso(6, 3)).toBe(4);
    expect(proximoPasso(6, 6)).toBe(6);
  });

  it('volta ate o primeiro e para', () => {
    expect(passoAnterior(3)).toBe(2);
    expect(passoAnterior(1)).toBe(1);
  });

  it('reconhece as pontas', () => {
    expect(ehPrimeiro(1)).toBe(true);
    expect(ehPrimeiro(2)).toBe(false);
    expect(ehUltimo(6, 6)).toBe(true);
    expect(ehUltimo(6, 5)).toBe(false);
  });
});
