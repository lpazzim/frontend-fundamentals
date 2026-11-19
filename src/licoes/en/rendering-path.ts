import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'How the browser builds the page',
  resumo: 'The six stages between receiving HTML and painting pixels, and why their order decides what each change costs.',
  objetivos: [
    'How the parser turns HTML into the DOM',
    'Why the CSSOM blocks rendering',
    'What goes into the render tree, and what stays out',
    'What layout computes and why it is expensive',
    'Paint and composite: from pixels to layers on screen',
  ],
  passos: {
    dom: {
      titulo: 'HTML becomes the DOM',
      narracao:
        'The parser reads the HTML top to bottom and builds a tree of nodes. Each tag opens a node; each node keeps its attributes and its children. Nothing has been measured or drawn yet: the DOM is pure structure.',
    },
    cssom: {
      titulo: 'CSS becomes the CSSOM',
      narracao:
        'In parallel, the CSS becomes a second tree. It holds the computed style for each selector, with the cascade and inheritance resolved. The CSSOM blocks rendering: until it exists, the browser does not know what anything should look like.',
    },
    'render-tree': {
      titulo: 'Two trees become one',
      narracao:
        'The DOM and the CSSOM combine into the render tree, which holds only what will be shown. A node with display: none is left out, and so is everything in the head. That is why display: none and visibility: hidden cost differently: one removes the node from here, the other does not.',
      nota: 'display: none leaves the tree; visibility: hidden stays in it',
    },
    layout: {
      titulo: 'Layout computes the geometry',
      narracao:
        'Now the browser works out where every box goes and how big it is, in pixels. This stage is also called reflow. Changing width, top or font-size, or inserting a node, forces it to redo the geometry of everything that depends on it, which makes it the most expensive stage.',
      nota: 'also called reflow',
    },
    paint: {
      titulo: 'Paint fills in the pixels',
      narracao:
        'With the geometry ready, the browser draws: colors, text, borders, shadows. The result comes out in layers, not in a single image. Changing color or background-color redoes this stage without redoing layout, which is already much cheaper.',
    },
    composite: {
      titulo: 'Composite stacks the layers',
      narracao:
        'The GPU stacks the layers in the right order and produces the frame. Animating transform or opacity stops here: no geometry is recomputed and no pixel is repainted. That is why an animation on transform runs smoothly and the same animation on left stutters.',
      nota: 'transform and opacity stop at this stage',
    },
  },
  fontes: {
    'https://web.dev/learn/performance/understanding-the-critical-path': 'Which resources block rendering and how the browser prioritizes each one.',
    'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path': 'DOM, CSSOM, render tree, layout and paint, in the same order as this lesson.',
    'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work': 'From DNS to the first pixel: the full path of a navigation.',
    'https://developer.chrome.com/blog/inside-browser-part3': 'What the main thread and the compositor do at each stage.',
    'https://developer.chrome.com/docs/chromium/renderingng-architecture': 'How Chromium implements the pipeline, with its processes and threads.',
  },
} satisfies TraducaoDeLicao;
