import { useSyncExternalStore } from 'react';
import { idiomaAtivo } from './i18n/idiomas';

/**
 * A janela do app: disposicao (desktop, tablet, pilha), escala e tema.
 *
 * No desktop a interface e desenhada para 1672x920 e, numa tela menor, encolhe
 * inteira com CSS zoom (como no designed-to-scale): palco, guia e trilho cabem
 * juntos sem rolar, com as mesmas proporcoes em qualquer tela. Abaixo disso a
 * barra lateral vira gaveta (tablet) e, numa tela estreita, tudo empilha.
 *
 * O estado mora no <html> (data-layout, data-tema e variaveis CSS), escrito
 * antes do primeiro render: nao ha um quadro com o tema ou a escala errados.
 */
export type Disposicao = 'desktop' | 'tablet' | 'pilha';
export type Tema = 'claro' | 'escuro';

export const DESENHO = { largura: 1672, altura: 920 } as const;

export function disposicaoPara(largura: number, altura: number): Disposicao {
  if (largura >= 1200 && altura >= 560) return 'desktop';
  if (largura >= 960 && altura >= 600) return 'tablet';
  return 'pilha';
}

/** Escala do desktop: nunca aumenta, so encolhe o que nao cabe. */
export function escalaPara(largura: number, altura: number): number {
  return Math.min(1, largura / DESENHO.largura, altura / DESENHO.altura);
}

// ---- disposicao e escala --------------------------------------------------------

const ouvintesDaDisposicao = new Set<() => void>();
let disposicaoAtual: Disposicao = 'desktop';

function medirJanela() {
  const raiz = document.documentElement;
  const largura = window.innerWidth;
  const altura = window.innerHeight;
  const disposicao = disposicaoPara(largura, altura);
  raiz.dataset.layout = disposicao;
  if (disposicao === 'desktop') {
    const escala = escalaPara(largura, altura);
    raiz.style.setProperty('--zoom', String(escala));
    raiz.style.setProperty('--janela-largura', `${largura / escala}px`);
    raiz.style.setProperty('--janela-altura', `${altura / escala}px`);
  } else {
    raiz.style.removeProperty('--zoom');
    raiz.style.removeProperty('--janela-largura');
    raiz.style.removeProperty('--janela-altura');
  }
  if (disposicao !== disposicaoAtual) {
    disposicaoAtual = disposicao;
    for (const ouvinte of ouvintesDaDisposicao) ouvinte();
  }
}

export function useDisposicao(): Disposicao {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintesDaDisposicao.add(ouvinte);
      return () => ouvintesDaDisposicao.delete(ouvinte);
    },
    () => disposicaoAtual,
    () => 'desktop' as Disposicao,
  );
}

// ---- tema -------------------------------------------------------------------------

const CHAVE_TEMA = 'render-lab:tema';
const ouvintesDoTema = new Set<() => void>();
let temaAtual: Tema = 'claro';

function temaSalvo(): Tema | null {
  try {
    const valor = localStorage.getItem(CHAVE_TEMA);
    return valor === 'claro' || valor === 'escuro' ? valor : null;
  } catch {
    return null; // storage bloqueado: segue o sistema
  }
}

function temaDoSistema(): Tema {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'escuro'
    : 'claro';
}

function aplicarTema(tema: Tema) {
  temaAtual = tema;
  document.documentElement.dataset.tema = tema;
  document.documentElement.style.colorScheme = tema === 'escuro' ? 'dark' : 'light';
  for (const ouvinte of ouvintesDoTema) ouvinte();
}

export function useTema(): Tema {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintesDoTema.add(ouvinte);
      return () => ouvintesDoTema.delete(ouvinte);
    },
    () => temaAtual,
    () => 'claro' as Tema,
  );
}

/** Troca o tema e lembra a escolha. Com View Transitions, as cores cruzam em fade em vez de saltar. */
export function alternarTema() {
  const proximo: Tema = temaAtual === 'escuro' ? 'claro' : 'escuro';
  try {
    localStorage.setItem(CHAVE_TEMA, proximo);
  } catch {
    // sem persistencia: vale ate fechar a aba
  }
  const reduzir =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const comTransicao = (document as Document & { startViewTransition?: (fn: () => void) => unknown })
    .startViewTransition;
  if (comTransicao && !reduzir) comTransicao.call(document, () => aplicarTema(proximo));
  else aplicarTema(proximo);
}

// ---- inicializacao ----------------------------------------------------------------

let iniciada = false;

/** Roda antes do primeiro render (main.tsx). */
export function iniciarJanela() {
  if (iniciada || typeof window === 'undefined') return;
  iniciada = true;
  // O lang do documento acompanha o idioma ativo: leitor de tela e hifenizacao dependem dele.
  document.documentElement.lang = idiomaAtivo();
  aplicarTema(temaSalvo() ?? temaDoSistema());
  if (typeof window.matchMedia === 'function') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!temaSalvo()) aplicarTema(temaDoSistema());
    });
  }
  medirJanela();
  window.addEventListener('resize', medirJanela);
}
