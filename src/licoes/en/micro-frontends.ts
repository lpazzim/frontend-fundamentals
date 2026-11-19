import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Micro-frontends and Module Federation',
  resumo: 'Split a large frontend into independently deployed parts: when it pays off, how Module Federation loads code from another deploy and what it costs.',
  objetivos: [
    'The bottleneck of many teams in one deploy',
    'Slice by domain, with its own deploy',
    'Module Federation: import from another build',
    'Duplicated dependencies and singletons',
    'When the cost pays off',
  ],
  passos: {
    monolito: {
      titulo: 'One frontend, many teams',
      narracao:
        'In a frontend monolith, every team edits the same repository and ships in the same deploy. With few teams, that is the simplest arrangement possible. With dozens, the build gets slow, one team’s bug holds up everyone’s release and nobody can upgrade a dependency without coordinating with the rest of the company.',
    },
    fatiar: {
      titulo: 'Micro-frontends: slices with their own deploy',
      narracao:
        'The idea is to split the application by business domain (catalog, cart, account), each slice with its own repository, pipeline and deploy, plus a host app, the shell, that composes them on screen. Each team ships whenever it wants, without waiting for the others. Note: it solves an organizational problem, not a technical one.',
    },
    federation: {
      titulo: 'Module Federation: import code from another deploy',
      narracao:
        "Module Federation, created in webpack 5 and now also available for Rspack and Vite through the module-federation.io project, lets the shell load at runtime a module exposed by another build: import('cart/Cart') fetches the remoteEntry.js published by the cart team. A new cart version goes live without rebuilding the shell.",
      nota: "import('cart/Cart')",
    },
    duplicacao: {
      titulo: 'The duplicated dependencies problem',
      narracao:
        'If each slice brings its own copy of React, the user downloads React three times, and two instances on the same page break hooks and Context. The shared configuration, with singleton and an accepted version range, makes every slice use a single copy. But that creates a contract: every remote has to work with whatever version the shell loads.',
      nota: 'shared: { react: { singleton: true } }',
    },
    quando: {
      titulo: 'When the cost pays off',
      narracao:
        'Each slice becomes a public API: props, events and routes exchanged between teams need versioning and compatibility. Add the shared design system, distributed observability and performance that tends to get worse. It pays off when many teams need to ship autonomously and the cost of coordinating is already higher than the cost of this infrastructure. For one or two teams, a well-modularized monorepo does the job.',
    },
  },
  fontes: {
    'https://martinfowler.com/articles/micro-frontends.html': 'Benefits, integration approaches and costs, with a full example.',
    'https://webpack.js.org/concepts/module-federation/': 'Host, remote, exposes and shared in webpack 5.',
    'https://module-federation.io/': 'The current version of the project, for Rspack, webpack and Vite.',
    'https://module-federation.io/configure/shared': 'singleton, requiredVersion and how to avoid duplicate copies.',
    'https://micro-frontends.org/': 'Principles and composition techniques, from iframes to Web Components.',
  },
} satisfies TraducaoDeLicao;
