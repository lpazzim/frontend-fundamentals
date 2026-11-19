import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // A pagina de licao e cada licao sao carregadas sob demanda. No dev, isso
    // faria a primeira visita esperar o Vite transformar o palco e o conteudo;
    // o warmup transforma esses arquivos assim que o servidor sobe.
    warmup: {
      clientFiles: ['./src/paginas/LicaoPagina.tsx', './src/licoes/pt-BR/*.ts', './src/licoes/en/*.ts'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/teste/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
