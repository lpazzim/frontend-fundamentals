import type { TraducaoDeLicao } from '../traducao';

export default {
  titulo: 'Client-side cache',
  resumo: 'Stale-while-revalidate, invalidation by key and optimistic updates with rollback when the server says no.',
  objetivos: [
    'Cache miss and cache hit',
    'Stale-while-revalidate in practice',
    'Invalidate by key after a mutation',
    'Optimistic update and rollback',
  ],
  passos: {
    miss: {
      titulo: 'Empty cache: a trip to the server',
      narracao:
        'The first read of a key finds nothing in the cache. The client asks the server, waits, stores the response under a key (for example ["post", 7]) and hands it to the screen. The key is the identity of the data: everything else depends on it.',
      nota: 'cache miss',
    },
    hit: {
      titulo: 'Second read: instant response',
      narracao:
        'Now the key exists in the cache and the screen is served right away, with no network: the packet never reaches the server. The cost is the risk of showing data that has already changed there. The question becomes how long to trust it.',
      nota: 'cache hit',
    },
    swr: {
      titulo: 'Stale-while-revalidate: show the old, fetch the new',
      narracao:
        'With the data expired (stale), the screen is served from the cache immediately and, in parallel, a revalidation fetches the current version. When it arrives, cache and screen are updated. The reader never waits on an empty screen, and the data converges to the correct one.',
    },
    invalidacao: {
      titulo: 'Invalidate by key after a mutation',
      narracao:
        'When the reader edits post 7, any copy of it in the cache becomes suspect. Invalidating the key ["post", 7] marks it as stale and triggers a refetch; the other keys stay intact. Invalidate too much and you redo requests for nothing; invalidate too little and stale data stays on screen.',
    },
    otimista: {
      titulo: 'Optimistic update: the screen changes before the server',
      narracao:
        'To feel instant, the client writes the change to the cache and the screen right away, and only then sends it to the server, keeping the previous version. The packet is held at the server while it decides; if all goes well, nobody noticed the wait.',
    },
    rollback: {
      titulo: 'The server refuses: rollback',
      narracao:
        'The request fails (the red X). The client restores the version saved in the cache and on screen, and lets the reader know. That is why an optimistic update requires keeping the previous state: without it, there is no way to undo a promise that was not kept.',
      nota: 'rollback',
    },
  },
  fontes: {
    'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults': 'staleTime, gcTime and when the library refetches on its own.',
    'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates': 'onMutate, rollback and invalidation, step by step.',
    'https://tkdodo.eu/blog/effective-react-query-keys': 'How to organize keys to invalidate precisely.',
    'https://www.rfc-editor.org/rfc/rfc5861.html': 'The origin of stale-while-revalidate, in the HTTP cache.',
    'https://swr.vercel.app/docs/getting-started': 'The same strategy in another library, named after the RFC.',
  },
} satisfies TraducaoDeLicao;
