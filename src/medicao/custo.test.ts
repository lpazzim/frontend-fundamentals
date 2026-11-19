import { describe, expect, it } from 'vitest';
import { estagioMaisCaro, estagiosReexecutados } from './custo';

describe('custo por propriedade', () => {
  it('classifica geometria como layout, cor como paint e transform/opacity como composite', () => {
    expect(estagioMaisCaro(['width'])).toBe('layout');
    expect(estagioMaisCaro(['background-color'])).toBe('paint');
    expect(estagioMaisCaro(['transform', 'opacity'])).toBe('composite');
  });

  it('com propriedades misturadas vale a mais cara', () => {
    expect(estagioMaisCaro(['opacity', 'background-color'])).toBe('paint');
    expect(estagioMaisCaro(['transform', 'width', 'color'])).toBe('layout');
  });

  it('estoura com propriedade desconhecida ou lista vazia, em vez de chutar', () => {
    expect(() => estagioMaisCaro(['cor-inventada'])).toThrow(/sem classificacao/);
    expect(() => estagioMaisCaro([])).toThrow();
  });

  it('voltar a um estagio re-executa ele e os seguintes', () => {
    expect(estagiosReexecutados('layout')).toEqual(['layout', 'paint', 'composite']);
    expect(estagiosReexecutados('paint')).toEqual(['paint', 'composite']);
    expect(estagiosReexecutados('composite')).toEqual(['composite']);
  });
});
