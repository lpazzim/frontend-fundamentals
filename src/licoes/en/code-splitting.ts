import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Code splitting',
  resumo: 'What leaves the initial bundle, when it comes back and what changes when the import becomes dynamic.',
  objetivos: [
    'The cost of a single initial bundle',
    'How import() creates a separate chunk',
    'When the chunk gets downloaded',
    'Prefetch: hide the wait before the click',
  ],
  passos: {
    'import-estatico': {
      titulo: 'Static import: everything in the initial bundle',
      narracao:
        'With static imports, the bundler follows every import and puts it all in a single file. The reader downloads and runs the complete code graph before the first screen, even if they never open the page that uses that big library.',
    },
    'import-dinamico': {
      titulo: 'import() cuts the graph in two',
      narracao:
        'Swapping a static import for import() tells the bundler that the module is only needed later. It becomes a separate chunk: the heavy library leaves the bundle, the initial bundle shrinks and the first screen arrives sooner.',
      nota: 'const chart = await import("./chart")',
    },
    'sob-demanda': {
      titulo: 'The chunk only travels when someone needs it',
      narracao:
        'The reader opens the page that uses the chart. Only now does the browser request the chunk. That is the price of the shortcut: a network wait appears at navigation time, and that is where the loading state and prefetch come in.',
    },
    prefetch: {
      titulo: 'Prefetch pays the wait in advance',
      narracao:
        'You can download the chunk before the click, for example when the pointer hovers over the link. The chunk goes into the browser cache, and the navigation does not wait for the network. This project does exactly that: each lesson is its own chunk, and hovering a lesson link in the menu already starts downloading it.',
      nota: 'hover on the link → prefetch the chunk',
    },
  },
  fontes: {
    'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting': 'When to split the bundle and how to measure the gain.',
    'https://react.dev/reference/react/lazy': 'Load components on demand, with Suspense showing the fallback.',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import': 'The dynamic import the bundler turns into a chunk.',
    'https://vite.dev/guide/features#dynamic-import': 'How Vite creates chunks and preloads their dependencies.',
  },
} satisfies TraducaoDeLicao;
