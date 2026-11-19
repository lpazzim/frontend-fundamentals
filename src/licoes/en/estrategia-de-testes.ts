import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Frontend testing strategy',
  resumo: 'Unit, integration and E2E: what each layer proves, what it costs, and why testing visible behavior separates useful tests from brittle ones.',
  objetivos: [
    'The pyramid: cost and confidence per layer',
    'What a unit test covers well',
    'Integration: the best return on the frontend',
    'E2E only for critical flows',
    'Test behavior, not implementation',
  ],
  passos: {
    piramide: {
      titulo: 'The pyramid: many fast, few slow',
      narracao:
        'The test pyramid, from Mike Cohn and popularized by Martin Fowler, says: many small, fast tests at the base, fewer integration tests in the middle, few end-to-end tests at the top. The higher you go, the more confidence each test gives about the real product, and the slower, more expensive and flakier it is to maintain.',
      nota: 'confidence goes up, speed goes down',
    },
    unitario: {
      titulo: 'Unit: pure logic',
      narracao:
        'A unit test covers a function with no DOM and no network: formatting a price, validating a form, computing the next step. It runs in milliseconds and points exactly at what broke. In this project, the lesson schema, step navigation and the scene legibility checker are tested this way, with Vitest. What it does not prove is whether the parts work together.',
    },
    integracao: {
      titulo: 'Integration: components and hooks together',
      narracao:
        'On the frontend, the layer that usually pays off most is integration: render a component with its real children, hooks and Context, and mock only the boundary, the network (with MSW, for example). Kent C. Dodds calls this shape the testing trophy: static analysis at the base (TypeScript, ESLint), a few unit tests, the bulk in integration and some E2E at the top.',
    },
    e2e: {
      titulo: 'E2E: the path of a real user',
      narracao:
        'Playwright and Cypress open a real browser and walk the app like a person: navigate, click, type, check the screen. They catch what no other layer catches (routing, the build, the backend integration), but they are slow and timing-sensitive. Use them for critical flows, such as sign-in and checkout, and wait for states, never for sleeps: this project’s tests wait for the data-atalhos attribute.',
    },
    comportamento: {
      titulo: 'Test what the user sees',
      narracao:
        'The Testing Library principle: the more a test resembles real use, the more confidence it gives. Instead of reading internal state or searching by className, query the way a person looks: getByRole("button", { name: "Save" }), getByLabelText("Email"). A test like that survives refactoring and only breaks when the behavior breaks.',
    },
    frageis: {
      titulo: 'What makes a test brittle',
      narracao:
        'Swap useState for useReducer without changing anything on screen: the test that read the state breaks (the red X), while the one that queried by role stays green. Tests coupled to the implementation raise false alarms that teach the team to ignore CI; over-mocking does the opposite, the test passes and the app breaks. Bonus: querying by role and accessible name also tests accessibility, the topic of the next lesson.',
    },
  },
  fontes: {
    'https://martinfowler.com/articles/practical-test-pyramid.html': 'The pyramid explained layer by layer, with examples.',
    'https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications': 'Why integration gives the best return on the frontend.',
    'https://testing-library.com/docs/guiding-principles': 'Test the software the way it is used.',
    'https://testing-library.com/docs/queries/about/#priority': 'Which query to try first: getByRole, getByLabelText...',
    'https://kentcdodds.com/blog/testing-implementation-details': 'False negatives and false positives of coupled tests.',
    'https://playwright.dev/docs/best-practices': 'Role-based locators, auto-waiting and test isolation.',
    'https://mswjs.io/docs/': 'Mock the network at the fetch level, the same in tests and in the browser.',
  },
} satisfies TraducaoDeLicao;
