import { expect, test } from '@playwright/test';

test('deep link abre direto no passo pedido', async ({ page }) => {
  await page.goto('/licao/rendering-path/4');

  await expect(page.getByTestId('titulo-passo')).toHaveText('Layout calcula a geometria');
  await expect(page.getByTestId('cena')).toHaveAttribute('data-foco', 'Layout');
});

test('avancar muda a URL e o passo', async ({ page }) => {
  await page.goto('/licao/rendering-path/1');

  await page.getByTestId('avancar').click();

  await expect(page).toHaveURL(/\/licao\/rendering-path\/2$/);
  await expect(page.getByTestId('cena')).toHaveAttribute('data-foco', 'CSSOM');
});

test('as setas do teclado navegam entre passos', async ({ page }) => {
  await page.goto('/licao/rendering-path/3');

  // Esperar os atalhos entrarem no ar, em vez de um sleep: entre o HTML
  // aparecer e o efeito registrar o listener existe uma janela morta real.
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/licao\/rendering-path\/4$/);

  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/\/licao\/rendering-path\/3$/);
});

test('um passo fora da faixa cai no mais proximo valido', async ({ page }) => {
  await page.goto('/licao/rendering-path/99');
  await expect(page.getByTestId('cena')).toHaveAttribute('data-foco', 'Composite');

  await page.goto('/licao/rendering-path/abc');
  await expect(page.getByTestId('cena')).toHaveAttribute('data-foco', 'DOM');
});

test('a licao sem passo na URL cai no passo 1', async ({ page }) => {
  await page.goto('/licao/rendering-path');
  await expect(page).toHaveURL(/\/licao\/rendering-path\/1$/);
});
