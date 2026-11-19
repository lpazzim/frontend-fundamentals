import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Core Web Vitals',
  resumo: 'LCP, CLS and INP: what each metric measures, where the number comes from and what makes it worse.',
  objetivos: [
    'What LCP, CLS and INP ask',
    "What defines a page's LCP",
    'Why reserving space avoids CLS',
    'How long tasks hurt INP',
    'Measure in the field instead of memorizing numbers',
  ],
  passos: {
    'tres-metricas': {
      titulo: 'Three metrics, three questions',
      narracao:
        'Core Web Vitals answer three questions about the experience: did the page load fast (LCP), did it stay stable while loading (CLS), and did it respond when the reader interacted (INP). Each has a threshold below which Google considers the experience good: 2.5 s, 0.1 and 200 ms. INP replaced FID in March 2024; FID only measured the delay of the first interaction.',
    },
    lcp: {
      titulo: 'LCP: when the largest element appears',
      narracao:
        'Largest Contentful Paint marks the moment the largest visible element (usually a hero image or a block of text) finishes painting. It goes up with a slow server, render-blocking CSS and a heavy image with no priority. You can measure it with a PerformanceObserver of type largest-contentful-paint.',
      nota: 'the largest visible element defines the LCP',
    },
    cls: {
      titulo: 'CLS: content that jumps',
      narracao:
        'Cumulative Layout Shift adds up how much visible elements move without the reader asking. Look at the text: the banner arrived late, with no reserved space, and pushed the text along. An image without width and height, a late ad and a font that changes size do the same. It is the layout-shift this project’s performance test looks for.',
      nota: 'with no reserved space, the banner pushed the text',
    },
    inp: {
      titulo: 'INP: how long the response takes',
      narracao:
        'Interaction to Next Paint measures the time between an interaction (click, tap, key) and the next painted frame, and reports one of the worst interactions of the visit. Here the click reaches a main thread busy with a long task: the packet is held, pulsing, before the response comes back. It is the event loop lesson sending the bill.',
      nota: 'break long tasks into smaller pieces',
    },
    medir: {
      titulo: 'Measure, do not memorize',
      narracao:
        'With space reserved for the banner and the long task broken up, all three numbers are good. They come from the browser, not from an estimate: LCP and CLS via PerformanceObserver, INP via the Event Timing API. Lab numbers (one machine, one network) and field numbers (real users) differ, and Google evaluates the field. This lesson is still a model; measuring in your browser comes in the polish phase.',
    },
  },
  fontes: {
    'https://web.dev/articles/vitals': 'The metrics, the thresholds and how Google evaluates field data.',
    'https://web.dev/articles/lcp': 'Which elements count and how to measure with PerformanceObserver.',
    'https://web.dev/articles/cls': 'How the score is added up in session windows.',
    'https://web.dev/articles/inp': 'The three phases of an interaction: delay, processing and presentation.',
    'https://web.dev/blog/inp-cwv-march-12': 'The announcement of INP replacing FID, in 2024.',
    'https://web.dev/articles/optimize-lcp': 'The four parts of LCP and what to attack in each.',
  },
} satisfies TraducaoDeLicao;
