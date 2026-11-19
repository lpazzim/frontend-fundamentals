import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Resource priority and images',
  resumo: 'preconnect, preload, prefetch, lazy loading and responsive images: tell the browser what matters first and reserve space for what comes later.',
  objetivos: [
    'Why late-discovered resources delay the screen',
    'preconnect, preload and prefetch: when to use each',
    'Modern formats, srcset and lazy loading',
    'Reserve space for images and fonts',
  ],
  passos: {
    descoberta: {
      titulo: 'The browser only requests what it has found',
      narracao:
        'The preload scanner reads the HTML ahead of the parser and fires requests for what it finds: scripts, CSS, images in <img>. Whatever only shows up later, such as a font declared inside the CSS, a background image or a resource injected by JavaScript, is discovered late and joins the queue late. Here the title font is only requested on the third trip to the network.',
      nota: '@font-face lives in the CSS: it is only seen after it',
    },
    preconnect: {
      titulo: 'preconnect: warm up the connection',
      narracao:
        'Fetching something from another origin (a font CDN, an API) starts with DNS, TCP and TLS: several round trips before the first useful byte. <link rel="preconnect"> opens that connection early, while the browser is still reading the HTML. Use it for one or two critical origins: connections opened and never used waste CPU and are closed after a few seconds.',
      nota: '<link rel="preconnect" href="https://fonts.example">',
    },
    preload: {
      titulo: 'preload: fetch now what is critical and late',
      narracao:
        '<link rel="preload" as="font"> fetches right away a resource this page will use and that the browser would only discover late, such as the title font or an LCP image declared in CSS. For an LCP image in an <img>, fetchpriority="high" raises its priority without a preload. Too many preloads compete for bandwidth with what is truly critical, and Chrome warns in the console when a preload goes unused.',
      nota: 'preload: for THIS page, and it must be used',
    },
    prefetch: {
      titulo: 'prefetch: the next page, at low priority',
      narracao:
        '<link rel="prefetch"> fetches something likely needed for the NEXT navigation, at low priority and when the network is idle, and keeps it in the HTTP cache. The rule of thumb: preload is for this page and is a certainty; prefetch is a bet for later. The Speculation Rules API goes further and can prerender the whole next page in the background.',
    },
    imagens: {
      titulo: 'Images: format, size and laziness',
      narracao:
        'Images are often most of a page’s bytes. AVIF and WebP compress much better than JPEG and PNG. srcset and sizes let the browser pick the right file for the screen width and pixel density, instead of sending 1920 px to a phone. loading="lazy" defers what is offscreen; the exception is the LCP image, which must never be lazy.',
      nota: 'sizes gives the width; srcset lists the files',
    },
    'reservar-espaco': {
      titulo: 'Reserve space: width, height and fonts',
      narracao:
        'Every image needs width and height (or aspect-ratio): with the ratio known, the browser reserves the space before the file arrives and nothing jumps. With fonts, font-display: swap shows the text immediately in a system font and swaps when the web font arrives; tuning size-adjust on the fallback font makes that swap free of layout shift. This is the bridge to the Core Web Vitals lesson.',
      nota: 'the space exists before the file arrives',
    },
  },
  fontes: {
    'https://web.dev/articles/preload-critical-assets': 'When preload helps, when it hurts and how to check it in DevTools.',
    'https://web.dev/articles/preconnect-and-dns-prefetch': 'preconnect and dns-prefetch, and the cost of each connection.',
    'https://web.dev/articles/fetch-priority': 'fetchpriority on the LCP image and on scripts.',
    'https://web.dev/learn/images': 'A full course: formats, srcset, sizes, compression and lazy loading.',
    'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images': 'srcset, sizes and <picture> with examples.',
    'https://web.dev/articles/font-best-practices': 'font-display, font preloading and tuned fallbacks.',
    'https://developer.chrome.com/docs/web-platform/prerender-pages': 'The Speculation Rules API for prefetching and prerendering the next page.',
  },
} satisfies TraducaoDeLicao;
