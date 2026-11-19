import { describe, expect, it } from 'vitest';
import { LicaoSchema, MODULOS } from '../schema/licao';
import { acharLicao, licoes } from './index';

/**
 * Este e o teste que protege o conteudo: todo arquivo de licao passa pelo
 * schema no CI. Conteudo quebrado falha aqui, nao na tela do leitor.
 */
describe('catalogo de licoes', () => {
  it('tem ao menos uma licao', () => {
    expect(licoes.length).toBeGreaterThan(0);
  });

  it('valida toda licao publicada contra o schema', () => {
    for (const licao of licoes) {
      expect(() => LicaoSchema.parse(licao)).not.toThrow();
    }
  });

  it('nao repete slug', () => {
    const slugs = licoes.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('nao repete id de passo dentro da mesma licao', () => {
    for (const licao of licoes) {
      const ids = licao.passos.map((p) => p.id);
      expect(new Set(ids).size, `ids repetidos em ${licao.slug}`).toBe(ids.length);
    }
  });

  it('publica as licoes do curriculo, na ordem, agrupadas por modulo', () => {
    expect(licoes.map((l) => l.slug)).toEqual([
      // renderizacao
      'rendering-path',
      'reflow-repaint-composite',
      // execucao
      'event-loop',
      'vdom-reatividade',
      'modelos-de-renderizacao',
      'hidratacao',
      'ilhas-e-resumabilidade',
      // entrega
      'core-web-vitals',
      'carregamento-de-recursos',
      'code-splitting',
      // arquitetura
      'tipos-de-estado',
      'cache-cliente',
      'design-de-componentes',
      'padroes-de-composicao',
      // ferramentas
      'bundlers',
      'tree-shaking',
      'micro-frontends',
      // qualidade
      'estrategia-de-testes',
      'acessibilidade',
    ]);
  });

  it('todo modulo tem licoes, e as de um modulo ficam juntas no curriculo', () => {
    const ordem = licoes.map((l) => l.modulo).filter((m, i, todos) => m !== todos[i - 1]);
    expect(ordem).toEqual([...MODULOS]);
  });

  it('toda licao indica ao menos tres fontes para estudo, sem repetir', () => {
    for (const licao of licoes) {
      expect(licao.fontes.length, `fontes de ${licao.slug}`).toBeGreaterThanOrEqual(3);
      for (const fonte of licao.fontes) expect(fonte.url.startsWith('https://'), fonte.url).toBe(true);
    }
  });

  it('so a licao 2 se declara medida: as demais sao modelos e dizem isso', () => {
    const medidas = licoes.filter((l) => l.fidelidade === 'medido').map((l) => l.slug);
    expect(medidas).toEqual(['reflow-repaint-composite']);
  });

  it('a licao 2 existe e declara o laboratorio de custo', () => {
    const licao = acharLicao('reflow-repaint-composite');
    expect(licao?.laboratorio).toBe('custo-de-renderizacao');
    expect(licao?.passos.length).toBeGreaterThanOrEqual(4);
  });

  it('acha uma licao pelo slug e devolve undefined para slug desconhecido', () => {
    expect(acharLicao('rendering-path')?.slug).toBe('rendering-path');
    expect(acharLicao('nao-existe')).toBeUndefined();
  });
});
