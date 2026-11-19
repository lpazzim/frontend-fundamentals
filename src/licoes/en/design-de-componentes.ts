import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Deep components',
  resumo: 'Small interface, hidden complexity: what makes a component easy to use, and why prop drilling is a modeling symptom, not a lack of Context.',
  objetivos: [
    'Recognize a shallow component',
    'What a deep module is',
    'Separate fetching data from displaying it',
    'Read prop drilling as a symptom',
    'Solve it with composition before Context',
  ],
  passos: {
    raso: {
      titulo: 'A shallow component: 15 props',
      narracao:
        'Picture a <DataTable> with 15 props: sortColumn, sortDirection, onSortChange, page, pageSize, onPageChange, isLoading, emptyText… Every screen that uses it has to understand and coordinate all of that, and both screens end up with the same sorting and pagination code. The interface is almost as big as the implementation: the component hides little and pushes the work onto its users.',
    },
    profundo: {
      titulo: 'A deep component: little interface, a lot inside',
      narracao:
        'John Ousterhout calls a module deep when its interface is small compared to what it does. <DataTable data={orders} columns={columns} /> can handle sorting, pagination and loading state inside, with sensible defaults and an escape hatch for the rare case. The consumer passes what only it knows (which data, which columns); the component decides the rest.',
      nota: 'small interface, large implementation',
    },
    acoplamento: {
      titulo: 'Separate fetching from displaying',
      narracao:
        'A UI component that imports the HTTP client and knows the exact shape of the API response is stuck to that screen and that endpoint. Split the responsibilities: a hook (or the route loader) fetches and translates the data, and the component receives values already shaped for the interface. Then it can be tested with sample data, reused and maintained without touching the API.',
    },
    'prop-drilling': {
      titulo: 'Prop drilling is a symptom',
      narracao:
        'Here the user goes through Layout and Sidebar, which do not use it, just to reach the Avatar. The usual reaction is to create a Context. Often, though, the problem is modeling: the components in the middle exist only to pass things along, and any change to the prop touches all of them. Before hiding the path in a Context, ask why the data has to travel that path.',
    },
    composicao: {
      titulo: 'Composition solves it before Context',
      narracao:
        "With children, App builds <Layout><Sidebar><Avatar user={user} /></Sidebar></Layout>: Layout and Sidebar draw the structure without knowing the user, and the data goes straight from whoever has it to whoever uses it. That is what React's own docs suggest before reaching for Context. Context is still right for what is global and rarely changes, such as theme, language and the signed-in user.",
      nota: 'whoever has the data renders whoever needs it',
    },
  },
  fontes: {
    'https://www.youtube.com/watch?v=bmSAYlu0NcY': 'Deep and shallow modules, told by the author of the concept.',
    'https://react.dev/learn/passing-data-deeply-with-context': 'The “Before you use context” section: props and children first.',
    'https://react.dev/learn/passing-props-to-a-component': 'Pass JSX as children to compose components.',
    'https://kentcdodds.com/blog/prop-drilling': 'When prop drilling is fine and when it points to a problem.',
    'https://react.dev/learn/thinking-in-react': 'Break the UI into components and decide where state lives.',
    'https://www.patterns.dev/react/presentational-container-pattern': 'Separate fetching from display, and how hooks changed this pattern.',
  },
} satisfies TraducaoDeLicao;
