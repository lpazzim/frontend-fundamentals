import { expect, test } from '@playwright/test';
import { licoes } from '../src/licoes';

/**
 * Criterio de pronto da fase 3: as oito licoes tem percurso coberto.
 * Le o catalogo real: uma licao nova entra neste teste sem editar nada.
 */
for (const licao of licoes) {
  test(`percurso completo: ${licao.slug}`, async ({ page }) => {
    await page.goto(`/licao/${licao.slug}/1`);
    await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();

    for (const [i, passo] of licao.passos.entries()) {
      await expect(page.getByTestId('titulo-passo')).toHaveText(passo.titulo);
      await expect(page).toHaveURL(new RegExp(`/licao/${licao.slug}/${i + 1}$`));
      if (i < licao.passos.length - 1) await page.getByTestId('avancar').click();
    }

    await expect(page.getByTestId('avancar')).toHaveText('Fim da lição');
    await expect(page.getByTestId(`menu-progresso-${licao.slug}`)).toHaveText('✓');
  });
}

test('o progresso sobrevive a um reload e e por licao', async ({ page }) => {
  await page.goto('/licao/event-loop/1');
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
  await page.getByTestId('avancar').click();
  await expect(page.getByTestId('menu-progresso-event-loop')).toHaveText(`2/${licoes[2]!.passos.length}`);

  await page.reload();
  await expect(page.getByTestId('menu-progresso-event-loop')).toHaveText(`2/${licoes[2]!.passos.length}`);
  await expect(page.getByTestId('menu-progresso-hidratacao')).toHaveText('');
});

test('a busca filtra o menu sem exigir acento e avisa quando nao acha', async ({ page }) => {
  await page.goto('/');
  // A busca mora no topo e filtra a arvore do curso, abrindo os modulos que tem resultado.
  await page.getByTestId('busca').fill('hidratacao');
  await expect(page.getByTestId('menu-hidratacao')).toBeVisible();
  await expect(page.getByTestId('menu-event-loop')).toHaveCount(0);

  await page.getByTestId('busca').fill('zzzz');
  await expect(page.getByTestId('busca-vazia')).toBeVisible();
});

test('cada licao diz se e modelo ou medicao', async ({ page }) => {
  await page.goto('/licao/event-loop/1');
  await expect(page.getByTestId('selo-fidelidade')).toHaveAttribute('data-fidelidade', 'modelo');
  await page.goto('/licao/reflow-repaint-composite/1');
  await expect(page.getByTestId('selo-fidelidade')).toHaveAttribute('data-fidelidade', 'medido');
});

test('as fontes para estudo abrem, levam a uma nova aba e continuam abertas entre passos', async ({ page }) => {
  const licao = licoes.find((l) => l.slug === 'acessibilidade')!;
  await page.goto('/licao/acessibilidade/1');
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();

  const alternar = page.getByTestId('fontes-alternar');
  const links = page.getByTestId('fonte');
  await expect(alternar).toHaveAttribute('aria-expanded', 'false');
  await expect(links.first()).toBeHidden();

  await alternar.click();
  await expect(alternar).toHaveAttribute('aria-expanded', 'true');
  await expect(links).toHaveCount(licao.fontes.length);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', /^https:\/\//);
  }

  await page.getByTestId('avancar').click();
  await expect(alternar).toHaveAttribute('aria-expanded', 'true');
});
