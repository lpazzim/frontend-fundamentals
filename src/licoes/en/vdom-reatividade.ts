import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Virtual DOM and fine-grained reactivity',
  resumo: 'Two ways to propagate a state change: re-run components, or update only what depends on the value.',
  objetivos: [
    'Two models for the same interface',
    'What re-runs when state changes',
    'How diffing avoids DOM writes',
    'Reconciliation: element type and key',
    'The costs of each model',
  ],
  passos: {
    'mesma-arvore': {
      titulo: 'Same interface, two models',
      narracao:
        'A screen with an App, a List of two Items and a Counter. On the left, the virtual DOM model (React): state lives in App and components are functions that run again on every change. On the right, fine-grained reactivity (signals, as in Solid and Svelte 5): the framework records who reads each value and updates only that read.',
    },
    mudanca: {
      titulo: 'State changes: who re-runs?',
      narracao:
        'The reader clicks increment. In the virtual DOM, App, which owns the state, re-runs and, by default, all its children re-run with it: five component runs to change one number (the packets going down the tree). With fine-grained reactivity only the signal read in the counter text is redone: one update, straight from the signal to whoever reads it.',
    },
    diff: {
      titulo: 'Re-running is not repainting: the diff',
      narracao:
        'Re-running components does not mean touching the DOM. The virtual DOM compares the new tree with the previous one (diff) and applies to the real DOM only what changed: here, one text node. Both models touch the same node; the difference is the work before that: the diff of five components, which fine-grained reactivity skips.',
      nota: 'left: diff, then patch · right: direct write',
    },
    reconciliacao: {
      titulo: 'Reconciliation: how the diff decides',
      narracao:
        'Optimally comparing two arbitrary trees costs O(n³). React does it in O(n) with two heuristics. An element of a different type yields a different tree: swapping a <div> for a <section> unmounts everything below and loses its state. In lists, the key says which item is which: with a stable key, reordering only moves DOM nodes; with the index as key, state and DOM get shuffled.',
      nota: 'stable key: reordering only moves DOM nodes',
    },
    tradeoff: {
      titulo: 'No winner, just different costs',
      narracao:
        'The virtual DOM trades efficiency for a simple mental model: UI is a function of state, and re-running is always safe. Fine-grained reactivity is more efficient per change, but it has to track dependencies and has its own traps, such as losing reactivity when you destructure a value. In React, memo and moving state down the tree reduce the re-renders of the first model.',
    },
  },
  fontes: {
    'https://legacy.reactjs.org/docs/reconciliation.html': 'The two heuristics that make the diff linear.',
    'https://react.dev/learn/preserving-and-resetting-state': 'Why tree position and key decide whether state survives.',
    'https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key': 'Why the index is a bad key for lists that change.',
    'https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf': 'Signals, effects and memos built from scratch.',
    'https://svelte.dev/blog/runes': 'How Svelte 5 adopted signals.',
    'https://react.dev/learn/react-compiler': 'Automatic memoization to cut re-renders in the virtual DOM model.',
  },
} satisfies TraducaoDeLicao;
