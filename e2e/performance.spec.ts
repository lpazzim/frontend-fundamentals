import { expect, test, type Page } from '@playwright/test';

/**
 * Teste de performance da licao 2: disparar a acao de composite
 * (transform/opacity) NAO pode gerar layout-shift. E o teste que justifica o
 * projeto: a licao diz que composite nao toca em layout, e aqui o Chromium
 * confirma.
 *
 * Como evitar flakiness:
 *  - Os shifts do carregamento da pagina sao ignorados: so contam entradas com
 *    startTime >= o instante imediatamente antes do clique.
 *  - Nada de sleep: esperamos o painel declarar a medicao pronta
 *    (data-medicao), que so acontece depois de dois frames.
 *  - Controle positivo: a mesma checagem na acao de layout TEM que enxergar
 *    um shift. Sem ele, "zero shifts" passaria por vacuidade (observer morto).
 *
 * Limite conhecido: layout-shift so existe quando algo visivel MUDA DE POSICAO.
 * Mudar so a largura nao conta, e e por isso que a acao de layout move o top
 * tambem. O teste prova "composite nao move nada em layout", nao "nenhum
 * trabalho de paint aconteceu": o browser nao expoe paint por interacao.
 */

const URL_LICAO = '/licao/reflow-repaint-composite/1';

type Shift = { startTime: number; value: number };
type JanelaComShifts = { __shifts: Shift[]; __observador: PerformanceObserver };

async function instalarObservador(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as JanelaComShifts;
    w.__shifts = [];
    w.__observador = new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        w.__shifts.push({ startTime: e.startTime, value: (e as unknown as Shift).value });
      }
    });
    w.__observador.observe({ type: 'layout-shift', buffered: true });
  });
}

/** Marca o instante, executa o gesto, e devolve so os shifts posteriores a marca. */
async function shiftsDuranteGesto(page: Page, gesto: () => Promise<void>): Promise<Shift[]> {
  const marca = await page.evaluate(() => performance.now());
  await gesto();
  return page.evaluate((desde) => {
    const w = window as unknown as JanelaComShifts;
    // takeRecords: o que o callback ainda nao entregou.
    for (const e of w.__observador.takeRecords()) {
      w.__shifts.push({ startTime: e.startTime, value: (e as unknown as Shift).value });
    }
    return w.__shifts.filter((s) => s.startTime >= desde);
  }, marca);
}

test.beforeEach(async ({ page }) => {
  await instalarObservador(page);
  await page.goto(URL_LICAO);
  // Os handlers do React ja estao no ar quando o listener de atalhos registrou.
  await expect(page.locator('[data-atalhos="ativo"]')).toBeVisible();
  await expect(page.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'ocioso');
});

test('composite (transform/opacity) nao gera layout-shift', async ({ page }) => {
  const shifts = await shiftsDuranteGesto(page, async () => {
    await page.getByTestId('acao-composite').click();
    await expect(page.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'composite');
  });

  expect(shifts).toEqual([]);
  // O painel da aplicacao, que usa o mesmo PerformanceObserver, concorda.
  await expect(page.getByTestId('metrica-shifts')).toHaveText('0 (valor 0.0000)');
  await expect(page.getByTestId('metrica-geometria')).toHaveText('não');
});

test('paint (background-color) tambem nao gera layout-shift', async ({ page }) => {
  const shifts = await shiftsDuranteGesto(page, async () => {
    await page.getByTestId('acao-paint').click();
    await expect(page.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'paint');
  });

  expect(shifts).toEqual([]);
});

test('controle positivo: layout (width/top) gera layout-shift', async ({ page }) => {
  const shifts = await shiftsDuranteGesto(page, async () => {
    await page.getByTestId('acao-layout').click();
    await expect(page.getByTestId('painel-metricas')).toHaveAttribute('data-medicao', 'layout');
  });

  expect(shifts.length).toBeGreaterThan(0);
  await expect(page.getByTestId('metrica-geometria')).toHaveText('sim');
});
