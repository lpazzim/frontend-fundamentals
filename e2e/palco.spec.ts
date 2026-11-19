import { expect, test, type Page } from '@playwright/test';
import { licoes } from '../src/licoes';

/**
 * O motor de cena no Chromium de verdade. O jsdom nao tem Web Animations; aqui
 * conferimos as duas promessas do motor:
 *  1. so anima transform e opacity (lendo os keyframes de cada animacao viva);
 *  2. com os pacotes viajando, o browser nao refaz layout nenhuma vez
 *     (LayoutCount do proprio Chrome, via CDP).
 */

async function esperarAssentar(page: Page) {
  await expect(page.getByTestId('cena')).toHaveAttribute('data-estado', 'pronto');
}

/** Propriedades animadas por TUDO que esta animando dentro do palco agora. */
async function propriedadesAnimadas(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const raiz = document.querySelector('[data-testid="cena"]')!;
    const ignorar = new Set(['offset', 'computedOffset', 'easing', 'composite']);
    const props = new Set<string>();
    for (const animacao of raiz.getAnimations({ subtree: true })) {
      const efeito = animacao.effect as KeyframeEffect | null;
      for (const quadro of efeito?.getKeyframes() ?? []) {
        for (const chave of Object.keys(quadro)) if (!ignorar.has(chave)) props.add(chave);
      }
    }
    return [...props];
  });
}

async function animacoesEm(page: Page, seletor: string): Promise<number> {
  return page.evaluate((s) => {
    const raiz = document.querySelector('[data-testid="cena"]')!;
    return raiz.getAnimations({ subtree: true }).filter((a) => {
      const alvo = (a.effect as KeyframeEffect | null)?.target;
      return alvo instanceof Element && alvo.matches(s);
    }).length;
  }, seletor);
}

test('toda transicao de toda licao anima so transform e opacity', async ({ page }) => {
  test.setTimeout(90_000);
  const vistas = new Set<string>();
  for (const licao of licoes) {
    await page.goto(`/licao/${licao.slug}/1`);
    await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
    for (let passo = 1; passo <= licao.passos.length; passo++) {
      // Logo depois da troca a coreografia inteira esta viva: saidas, movimentos, entradas, camera.
      for (const p of await propriedadesAnimadas(page)) vistas.add(p);
      if (passo < licao.passos.length) {
        await page.getByTestId('avancar').click();
        await expect(page).toHaveURL(new RegExp(`/${passo + 1}$`));
        await page.waitForTimeout(120);
      }
    }
  }
  expect([...vistas].sort()).toEqual(['opacity', 'transform']);
});

test('com os pacotes viajando, o palco nao dispara nenhum layout (LayoutCount via CDP)', async ({ page }) => {
  // Licao 2, passo 5: o passo com mais pacotes (pesados e sinais, 1,6 por segundo cada).
  await page.goto('/licao/reflow-repaint-composite/5');
  await esperarAssentar(page);
  await expect.poll(() => animacoesEm(page, '.palco__pacote')).toBeGreaterThan(0);

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const ler = async () => {
    const { metrics } = await cdp.send('Performance.getMetrics');
    return Object.fromEntries(metrics.map((m) => [m.name, m.value]));
  };

  const antes = await ler();
  // Tempo suficiente para varios pacotes nascerem, viajarem, explodirem e voltarem ao pool.
  await page.waitForTimeout(2500);
  const depois = await ler();

  expect(await animacoesEm(page, '.palco__pacote')).toBeGreaterThan(0);
  expect(depois.LayoutCount! - antes.LayoutCount!).toBe(0);
});

test('uma peca que muda de lugar entre passos e o mesmo elemento, movido por transform', async ({ page }) => {
  await page.goto('/licao/event-loop/3');
  await esperarAssentar(page);
  const thenC = page.locator('[data-entidade="then-c"]');
  const antes = await thenC.boundingBox();
  const marca = await thenC.evaluate((el) => {
    (el as HTMLElement).dataset.marca = 'original';
    return true;
  });
  expect(marca).toBe(true);

  await page.getByTestId('avancar').click();
  await expect.poll(() => animacoesEm(page, '[data-entidade="then-c"]')).toBeGreaterThan(0);
  await esperarAssentar(page);

  // Mesmo no do DOM (nao desmontou e montou de novo), em outro lugar da tela.
  await expect(thenC).toHaveAttribute('data-marca', 'original');
  const depois = await thenC.boundingBox();
  expect(Math.abs(depois!.x - antes!.x) + Math.abs(depois!.y - antes!.y)).toBeGreaterThan(20);
});

test('pausar congela o palco inteiro e continuar retoma', async ({ page }) => {
  await page.goto('/licao/cache-cliente/1');
  await esperarAssentar(page);
  await expect.poll(() => animacoesEm(page, '.palco__pacote')).toBeGreaterThan(0);

  await page.getByTestId('palco-pausar').click();
  await expect(page.getByTestId('cena')).toHaveAttribute('data-pausado', 'sim');
  const tocando = await page.evaluate(
    () =>
      document
        .querySelector('[data-testid="cena"]')!
        .getAnimations({ subtree: true })
        .filter((a) => a.playState === 'running').length,
  );
  expect(tocando).toBe(0);

  await page.getByTestId('palco-pausar').click();
  await expect(page.getByTestId('cena')).toHaveAttribute('data-pausado', 'nao');
});

test('R repete a transicao do passo; Espaco pausa', async ({ page }) => {
  await page.goto('/licao/event-loop/4');
  await esperarAssentar(page);

  await page.keyboard.press('r');
  await expect(page.getByTestId('cena')).toHaveAttribute('data-estado', 'animando');
  await esperarAssentar(page);

  await page.keyboard.press(' ');
  await expect(page.getByTestId('cena')).toHaveAttribute('data-pausado', 'sim');
});

test('o laboratorio da licao 2 bate na peca do estagio que a mudanca reabre', async ({ page }) => {
  await page.goto('/licao/reflow-repaint-composite/1');
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
  await esperarAssentar(page);

  await page.getByTestId('acao-paint').click();
  await expect(page.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'paint');
  // A batida e uma animacao de transform na peca "paint" (escala e volta).
  await expect.poll(() => animacoesEm(page, '[data-entidade="paint"]')).toBeGreaterThan(0);
});

test('prefers-reduced-motion: o palco salta para o estado final e nada anima', async ({ browser }) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  await page.goto('/licao/event-loop/2');
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
  await expect(page.getByTestId('cena')).toHaveAttribute('data-estado', 'pronto');

  await page.getByTestId('avancar').click();
  await expect(page.getByTestId('cena')).toHaveAttribute('data-foco', 'Microtasks');
  await expect(page.getByTestId('cena')).toHaveAttribute('data-estado', 'pronto');
  await page.waitForTimeout(600);
  const animando = await page.evaluate(
    () => document.querySelector('[data-testid="cena"]')!.getAnimations({ subtree: true }).length,
  );
  expect(animando).toBe(0);
  await contexto.close();
});
