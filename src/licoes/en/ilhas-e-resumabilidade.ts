import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Islands, resumability and Server Components',
  resumo: 'Hydrating the whole page redoes on the client what the server already did. Three approaches attack that cost from different sides.',
  objetivos: [
    'Why full hydration is expensive',
    'Islands: hydrate only what is interactive',
    'Resumability: resume instead of repeating',
    'Server Components and the use client boundary',
    'The price of each alternative',
  ],
  passos: {
    'hidratacao-completa': {
      titulo: 'Full hydration: everything runs again',
      narracao:
        'In classic hydration the client downloads the code of every component on the page and runs the whole tree to attach handlers, including the header and the article, which will never react to anything. The server had already done that work: the client redoes it all just to find out where the events are. The bigger the page, the bigger the bundle and the dead window.',
    },
    ilhas: {
      titulo: 'Islands: only the interactive part hydrates',
      narracao:
        'The islands architecture (Astro, Fresh) treats the page as static HTML with islands of interactivity. Each island is an isolated component that downloads and hydrates on its own; the rest of the page never becomes JavaScript. In Astro, directives such as client:load, client:idle and client:visible say when each island wakes up, and an offscreen island may never even download.',
      nota: 'static HTML with islands of JavaScript',
    },
    resumabilidade: {
      titulo: 'Resumability: resume instead of repeating',
      narracao:
        'Qwik takes the idea to the extreme: the server serializes the state and the location of every handler into the HTML, and the client runs no component on load. A loader of a few kB listens for events; on the first click on buy, it downloads only the code for that handler and runs it. There is no hydration phase: the page resumes where the server left off.',
      nota: 'the state already comes serialized in the HTML',
    },
    'server-components': {
      titulo: 'Server Components: code that stays on the server',
      narracao:
        "React Server Components split the tree. Server components run only on the server (they can even read the database directly) and send the client the already-rendered result, without their own code. Only components marked 'use client' go into the bundle and hydrate. It is the islands idea inside React's component model, and it is the default in the Next.js App Router.",
    },
    custos: {
      titulo: 'Each alternative charges somewhere else',
      narracao:
        'Islands make state shared across parts of the page harder. Resumability trades hydration for a small network wait on the first interaction, which prefetching handlers helps hide. Server Components require thinking about the boundary between server and client and a framework that speaks the protocol. The question is always the same: how much of this page really needs to be interactive?',
    },
  },
  fontes: {
    'https://jasonformat.com/islands-architecture/': 'The post that popularized the term and the motivation behind it.',
    'https://docs.astro.build/en/concepts/islands/': 'Islands in practice, with the client:* directives that decide when to hydrate.',
    'https://qwik.dev/docs/concepts/resumable/': 'What gets serialized into the HTML and how Qwik resumes execution.',
    'https://react.dev/reference/rsc/server-components': 'Components that run only on the server and what goes to the client.',
    'https://react.dev/reference/rsc/use-client': 'How the directive marks the boundary between server and client.',
    'https://www.patterns.dev/vanilla/islands-architecture': 'Islands compared with SSR, SSG and progressive hydration.',
  },
} satisfies TraducaoDeLicao;
