import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Laboratorio } from './Laboratorio';

describe('Laboratorio', () => {
  it.each([
    ['layout', 'layout', ['width', 'top']],
    ['paint', 'paint', ['background-color']],
    ['composite', 'composite', ['transform', 'opacity']],
  ] as const)('a acao %s reporta o estagio %s', async (acao, estagio, propriedades) => {
    const onMedicao = vi.fn();
    render(<Laboratorio onMedicao={onMedicao} />);

    fireEvent.click(screen.getByTestId(`acao-${acao}`));

    await waitFor(() => expect(onMedicao).toHaveBeenCalledTimes(1));
    expect(onMedicao.mock.calls[0]![0]).toMatchObject({ acao, estagio, propriedades });
  });

  it('a acao de paint muda so a cor, nao a geometria nem o composite', async () => {
    const onMedicao = vi.fn();
    render(<Laboratorio onMedicao={onMedicao} />);
    const alvo = screen.getByTestId('lab-alvo');
    const antes = { top: alvo.style.top, width: alvo.style.width, opacity: alvo.style.opacity };

    fireEvent.click(screen.getByTestId('acao-paint'));
    await waitFor(() => expect(onMedicao).toHaveBeenCalled());

    expect(alvo.style.top).toBe(antes.top);
    expect(alvo.style.width).toBe(antes.width);
    expect(alvo.style.opacity).toBe(antes.opacity);
  });
});
