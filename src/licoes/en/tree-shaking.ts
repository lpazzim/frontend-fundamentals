import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Tree-shaking and bundle size',
  resumo: 'How the bundler removes code nobody imports, what stops that from working and how to find out what is heavy.',
  objetivos: [
    'What tree-shaking removes',
    'Why it depends on static ESM',
    'Side effects and sideEffects',
    'Why importing all of lodash is a code smell',
    'Measure the bundle and block regressions in CI',
  ],
  passos: {
    ideia: {
      titulo: 'Remove what nobody uses',
      narracao:
        'Tree-shaking means dropping from the bundle the exports no module imports. If utils.ts exports date(), currency() and slug(), and the app only imports date(), the other two do not need to reach the user. The bundler marks what is reachable from the entry point and discards the rest; the name comes from shaking the tree so the dead leaves fall off.',
    },
    'esm-estatico': {
      titulo: 'It only works with static ESM',
      narracao:
        'To know what is used without running the code, the bundler needs static import and export. With require(), the module is an object assembled at runtime: the bundler cannot prove a property is never read, so it keeps everything. Mixing CommonJS with ESM, or depending on a library published only as CommonJS, turns off tree-shaking for that piece.',
    },
    'efeitos-colaterais': {
      titulo: 'Side effects keep code around',
      narracao:
        'A module that changes something global just by being imported (a polyfill, a CSS file, a component registry) cannot be removed even if none of its exports is used. When in doubt, the bundler keeps it. The "sideEffects": false field in a library’s package.json promises its modules are pure, and lets the bundler drop whole files. Promise wrongly and the app breaks only in production.',
    },
    lodash: {
      titulo: 'Why importing all of lodash is a code smell',
      narracao:
        "import _ from 'lodash' pulls in the whole library, about 70 kB minified (25 kB gzipped), to use two functions: the lodash package is CommonJS and a single object, so there is nothing to shake. The ways out: lodash-es, which is ESM and shakes; importing by path (lodash/debounce); or switching to the native API, such as structuredClone, Array.prototype.flat and Object.groupBy. The same goes for moment, icon packs and component libraries imported whole.",
    },
    analisar: {
      titulo: 'Measure before cutting',
      narracao:
        'webpack-bundle-analyzer, rollup-plugin-visualizer (which works with Vite) and source-map-explorer draw the bundle as a map of rectangles sized by weight. The surprise is usually a heavy dependency imported whole or duplicated in two versions. Then put a size limit in CI, with size-limit for example, so the regression shows up in the pull request and not in production.',
    },
  },
  fontes: {
    'https://webpack.js.org/guides/tree-shaking/': 'ESM, sideEffects and what prevents code removal.',
    'https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking': 'A real case: finding and removing unused code.',
    'https://rollupjs.org/introduction/#tree-shaking': 'The tool that popularized the technique, explaining why ESM enables it.',
    'https://bundlephobia.com/package/lodash@4.17.21': 'Minified and gzipped size of any npm package.',
    'https://github.com/webpack/webpack-bundle-analyzer': 'An interactive treemap of the webpack bundle.',
    'https://github.com/btd/rollup-plugin-visualizer': 'The equivalent for Rollup, Rolldown and Vite.',
    'https://github.com/ai/size-limit': 'A size limit in CI that fails the build on a regression.',
  },
} satisfies TraducaoDeLicao;
