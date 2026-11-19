import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Composition patterns',
  resumo: 'Composition over inheritance, and when to use render props, hooks or compound components to share behavior.',
  objetivos: [
    'Why React prefers composition over inheritance',
    'Render props: delegate what to draw',
    'Custom hooks: logic without a component',
    'Compound components: one API in several parts',
    'Pick the pattern by the problem',
  ],
  passos: {
    heranca: {
      titulo: 'Inheritance: the hierarchy that locks you in',
      narracao:
        'In object-oriented code it is common to create ButtonBase, Primary extends ButtonBase, WithIcon extends Primary… Every new variant forces you to pick a spot in a rigid tree, and the child inherits everything from the parent, including what it did not want. The React docs note that, across thousands of components at Facebook, no case came up where inheritance hierarchies were the recommendation.',
    },
    composicao: {
      titulo: 'Composition: assembling parts',
      narracao:
        'Composition combines independent parts: <Button variant="primary" icon={<Arrow />}>Save</Button>. Props and children cover almost every kind of visual reuse, with no hierarchy at all. The harder question is how to share BEHAVIOR (state, events, effects) between different components, and that is where the next three patterns come in.',
    },
    'render-props': {
      titulo: 'Render props: the component asks what to draw',
      narracao:
        'A component with a render prop handles the behavior and delegates rendering to a function: <Mouse render={(pos) => <Cursor {...pos} />} />. It was the dominant pattern before hooks. The cost is nesting when several are combined and a new function on every render. It is still useful when the component needs to decide WHERE and WHEN something appears, as in a virtualized list.',
    },
    hooks: {
      titulo: 'Hooks: logic without a component',
      narracao:
        'A custom hook pulls stateful logic out into a function: const pos = useMouse(). The component decides on its own what to draw, with no nesting, and several hooks combine in sequence. Note: hooks share logic, not state. Every component that calls useMouse gets its own copy. It is the standard way to reuse behavior in today’s React.',
      nota: 'const pos = useMouse()',
    },
    compound: {
      titulo: 'Compound components: one API in several parts',
      narracao:
        'When several parts work together, such as Tabs, Select or Accordion, compound components expose the parts and hide the shared state in an internal Context: <Tabs><Tabs.List><Tabs.Tab /></Tabs.List><Tabs.Panel /></Tabs>. The consumer controls the order and the markup; the parent controls which tab is active. Libraries such as Radix UI are built this way.',
      nota: 'the parts read the state through the Tabs Context',
    },
    escolher: {
      titulo: 'Which pattern to use',
      narracao:
        'Reusing appearance: props and children. Reusing stateful logic: a custom hook. A set of parts that share state and that the consumer assembles: compound components. A component that has to decide when to render something another one defines: a render prop. When in doubt, start with the simplest, with the same goal as the previous lesson: small interface, hidden complexity.',
    },
  },
  fontes: {
    'https://legacy.reactjs.org/docs/composition-vs-inheritance.html': 'The classic text on children and why to avoid inheritance between components.',
    'https://react.dev/learn/reusing-logic-with-custom-hooks': 'Extract stateful logic and why each call has its own state.',
    'https://www.patterns.dev/react/compound-pattern': 'Compound components with Context, step by step.',
    'https://www.patterns.dev/react/render-props-pattern': 'Benefits, problems and what hooks replaced.',
    'https://www.patterns.dev/react/hooks-pattern': 'A direct comparison with classes, HOCs and render props.',
    'https://kentcdodds.com/blog/compound-components-with-react-hooks': 'A compound Toggle built with hooks and Context.',
    'https://www.radix-ui.com/primitives/docs/guides/composition': 'How a real component library exposes parts and asChild.',
  },
} satisfies TraducaoDeLicao;
