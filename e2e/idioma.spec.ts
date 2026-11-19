import { expect, test } from '@playwright/test';
import { licoesDoIdioma } from '../src/licoes';

const ingles = licoesDoIdioma('en');
const renderingPath = ingles.find((l) => l.slug === 'rendering-path')!;

test('o seletor do topo troca a interface e a licao para ingles, e a escolha sobrevive ao reload', async ({ page }) => {
  await page.goto('/licao/rendering-path/1');
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
  await expect(page.getByTestId('idioma-pt-BR')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('idioma-en').click();
  await expect(page.getByTestId('idioma-en')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('titulo-passo')).toHaveText(renderingPath.passos[0]!.titulo);
  await expect(page.getByTestId('narracao-passo')).toHaveText(renderingPath.passos[0]!.narracao);
  await expect(page.getByTestId('avancar')).toHaveText(`Next: ${renderingPath.passos[1]!.titulo}`);
  await expect(page.getByTestId('menu-rendering-path')).toContainText(renderingPath.titulo);

  // O passo continua na URL; so o idioma mudou.
  await page.getByTestId('avancar').click();
  await expect(page).toHaveURL(/\/licao\/rendering-path\/2$/);
  await expect(page.getByTestId('titulo-passo')).toHaveText(renderingPath.passos[1]!.titulo);

  await page.reload();
  await expect(page.getByTestId('titulo-passo')).toHaveText(renderingPath.passos[1]!.titulo);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByTestId('idioma-pt-BR').click();
  await expect(page.getByTestId('titulo-passo')).toHaveText('CSS vira CSSOM');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test.describe('num navegador em ingles', () => {
  test.use({ locale: 'en-US' });

  test('o app abre em ingles sem o leitor escolher nada', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('What the browser does under the hood');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByTestId('idioma-en')).toHaveAttribute('aria-pressed', 'true');
  });
});

test('cada licao e baixada so quando o leitor a abre', async ({ page }) => {
  const licoesPedidas: string[] = [];
  page.on('request', (pedido) => {
    const caminho = new URL(pedido.url()).pathname;
    const achou = caminho.match(/\/src\/licoes\/(?:pt-BR|en)\/([a-z-]+)\.ts$/);
    if (achou && achou[1] !== 'index' && achou[1] !== 'termos') licoesPedidas.push(achou[1]!);
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(licoesPedidas).toEqual([]);

  await page.goto('/licao/event-loop/1');
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
  expect([...new Set(licoesPedidas)]).toEqual(['event-loop']);
});
