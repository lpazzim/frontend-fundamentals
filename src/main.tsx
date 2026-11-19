import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { iniciarJanela } from './janela';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/jetbrains-mono/800.css';
import './estilos.css';

// Tema e escala antes do primeiro render: nenhum quadro sai com as cores ou o tamanho errados.
iniciarJanela();

const raiz = document.getElementById('root');
if (!raiz) throw new Error('elemento #root nao encontrado no index.html');

/**
 * O primeiro render espera a JetBrains Mono (servida pelo proprio app, sem rede
 * externa). Sem isso a pagina pintava com a fonte do sistema e trocava em
 * seguida: um layout-shift no carregamento -- o CLS que a licao de Core Web Vitals ensina a
 * evitar. O teto garante que uma fonte lenta nunca segura a pagina em branco.
 */
function fontesProntas(teto = 1200): Promise<unknown> {
  if (typeof document.fonts?.load !== 'function') return Promise.resolve();
  const pesos = ['400', '500', '600', '700', '800'].map((peso) => document.fonts.load(`${peso} 13px "JetBrains Mono"`));
  return Promise.race([Promise.all(pesos), new Promise((pronto) => setTimeout(pronto, teto))]);
}

void fontesProntas()
  .catch(() => undefined)
  .then(() => {
    createRoot(raiz).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
