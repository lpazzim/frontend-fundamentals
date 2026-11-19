import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PainelMetricas } from './PainelMetricas';
import type { Medicao } from './medicao';

const composite: Medicao = {
  acao: 'composite',
  propriedades: ['transform', 'opacity'],
  estagio: 'composite',
  layoutShifts: 0,
  valorShift: 0,
  geometriaMudou: false,
  msLayoutForcado: 0.12,
};

describe('PainelMetricas', () => {
  it('mostra o estagio ativo da cena', () => {
    render(<PainelMetricas ativo="Paint" medicao={null} comInteracao={false} />);
    expect(screen.getByTestId('metrica-estagio')).toHaveTextContent('Paint');
    expect(screen.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'ocioso');
  });

  it('sem interacao ainda, as linhas existem com travessao (altura fixa)', () => {
    render(<PainelMetricas ativo="Layout" medicao={null} comInteracao />);
    expect(screen.getByTestId('metrica-shifts')).toHaveTextContent('—');
    expect(screen.getByTestId('metrica-ms')).toHaveTextContent('—');
  });

  it('composite liga so o chip de composite e reporta zero layout-shifts', () => {
    render(<PainelMetricas ativo="Layout" medicao={composite} comInteracao />);
    expect(screen.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'composite');
    const chips = screen.getByTestId('metrica-estagios').querySelectorAll('[data-ligado="true"]');
    expect([...chips].map((c) => c.textContent)).toEqual(['Composite']);
    expect(screen.getByTestId('metrica-shifts')).toHaveTextContent('0 (valor 0.0000)');
    expect(screen.getByTestId('metrica-geometria')).toHaveTextContent('não');
  });

  it('browser sem suporte a layout-shift aparece como travessao, nao como zero', () => {
    render(
      <PainelMetricas
        ativo="Layout"
        medicao={{ ...composite, layoutShifts: null, valorShift: null }}
        comInteracao
      />,
    );
    expect(screen.getByTestId('metrica-shifts')).toHaveTextContent('—');
  });
});
