import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Hydration',
  resumo: 'Why HTML that is already on screen still ignores clicks, and what JavaScript has to do to switch the page on.',
  objetivos: [
    'Why server HTML shows up fast',
    'The window where the page looks ready but does not respond',
    'The cost of JavaScript on the main thread',
    'What hydration actually does',
    'When the page starts responding',
  ],
  passos: {
    'html-pronto': {
      titulo: 'The HTML arrives ready and shows up',
      narracao:
        'With server rendering, the HTML already contains the button. The browser builds the DOM and paints: the reader sees the button right away, before any JavaScript. Seeing is not the same as being able to use it.',
    },
    inerte: {
      titulo: 'The button is on screen, but inert',
      narracao:
        'The JavaScript bundle is still on the network. No click handler has been attached, so clicking the button does nothing: the click happens and is lost (the red X). This window between “painted” and “responded” is the real problem of hydration, and you can see it on this very page: the keyboard shortcuts only go live when React finishes mounting.',
      nota: 'click now: nothing happens',
    },
    executa: {
      titulo: 'The JavaScript arrives and takes the main thread',
      narracao:
        'The bundle finishes downloading and goes to the main thread, where it has to be parsed and executed. Meanwhile the thread is busy: clicks keep waiting, and the bigger the bundle, the bigger the dead window.',
    },
    hidratando: {
      titulo: 'Hydrating means rebuilding the tree and attaching handlers',
      narracao:
        'The framework runs the components again on the client, compares the result with the DOM the server sent and, instead of recreating the nodes, reuses them and attaches the event handlers. If the server HTML and the client tree disagree, you get a hydration mismatch error.',
    },
    interativo: {
      titulo: 'Now the page responds',
      narracao:
        'With the handler attached, the same click now goes and comes back: the page responds. The cost was paid in waiting time, not in pixels: the screen did not change between step 2 and step 5. That is why islands, resumability and Server Components exist (the next lesson): they all try to shrink the window where the page looks ready and is not.',
      nota: 'click now: it responds',
    },
  },
  fontes: {
    'https://react.dev/reference/react-dom/client/hydrateRoot': "React's hydration API and mismatch errors.",
    'https://web.dev/articles/rendering-on-the-web': 'The “one app for the price of two”: why rehydration is expensive.',
    'https://www.builder.io/blog/hydration-is-pure-overhead': "The Qwik creator's case against redoing the server's work on the client.",
  },
} satisfies TraducaoDeLicao;
