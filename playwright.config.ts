import { defineConfig, devices } from '@playwright/test';

// PORT permite rodar o e2e num servidor proprio quando outro dev server ja ocupa a 5173.
const porta = Number(process.env.PORT ?? 5173);
const url = `http://localhost:${porta}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // O app escolhe o idioma pelo navegador; o e2e roda em portugues, e o teste de idioma troca.
    locale: 'pt-BR',
    baseURL: url,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${porta} --strictPort`,
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
