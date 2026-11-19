import { describe, expect, it } from 'vitest';
import { licoes as completas, licoesDoIdioma } from '../licoes';
import { resumirLicao } from '../licoes/resumo';

const licoes = completas.map(resumirLicao);
import { buscarLicoes, normalizar } from './busca';

describe('busca', () => {
  it('normaliza acento e caixa', () => {
    expect(normalizar('Hidratação')).toBe('hidratacao');
  });

  it('busca vazia devolve o catalogo inteiro, na ordem', () => {
    expect(buscarLicoes(licoes, '  ')).toEqual(licoes);
  });

  it('acha por titulo sem exigir acento', () => {
    // "Hidratação" e o titulo de uma licao e o de um passo da licao seguinte.
    expect(buscarLicoes(licoes, 'hidratacao').map((l) => l.slug)).toEqual(['hidratacao', 'ilhas-e-resumabilidade']);
  });

  it('acha por titulo de passo', () => {
    expect(buscarLicoes(licoes, 'microtasks').map((l) => l.slug)).toContain('event-loop');
  });

  it('todas as palavras precisam casar', () => {
    expect(buscarLicoes(licoes, 'event inexistente')).toEqual([]);
  });

  it('acha por modulo', () => {
    const entrega = buscarLicoes(licoes, 'entrega');
    expect(entrega.length).toBeGreaterThan(0);
    expect(entrega.every((l) => l.modulo === 'entrega' || /entrega/i.test(l.resumo + l.titulo))).toBe(true);
  });

  it('busca no idioma do catalogo que recebe', () => {
    const emIngles = licoesDoIdioma('en').map(resumirLicao);
    expect(buscarLicoes(emIngles, 'hydration').map((l) => l.slug)).toContain('hidratacao');
    expect(buscarLicoes(emIngles, 'hidratacao')).toEqual([]);
  });
});
