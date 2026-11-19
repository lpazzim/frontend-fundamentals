import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Reflow, repaint and composite',
  resumo: 'Three kinds of style change, three different costs. Trigger each one and watch the browser admit what it re-ran.',
  objetivos: [
    'Which stage each CSS change sends the browser back to',
    'Which properties trigger layout',
    'Which properties only repaint',
    'Why transform and opacity are cheap',
    'The 16.7 ms budget per frame',
  ],
  passos: {
    'tres-custos': {
      titulo: 'Every change goes back to some stage',
      narracao:
        'When you change a style, the browser does not redo everything: it goes back to the pipeline stage that property affects and re-runs from there. There are three possible return points: layout, paint or composite. The earlier it goes back, the more work it redoes. Use the three buttons below: each click sends a packet down the pipeline, starting at the stage the change reopens.',
      nota: 'going back earlier = redoing more',
    },
    layout: {
      titulo: 'Layout: the geometry changed, redo everything',
      narracao:
        'Changing width or top alters size and position, and that can push other elements around. The browser recomputes the geometry, then repaints, then composites. Click “width + top”: the panel marks all three stages and the PerformanceObserver records a layout-shift, proof that something moved on screen.',
      nota: 'width, height, top, left, margin, font-size',
    },
    paint: {
      titulo: 'Paint: the look changed, the geometry stays',
      narracao:
        'Changing background-color or color does not move any box: layout is reused as is. The browser only repaints the affected layer and composites again. Click “background-color”: the geometry does not change and there is no layout-shift, but paint was redone.',
      nota: 'color, background-color, box-shadow',
    },
    composite: {
      titulo: 'Composite: only moves layers around',
      narracao:
        'Changing transform or opacity is the only case that touches neither layout nor paint: the GPU just moves or blends layers that are already painted. Click “transform + opacity”: the element shifts on screen, but the layout geometry is the same and there is no layout-shift.',
      nota: 'only transform and opacity get here',
    },
    orcamento: {
      titulo: 'Why this decides smoothness',
      narracao:
        'At 60 fps each frame has about 16 ms for everything. Animating left or width forces layout on every frame; animating transform only composites. That is why this scene’s own engine animates only transform and opacity, and why the performance test makes sure composite causes no layout-shift and that this scene’s packets run with no layout at all.',
      nota: '16.7 ms per frame: animate only transform and opacity',
    },
  },
  fontes: {
    'https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count': 'Why transform and opacity run on the compositor, and the cost of creating layers.',
    'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing': 'Forced synchronous layout: reading geometry right after writing style.',
    'https://web.dev/articles/rendering-performance': 'The pixel pipeline and the budget of each frame.',
    'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change': 'The compositing hint, and why to use it sparingly.',
    'https://gist.github.com/paulirish/5d52fb081b3570c81e3a': 'The properties and methods that force layout when read.',
  },
} satisfies TraducaoDeLicao;
