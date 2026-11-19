import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Bundlers and the move to ESM',
  resumo: 'What a bundler does, why webpack got slow on large projects and how Vite, esbuild and the Rust tools changed the game.',
  objetivos: [
    'The module graph and what comes out of it',
    'Why bundling everything before serving gets slow',
    'A dev server with native ES modules',
    'Why Go and Rust sped builds up',
    'Why static ESM is the foundation of it all',
  ],
  passos: {
    'o-que-faz': {
      titulo: 'What a bundler does',
      narracao:
        'The bundler starts from an entry point, follows every import and builds the module graph. Then it transforms what the browser does not understand (TypeScript, JSX), joins the modules into a few files, minifies them and generates hashed names, so the cache can last forever. Without it, the browser would download hundreds of small files and would not know what to do with a .tsx.',
    },
    webpack: {
      titulo: 'webpack: bundle everything before serving',
      narracao:
        'webpack, the standard of the last decade, bundles the whole application before serving it, development included. On large projects with thousands of modules, starting the dev server could take from tens of seconds to minutes, and every edit rebundled part of the graph. The tool is extremely configurable, but it is written in JavaScript, which runs on one thread and pays the runtime cost.',
    },
    'esm-nativo': {
      titulo: 'Vite: the browser imports ESM directly',
      narracao:
        'Modern browsers understand native import. In development, Vite serves the source code as ES modules: the dev server starts instantly and the browser requests each module when it needs it, transformed on demand. Dependencies in node_modules are pre-bundled once. Editing a file invalidates only that module (HMR), not a bundle. For production Vite still bundles, because hundreds of requests are expensive on the network.',
      nota: 'every import becomes a GET from the browser itself',
    },
    nativas: {
      titulo: 'Tools written in Go and Rust',
      narracao:
        'esbuild, written in Go, showed that bundling could be 10 to 100 times faster: native code, parallelism across every core and few passes over the code. Then came SWC, Rspack, Turbopack and Rolldown, in Rust. Since Next.js 16, Turbopack is the default bundler in Next, and Vite 8 replaced the esbuild and Rollup pair with Rolldown, a single bundler for development and production.',
    },
    'por-que-esm': {
      titulo: 'Why ESM is the foundation',
      narracao:
        'import and export are static: they sit at the top of the file, with fixed names, and the whole graph can be known without running anything. CommonJS require() is a function call that can live inside an if and take a path computed at runtime. That is why the industry converged on ESM: it allows serving modules to the browser, analyzing the graph in parallel and removing unused code, the topic of the next lesson.',
    },
  },
  fontes: {
    'https://vite.dev/guide/why': 'The slow dev server problem and the native ESM solution.',
    'https://esbuild.github.io/faq/#why-is-esbuild-fast': 'Native language, parallelism and few passes, explained by the author.',
    'https://webpack.js.org/concepts/': 'Entry, output, loaders and plugins: the vocabulary of any bundler.',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules': 'ES modules in the browser: import, export and import().',
    'https://vite.dev/blog/announcing-vite8': 'Swapping esbuild and Rollup for Rolldown.',
    'https://nextjs.org/blog/next-16': 'Turbopack stable and the default for development and builds.',
    'https://rolldown.rs/guide/introduction': 'The Rust bundler compatible with the Rollup plugin API.',
  },
} satisfies TraducaoDeLicao;
