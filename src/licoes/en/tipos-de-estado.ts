import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Server, client and URL state',
  resumo: 'Three kinds of state with different owners, and why keeping server data in a generic store means reinventing a cache.',
  objetivos: [
    'Tell client, server and URL state apart',
    'Why server state goes stale and needs a cache',
    'What belongs in the URL',
    'Why plain Redux for server state is redundant',
    'One owner for each piece of state',
  ],
  passos: {
    'tres-donos': {
      titulo: 'Not all state is the same',
      narracao:
        'A search filter, an open modal and the list of orders all look like “state”, but they have different owners. Client state belongs to the interface and only exists in this browser. Server state is a copy of something that lives on the server and can change without you knowing. URL state is whatever has to survive a reload, a shared link and the back button.',
    },
    'client-state': {
      titulo: 'Client state: synchronous and yours',
      narracao:
        'Open modal, active tab, text not yet submitted: the browser is the owner, reading is synchronous and the value never goes stale. useState in the component covers most of it; when distant components need the same value, Context or a small store such as Zustand. There is no cache, revalidation or loading state to manage.',
    },
    'server-state': {
      titulo: 'Server state: a copy that ages',
      narracao:
        'The list of orders is not yours: you hold a snapshot of it. This state is asynchronous, shared with other users and goes stale without warning. It needs a cache by key, deduplication of identical requests, revalidation, retries and invalidation after mutations. That is exactly what TanStack Query, SWR and RTK Query do, and the topic of the next lesson.',
    },
    'url-state': {
      titulo: 'URL state: what must survive the link',
      narracao:
        'Filters, sorting, current page and a dashboard tab are better off in the URL (?status=paid&page=2). Deep links, the back button and sharing come for free. This project does that with the step of each lesson: it lives in the route, not in a useState, which is why the browser back button and direct links work with no sync code at all.',
      nota: '/licao/$slug/$passo: the step lives in the URL',
    },
    'redux-redundante': {
      titulo: 'Server state in a generic store is a hand-made cache',
      narracao:
        'Keeping the API response in plain Redux forces you to write, for every endpoint, loading, success and error actions, decide when to refetch, deduplicate calls and invalidate after mutations: a reinvented cache, with bugs. That is why the Redux team itself created RTK Query. What is left for a global store is usually a small amount of real client state.',
    },
    'um-dono': {
      titulo: 'One owner for each piece of state',
      narracao:
        'The rule of thumb: data that came from the server goes into a server-state library; what needs a link goes into the URL; the rest stays as close as possible to where it is used, and only moves up to Context or a store when distant components need it. Duplicating the same data in two places, such as copying the API response into a useState, is the source of most out-of-sync state bugs.',
    },
  },
  fontes: {
    'https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state': 'The split between server state and client state, in the words of the library authors.',
    'https://redux.js.org/tutorials/essentials/part-7-rtk-query-basics': 'Why the Redux team recommends not writing data caching by hand.',
    'https://kentcdodds.com/blog/application-state-management-with-react': 'Keep state close to where it is used, and when to move it up to Context.',
    'https://react.dev/learn/choosing-the-state-structure': 'Avoid duplicated, redundant or derivable state.',
    'https://tanstack.com/router/latest/docs/guide/search-params': 'Typed, validated search params as application state.',
    'https://tkdodo.eu/blog/practical-react-query': 'A series of posts on using TanStack Query day to day.',
  },
} satisfies TraducaoDeLicao;
