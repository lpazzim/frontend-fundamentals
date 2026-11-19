import { describe, expect, it } from 'vitest';
import {
  COS,
  SEN,
  aparar,
  caminhoArredondado,
  comprimento,
  enquadrar,
  iso,
  noMundo,
  pontaDeSeta,
  prisma,
  raioDoLosango,
} from './geometria';

describe('projecao isometrica', () => {
  it('um passo em gx desce para a direita, um em gy desce para a esquerda', () => {
    expect(iso(1, 0)).toEqual({ x: COS, y: SEN });
    expect(iso(0, 1)).toEqual({ x: -COS, y: SEN });
    expect(iso(0, 0, 10)).toEqual({ x: 0, y: -10 });
  });

  it('coluna anda na horizontal e linha na vertical da tela', () => {
    expect(noMundo(1, 0)).toEqual({ x: 2 * COS, y: 0 });
    expect(noMundo(0, 1)).toEqual({ x: 0, y: 2 * SEN });
    expect(noMundo(0, 0, 9).y).toBe(-9);
  });

  it('o prisma tem topo na altura pedida e faces laterais ate o chao', () => {
    const p = prisma(2, 2, 26);
    expect(Math.max(...p.topo.map((q) => q.y))).toBeCloseTo(SEN * 2 - 26);
    expect(Math.max(...p.direita.map((q) => q.y))).toBeCloseTo(SEN * 2);
    expect(p.topo).toHaveLength(4);
  });
});

describe('caminhos', () => {
  it('caminho arredondado e fechado e tem uma curva por canto', () => {
    const d = caminhoArredondado(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      2,
    );
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    expect(d.match(/Q/g)).toHaveLength(4);
  });

  it('o raio do losango e o semi-eixo nas direcoes dos eixos', () => {
    expect(raioDoLosango(60, 30, 1, 0)).toBeCloseTo(60);
    expect(raioDoLosango(60, 30, 0, 1)).toBeCloseTo(30);
    // a 45 graus o losango e mais estreito que os dois semi-eixos
    expect(raioDoLosango(60, 30, 1, 1)).toBeLessThan(30 * Math.SQRT2);
  });

  it('aparar corta as duas pontas e preserva a direcao', () => {
    const [a, b] = aparar({ x: 0, y: 0 }, { x: 100, y: 0 }, 10, 20);
    expect(a).toEqual({ x: 10, y: 0 });
    expect(b).toEqual({ x: 80, y: 0 });
  });

  it('segmento curto demais encolhe pelo meio em vez de inverter', () => {
    const [a, b] = aparar({ x: 0, y: 0 }, { x: 20, y: 0 }, 15, 15);
    expect(a.x).toBeLessThan(b.x);
    expect(comprimento([a, b])).toBeCloseTo(8);
  });

  it('a ponta de seta tem a ponta exatamente no destino', () => {
    const [ponta] = pontaDeSeta({ x: 0, y: 0 }, { x: 50, y: 0 });
    expect(ponta).toEqual({ x: 50, y: 0 });
  });
});

describe('enquadrar (camera)', () => {
  it('centraliza a caixa na janela', () => {
    const camera = enquadrar({ x: 100, y: 100, largura: 200, altura: 100 }, { largura: 400, altura: 300 }, 0, 1);
    expect(camera.escala).toBe(1);
    // centro da caixa (200, 150) vai para o centro da janela (200, 150)
    expect(camera.x).toBeCloseTo(0);
    expect(camera.y).toBeCloseTo(0);
  });

  it('encolhe o que nao cabe e nunca passa da escala maxima', () => {
    expect(enquadrar({ x: 0, y: 0, largura: 2000, altura: 100 }, { largura: 400, altura: 300 }, 0).escala).toBeCloseTo(0.2);
    expect(enquadrar({ x: 0, y: 0, largura: 10, altura: 10 }, { largura: 400, altura: 300 }, 0).escala).toBe(1.35);
  });
});
