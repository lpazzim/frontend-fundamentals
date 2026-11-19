import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'The event loop',
  resumo: 'Call stack, microtasks, macrotasks and the render window: why a Promise.then runs before a zero-delay setTimeout.',
  objetivos: [
    'Stack, macrotask queue and microtask queue',
    'Where setTimeout and Promise.then go',
    'Why microtasks all run in one go',
    'Where rendering fits in the loop',
    'Predict the output order of async code',
  ],
  passos: {
    'pilha-e-filas': {
      titulo: 'One stack, two queues and a render',
      narracao:
        'JavaScript in the browser runs on a single thread. Whatever is running now sits on the call stack; whatever waits its turn sits in one of two queues: microtasks (promises) or macrotasks (timers, events). Between one macrotask and the next, the browser may render. Let us follow a script with console.log, setTimeout and Promise.then.',
    },
    settimeout: {
      titulo: 'setTimeout sends the callback to the macrotasks',
      narracao:
        'The script prints A and reaches the setTimeout with a zero delay. The browser does not run the callback now: it schedules it, and the callback goes to the macrotask queue. Zero milliseconds means “as soon as possible, but after whatever is already running”.',
    },
    promise: {
      titulo: 'Promise.then sends the callback to the microtasks',
      narracao:
        'Next the script registers a Promise.then. That callback does not join the timers queue: it goes to the microtask queue, which has priority. The script has not finished yet, so none of this runs yet; the last console.log prints D.',
    },
    'microtasks-primeiro': {
      titulo: 'The stack empties and all microtasks run',
      narracao:
        'The script finishes and leaves the call stack. Before any macrotask, the event loop drains the whole microtask queue: the then moves up to the stack and prints C. If that then queued another microtask, it would also run before the timer. That is why a loop of promises can freeze the page.',
    },
    render: {
      titulo: 'With no microtasks left, the browser may render',
      narracao:
        'Microtask queue empty: now the browser gets a chance to render a frame (it does not have to on every turn; it decides based on the screen refresh rate). If the stack never empties, this step never comes. This is the bridge to the reflow lesson: rendering only happens between tasks.',
    },
    macrotask: {
      titulo: 'Only then does a macrotask reach the stack',
      narracao:
        'Finally the event loop takes ONE macrotask: the timer callback moves up to the stack and prints B. The final order is A, D, C, B: synchronous code, then all microtasks, then the next macrotask. After it the cycle starts over: microtasks, maybe a render, the next macrotask.',
      nota: 'final output: A D C B',
    },
  },
  fontes: {
    'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/': 'The exact order of tasks and microtasks, with step-by-step examples.',
    'https://www.youtube.com/watch?v=cCOL7MC4Pl0': 'Event loop, requestAnimationFrame and rendering, explained live.',
    'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide': 'When to queue a microtask and the risk of freezing the page.',
    'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops': 'The normative definition of tasks, microtasks and the rendering step.',
    'https://web.dev/articles/optimize-long-tasks': 'How to break up long tasks so the browser can respond.',
  },
} satisfies TraducaoDeLicao;
