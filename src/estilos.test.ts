import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A restricao que a licao 2 ensina, aplicada ao proprio motor de cena:
 * so transform e opacity podem transicionar ou animar. Este teste le o CSS
 * real, entao uma transition em width/top/left quebra o CI.
 */
const css = readFileSync(resolve(process.cwd(), 'src/estilos.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

const PERMITIDAS = new Set(['opacity', 'transform']);

describe('estilos: so transform e opacity animam', () => {
  it('toda transition lista apenas propriedades permitidas', () => {
    const declaracoes = [...css.matchAll(/(?<![\w-])transition(?:-property)?\s*:\s*([^;}]+)/g)];
    expect(declaracoes.length).toBeGreaterThan(0);
    for (const [, valor] of declaracoes) {
      const texto = valor!.replace('!important', '').trim();
      if (texto === 'none') continue;
      // Separa por virgula fora de parenteses: cubic-bezier(0.3, 1, ...) tem virgulas suas.
      for (const item of texto.split(/,(?![^(]*\))/)) {
        const propriedade = item.trim().split(/\s+/)[0]!;
        expect(PERMITIDAS.has(propriedade), `transition em "${propriedade}"`).toBe(true);
      }
    }
  });

  it('todo @keyframes mexe apenas em propriedades permitidas', () => {
    const blocos = [...css.matchAll(/@keyframes\s+[\w-]+\s*\{((?:[^{}]*\{[^{}]*\})+)\s*\}/g)];
    expect(blocos.length).toBeGreaterThan(0);
    for (const [, corpo] of blocos) {
      const propriedades = [...corpo!.matchAll(/([\w-]+)\s*:[^;}]+[;}]/g)].map((m) => m[1]!);
      expect(propriedades.length).toBeGreaterThan(0);
      for (const propriedade of propriedades) {
        expect(PERMITIDAS.has(propriedade), `keyframes anima "${propriedade}"`).toBe(true);
      }
    }
  });

  it('prefers-reduced-motion desliga toda transition e animation, globalmente', () => {
    const bloco = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*)\}\s*$/);
    expect(bloco).not.toBeNull();
    expect(bloco![1]).toMatch(/\*\s*,[\s\S]*transition:\s*none\s*!important/);
    expect(bloco![1]).toMatch(/animation:\s*none\s*!important/);
  });
});
