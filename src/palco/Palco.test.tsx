import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CenaSchema } from '../schema/licao';
import { Palco } from './Palco';

const cena = CenaSchema.parse({
  foco: 'Cache',
  entidades: {
    a: { pos: [0, 0], rotulo: 'Tela' },
    b: { pos: [4, 0], rotulo: 'Cache' },
  },
  ligacoes: { 'a-b': { de: 'a', para: 'b' } },
  fluxos: [{ rota: ['a-b'], volta: true, falha: 0.2 }],
  metricas: [{ rotulo: 'Até a tela', valor: '4 ms', nivel: 'bom' }],
  nota: 'cache hit',
});

describe('Palco', () => {
  it('monta o motor na raiz e expoe o foco para testes e leitores de tela', () => {
    render(<Palco cena={cena} semente="t" reservarMetricas />);
    const raiz = screen.getByTestId('cena');
    expect(raiz).toHaveAttribute('data-foco', 'Cache');
    expect(raiz).toHaveAttribute('aria-label', 'Cena do passo: Cache');
    expect(raiz.querySelectorAll('[data-entidade]')).toHaveLength(2);
  });

  it('mostra os chips do passo so quando a licao reserva a linha', () => {
    const { rerender } = render(<Palco cena={cena} semente="t" reservarMetricas />);
    expect(screen.getByTestId('palco-metricas')).toHaveTextContent('4 ms');
    rerender(<Palco cena={cena} semente="t" reservarMetricas={false} />);
    expect(screen.queryByTestId('palco-metricas')).toBeNull();
  });

  it('a legenda lista os tipos de pacote da cena, com resposta e falha quando existem', () => {
    render(<Palco cena={cena} semente="t" reservarMetricas={false} />);
    const legenda = screen.getByLabelText('Legenda');
    expect(legenda).toHaveTextContent('requisição');
    expect(legenda).toHaveTextContent('resposta');
    expect(legenda).toHaveTextContent('falha');
  });

  it('o botao de pausa e a tecla Espaco alternam a pausa; R repete', () => {
    render(<Palco cena={cena} semente="t" reservarMetricas={false} />);
    const raiz = screen.getByTestId('cena');
    const pausar = screen.getByTestId('palco-pausar');

    fireEvent.click(pausar);
    expect(pausar).toHaveAttribute('aria-pressed', 'true');
    expect(raiz).toHaveAttribute('data-pausado', 'sim');

    fireEvent.keyDown(window, { key: ' ' });
    expect(pausar).toHaveAttribute('aria-pressed', 'false');
    expect(raiz).toHaveAttribute('data-pausado', 'nao');

    const antes = raiz.querySelector('[data-entidade="a"]');
    fireEvent.keyDown(window, { key: 'r' });
    expect(raiz.querySelector('[data-entidade="a"]')).not.toBe(antes);
  });

  it('atalhos nao disparam enquanto alguem digita num campo', () => {
    render(
      <>
        <input data-testid="campo" />
        <Palco cena={cena} semente="t" reservarMetricas={false} />
      </>,
    );
    fireEvent.keyDown(screen.getByTestId('campo'), { key: ' ' });
    expect(screen.getByTestId('palco-pausar')).toHaveAttribute('aria-pressed', 'false');
  });
});
