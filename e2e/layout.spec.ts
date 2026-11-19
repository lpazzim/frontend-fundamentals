import { expect, test } from '@playwright/test';
import { licoes } from '../src/licoes';

/**
 * A pagina da licao e um app de tela cheia: palco, guia, trilho e (na licao 2)
 * laboratorio cabem juntos na janela, para o leitor assistir a animacao
 * enquanto le e interage. Este teste passa por TODOS os passos de TODAS as
 * licoes e falha se a pagina ou o guia precisarem rolar.
 */
const JANELAS = [
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
];

// Um teste por licao e janela: rodam em paralelo e a falha ja diz qual licao estourou.
for (const janela of JANELAS) {
  for (const licao of licoes) {
    test(`nenhum passo de ${licao.slug} rola em ${janela.width}x${janela.height}`, async ({ page }) => {
      // Cada passo e um goto completo; com todos os workers ocupados, 30 s fixos nao bastam.
      test.setTimeout(30_000 + licao.passos.length * 6_000);
      await page.setViewportSize(janela);
      const rolam: string[] = [];
      for (let passo = 1; passo <= licao.passos.length; passo++) {
        await page.goto(`/licao/${licao.slug}/${passo}`);
        await expect(page.getByTestId('titulo-passo')).toHaveText(licao.passos[passo - 1]!.titulo);
        const medida = await page.evaluate(() => {
          const raiz = document.documentElement;
          const guia = document.querySelector<HTMLElement>('[data-testid="guia"]')!;
          return {
            pagina: raiz.scrollHeight - window.innerHeight,
            largura: raiz.scrollWidth - window.innerWidth,
            guia: guia.scrollHeight - guia.clientHeight,
          };
        });
        if (medida.pagina > 1 || medida.largura > 1 || medida.guia > 1) {
          rolam.push(`${licao.slug}/${passo}: ${JSON.stringify(medida)}`);
        }
      }
      expect(rolam).toEqual([]);
    });
  }
}

test('o palco ocupa a maior parte da altura da janela', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/licao/event-loop/1');
  const altura = await page.getByTestId('cena').evaluate((el) => el.getBoundingClientRect().height);
  expect(altura).toBeGreaterThan(768 * 0.5);
});

test('no desktop o curso fica a vista: a barra lateral nao e gaveta nem inerte', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/licao/event-loop/1');
  const menu = page.locator('#menu-licoes');
  await expect(menu).toHaveAttribute('data-gaveta', 'false');
  expect(await menu.evaluate((el) => (el as HTMLElement).inert)).toBe(false);
  await expect(page.getByTestId('abrir-menu')).toBeHidden();
  await expect(page.getByTestId('menu-hidratacao')).toBeVisible();
});

test('no tablet o curso e uma gaveta: abre pelo botao, fecha com Esc e ao escolher uma licao', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/licao/event-loop/1');
  const menu = page.locator('#menu-licoes');
  await expect(menu).toHaveAttribute('data-gaveta', 'true');
  await expect(menu).toHaveAttribute('data-aberto', 'false');

  await page.getByTestId('abrir-menu').click();
  await expect(menu).toHaveAttribute('data-aberto', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('data-aberto', 'false');

  await page.getByTestId('abrir-menu').click();
  await page.getByTestId('menu-hidratacao').click();
  await expect(page).toHaveURL(/\/licao\/hidratacao\/1$/);
  await expect(menu).toHaveAttribute('data-aberto', 'false');
});

test('com a gaveta fechada, os links dela nao recebem foco (inert)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/licao/event-loop/1');
  const inerte = await page.locator('#menu-licoes').evaluate((el) => (el as HTMLElement).inert);
  expect(inerte).toBe(true);
});

test('o tema alterna entre claro e escuro e sobrevive a um reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/licao/event-loop/1');
  const raiz = page.locator('html');
  await expect(raiz).toHaveAttribute('data-tema', 'claro');
  await page.getByTestId('alternar-tema').click();
  await expect(raiz).toHaveAttribute('data-tema', 'escuro');
  await page.reload();
  await expect(raiz).toHaveAttribute('data-tema', 'escuro');
});
