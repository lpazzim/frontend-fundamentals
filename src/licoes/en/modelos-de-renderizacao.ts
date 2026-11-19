import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'CSR, SSR, SSG and ISR',
  resumo: 'Where and when the HTML is generated: in the browser, on the server per request, at build time, or in a middle ground that regenerates pages and streams.',
  objetivos: [
    'Why CSR has a fast TTFB and a slow LCP',
    'What SSR gains and what it costs per request',
    'SSG: the fastest response, with frozen data',
    'ISR and streaming: the modern middle grounds',
    'Pick the model per page',
  ],
  passos: {
    csr: {
      titulo: 'CSR: the browser builds everything',
      narracao:
        'With client-side rendering, the CDN returns an almost empty HTML: a <div id="root"> and the bundle tag. The first byte arrives quickly, but nothing shows up until the JavaScript downloads, runs and fetches data from the API. FCP and LCP are delayed, and crawlers and link previews that do not run JavaScript see an empty page (Google runs it, but in a second pass).',
      nota: 'the screen only appears after the JavaScript',
    },
    ssr: {
      titulo: 'SSR: ready HTML on every request',
      narracao:
        'With server-side rendering, the server runs the components on every request, fetches the data and returns the complete HTML. Readers and crawlers see content on the first paint: LCP and SEO improve. The cost moves to the server, which pays for rendering on every request, and the TTFB now includes the time to fetch data. The page still has to hydrate to respond to clicks.',
    },
    ssg: {
      titulo: 'SSG: HTML generated at build time',
      narracao:
        'Static site generation renders the pages once, at build time, and publishes HTML files to a CDN. No server renders anything at request time: it is the fastest and cheapest response possible. The price is frozen data: if a price changes in the database, the page only changes on the next deploy. Great for docs, blogs and marketing; not for a dashboard that differs per user.',
      nota: 'the data is from the last build',
    },
    isr: {
      titulo: 'ISR: static that renews itself',
      narracao:
        'Incremental static regeneration (Next.js) serves the static page from the cache and, once the revalidation time has passed, regenerates that page in the background on the next request. Whoever asked gets the old version immediately; the following requests get the new one. It is stale-while-revalidate applied to HTML: SSG speed, with data that ages at most the chosen interval. You can also revalidate on demand, when the CMS says so.',
      nota: 'revalidate: 60 → at most 60 s stale',
    },
    streaming: {
      titulo: 'Streaming SSR: the HTML arrives in chunks',
      narracao:
        'Instead of waiting for the slowest data before sending anything, the server sends the page shell right away and keeps filling in the same response as each part becomes ready. In React, every <Suspense> is a cut point: the fallback shows first and the content arrives later, already in place. TTFB and FCP improve without giving up server HTML.',
      nota: 'each <Suspense> is a cut point in the stream',
    },
    escolher: {
      titulo: 'Choose per page, not per app',
      narracao:
        'No model always wins; the question is per page. Is the content the same for everyone and does it change rarely? SSG or ISR. Does it depend on the user or the request? SSR, ideally with streaming. Is it a logged-in area that needs no SEO? CSR is fine. Next.js, React Router, Nuxt and Astro let you mix models in the same app. And every model that ships ready HTML still pays for hydration, the topic of the next two lessons.',
    },
  },
  fontes: {
    'https://web.dev/articles/rendering-on-the-web': 'The reference text comparing CSR, SSR, static rendering and hydration.',
    'https://nextjs.org/docs/app/guides/incremental-static-regeneration': 'Time-based and on-demand revalidation, with examples.',
    'https://react.dev/reference/react-dom/server/renderToPipeableStream': 'How React streams HTML and where Suspense comes in.',
    'https://www.patterns.dev/react/streaming-ssr': 'The streaming pattern with timeline diagrams.',
    'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics': 'How Google crawls, renders and indexes pages that rely on JavaScript.',
  },
} satisfies TraducaoDeLicao;
