// Gerado por src/licoes/catalogo.test.ts a partir das licoes. Nao edite a mao:
// depois de mudar uma licao ou uma traducao, rode `npm run catalogo`.
import type { Catalogo } from './resumo';

export const CATALOGO: Catalogo = {
  "pt-BR": [
    {
      "slug": "rendering-path",
      "modulo": "renderizacao",
      "titulo": "Como o browser monta a página",
      "resumo": "Os seis estágios entre receber o HTML e pintar pixels, e por que a ordem deles decide o custo de cada mudança.",
      "dificuldade": "iniciante",
      "minutos": 8,
      "fidelidade": "modelo",
      "passos": [
        "HTML vira DOM",
        "CSS vira CSSOM",
        "As duas árvores viram uma",
        "Layout calcula a geometria",
        "Paint preenche os pixels",
        "Composite junta as camadas"
      ]
    },
    {
      "slug": "reflow-repaint-composite",
      "modulo": "renderizacao",
      "titulo": "Reflow, repaint e composite",
      "resumo": "Três tipos de mudança de estilo, três custos diferentes. Dispare cada uma e veja o browser admitir o que re-executou.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "medido",
      "laboratorio": "custo-de-renderizacao",
      "passos": [
        "Toda mudança volta a algum estágio",
        "Layout: mudou a geometria, refaz tudo",
        "Paint: mudou a aparência, a geometria fica",
        "Composite: só reposiciona camadas",
        "Por que isso decide a fluidez"
      ]
    },
    {
      "slug": "event-loop",
      "modulo": "execucao",
      "titulo": "O event loop",
      "resumo": "Call stack, microtasks, macrotasks e a janela de render: por que um Promise.then roda antes de um setTimeout de zero.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "Uma pilha, duas filas e um render",
        "setTimeout manda o callback para as macrotasks",
        "Promise.then manda o callback para as microtasks",
        "A pilha esvazia e as microtasks rodam todas",
        "Com as microtasks vazias, o browser pode renderizar",
        "Só então uma macrotask entra na pilha"
      ]
    },
    {
      "slug": "vdom-reatividade",
      "modulo": "execucao",
      "titulo": "Virtual DOM e reatividade fina",
      "resumo": "Dois modelos de propagar uma mudança de estado: reexecutar componentes ou atualizar só quem depende do valor.",
      "dificuldade": "avancado",
      "minutos": 11,
      "fidelidade": "modelo",
      "passos": [
        "A mesma interface, dois modelos",
        "O estado muda: quem reexecuta?",
        "Reexecutar não é repintar: o diff",
        "Reconciliation: como o diff decide",
        "Não há vencedor, há custos diferentes"
      ]
    },
    {
      "slug": "modelos-de-renderizacao",
      "modulo": "execucao",
      "titulo": "CSR, SSR, SSG e ISR",
      "resumo": "Onde e quando o HTML é gerado: no browser, no servidor a cada pedido, no build ou num meio-termo que regenera páginas e faz streaming.",
      "dificuldade": "intermediario",
      "minutos": 11,
      "fidelidade": "modelo",
      "passos": [
        "CSR: o browser monta tudo",
        "SSR: HTML pronto a cada pedido",
        "SSG: HTML gerado no build",
        "ISR: estático que se renova",
        "Streaming SSR: o HTML chega em partes",
        "Escolher por página, não por app"
      ]
    },
    {
      "slug": "hidratacao",
      "modulo": "execucao",
      "titulo": "Hidratação",
      "resumo": "Por que HTML pronto na tela ainda não responde a cliques, e o que o JavaScript precisa fazer para ligar a página.",
      "dificuldade": "intermediario",
      "minutos": 8,
      "fidelidade": "modelo",
      "passos": [
        "O HTML chega pronto e aparece",
        "O botão está na tela, mas inerte",
        "O JavaScript chega e ocupa a main thread",
        "Hidratar é reconstruir a árvore e anexar handlers",
        "Agora a página responde"
      ]
    },
    {
      "slug": "ilhas-e-resumabilidade",
      "modulo": "execucao",
      "titulo": "Ilhas, resumabilidade e Server Components",
      "resumo": "Hidratar a página inteira refaz no cliente o que o servidor já fez. Três abordagens atacam esse custo de lados diferentes.",
      "dificuldade": "avancado",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Hidratação completa: tudo roda de novo",
        "Ilhas: só o interativo hidrata",
        "Resumabilidade: retomar em vez de repetir",
        "Server Components: código que fica no servidor",
        "Cada alternativa cobra em outro lugar"
      ]
    },
    {
      "slug": "core-web-vitals",
      "modulo": "entrega",
      "titulo": "Core Web Vitals",
      "resumo": "LCP, CLS e INP: o que cada métrica mede, de onde vem o número e o que o piora.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Três métricas, três perguntas",
        "LCP: quando o maior elemento aparece",
        "CLS: o conteúdo que pula",
        "INP: quanto demora a resposta",
        "Medir, não decorar"
      ]
    },
    {
      "slug": "carregamento-de-recursos",
      "modulo": "entrega",
      "titulo": "Prioridade de recursos e imagens",
      "resumo": "preconnect, preload, prefetch, lazy loading e imagens responsivas: dizer ao browser o que importa primeiro e reservar o espaço do que vem depois.",
      "dificuldade": "intermediario",
      "minutos": 11,
      "fidelidade": "modelo",
      "passos": [
        "O browser só pede o que já descobriu",
        "preconnect: aquecer a conexão",
        "preload: buscar já o que é crítico e tardio",
        "prefetch: a próxima página, em baixa prioridade",
        "Imagens: formato, tamanho e preguiça",
        "Reservar espaço: width, height e fontes"
      ]
    },
    {
      "slug": "code-splitting",
      "modulo": "entrega",
      "titulo": "Code splitting",
      "resumo": "O que sai do bundle inicial, quando volta e o que muda quando o import vira dinâmico.",
      "dificuldade": "intermediario",
      "minutos": 8,
      "fidelidade": "modelo",
      "passos": [
        "Import estático: tudo no bundle inicial",
        "import() corta o gráfico em dois",
        "O chunk só viaja quando alguém precisa dele",
        "Prefetch paga a espera antes"
      ]
    },
    {
      "slug": "tipos-de-estado",
      "modulo": "arquitetura",
      "titulo": "Server, client e URL state",
      "resumo": "Três tipos de estado com donos diferentes, e por que guardar dados do servidor num store genérico é reinventar um cache.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Nem todo estado é igual",
        "Client state: síncrono e seu",
        "Server state: uma cópia que envelhece",
        "URL state: o que precisa sobreviver ao link",
        "Server state num store genérico é cache feito à mão",
        "Um dono para cada estado"
      ]
    },
    {
      "slug": "cache-cliente",
      "modulo": "arquitetura",
      "titulo": "Cache no cliente",
      "resumo": "Stale-while-revalidate, invalidação por chave e update otimista com rollback quando o servidor recusa.",
      "dificuldade": "avancado",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "Cache vazio: ida ao servidor",
        "Segunda leitura: resposta instantânea",
        "Stale-while-revalidate: mostra o velho, busca o novo",
        "Invalidar por chave depois de uma mutação",
        "Update otimista: a tela muda antes do servidor",
        "O servidor recusa: rollback"
      ]
    },
    {
      "slug": "design-de-componentes",
      "modulo": "arquitetura",
      "titulo": "Componentes profundos",
      "resumo": "Interface pequena, complexidade escondida: o que torna um componente fácil de usar, e por que prop drilling é sintoma de modelagem, não falta de Context.",
      "dificuldade": "avancado",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Um componente raso: 15 props",
        "Um componente profundo: pouca interface, muito dentro",
        "Separar quem busca de quem exibe",
        "Prop drilling é um sintoma",
        "Composição resolve antes do Context"
      ]
    },
    {
      "slug": "padroes-de-composicao",
      "modulo": "arquitetura",
      "titulo": "Padrões de composição",
      "resumo": "Composição em vez de herança, e quando usar render props, hooks ou compound components para compartilhar comportamento.",
      "dificuldade": "avancado",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "Herança: a hierarquia que engessa",
        "Composição: montar peças",
        "Render props: o componente pergunta o que desenhar",
        "Hooks: lógica sem componente",
        "Compound components: uma API em várias peças",
        "Qual padrão usar"
      ]
    },
    {
      "slug": "bundlers",
      "modulo": "ferramentas",
      "titulo": "Bundlers e o salto para ESM",
      "resumo": "O que um bundler faz, por que o webpack ficou lento em projetos grandes e como o Vite, o esbuild e as ferramentas em Rust mudaram o jogo.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "O que um bundler faz",
        "webpack: empacotar tudo antes de servir",
        "Vite: o browser importa ESM direto",
        "Ferramentas em Go e Rust",
        "Por que ESM é a base"
      ]
    },
    {
      "slug": "tree-shaking",
      "modulo": "ferramentas",
      "titulo": "Tree-shaking e o tamanho do bundle",
      "resumo": "Como o bundler remove o código que ninguém importa, o que impede isso de funcionar e como descobrir o que está pesando.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Remover o que ninguém usa",
        "Só funciona com ESM estático",
        "Efeitos colaterais seguram código",
        "Por que lodash inteiro é um code smell",
        "Medir antes de cortar"
      ]
    },
    {
      "slug": "micro-frontends",
      "modulo": "ferramentas",
      "titulo": "Micro-frontends e Module Federation",
      "resumo": "Dividir um frontend grande em partes com deploy independente: quando compensa, como o Module Federation carrega código de outro deploy e quanto isso custa.",
      "dificuldade": "avancado",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Um frontend, muitos times",
        "Micro-frontends: fatias com deploy próprio",
        "Module Federation: importar código de outro deploy",
        "O problema das dependências duplicadas",
        "Quando o custo compensa"
      ]
    },
    {
      "slug": "estrategia-de-testes",
      "modulo": "qualidade",
      "titulo": "Estratégia de testes no frontend",
      "resumo": "Unitário, integração e E2E: o que cada camada prova, quanto custa, e por que testar o comportamento visível separa teste útil de teste frágil.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "A pirâmide: muitos rápidos, poucos lentos",
        "Unitário: lógica pura",
        "Integração: componentes e hooks juntos",
        "E2E: o caminho de um usuário de verdade",
        "Testar o que o usuário vê",
        "O que torna um teste frágil"
      ]
    },
    {
      "slug": "acessibilidade",
      "modulo": "qualidade",
      "titulo": "Acessibilidade e semântica",
      "resumo": "HTML semântico como base gratuita, a árvore de acessibilidade, foco pelo teclado, contraste e aria-live para conteúdo que muda sozinho.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "O browser monta mais uma árvore",
        "HTML semântico é acessibilidade de graça",
        "ARIA: para o que o HTML não cobre",
        "Foco e teclado",
        "Contraste e cor",
        "aria-live: anunciar o que muda sozinho"
      ]
    }
  ],
  "en": [
    {
      "slug": "rendering-path",
      "modulo": "renderizacao",
      "titulo": "How the browser builds the page",
      "resumo": "The six stages between receiving HTML and painting pixels, and why their order decides what each change costs.",
      "dificuldade": "iniciante",
      "minutos": 8,
      "fidelidade": "modelo",
      "passos": [
        "HTML becomes the DOM",
        "CSS becomes the CSSOM",
        "Two trees become one",
        "Layout computes the geometry",
        "Paint fills in the pixels",
        "Composite stacks the layers"
      ]
    },
    {
      "slug": "reflow-repaint-composite",
      "modulo": "renderizacao",
      "titulo": "Reflow, repaint and composite",
      "resumo": "Three kinds of style change, three different costs. Trigger each one and watch the browser admit what it re-ran.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "medido",
      "laboratorio": "custo-de-renderizacao",
      "passos": [
        "Every change goes back to some stage",
        "Layout: the geometry changed, redo everything",
        "Paint: the look changed, the geometry stays",
        "Composite: only moves layers around",
        "Why this decides smoothness"
      ]
    },
    {
      "slug": "event-loop",
      "modulo": "execucao",
      "titulo": "The event loop",
      "resumo": "Call stack, microtasks, macrotasks and the render window: why a Promise.then runs before a zero-delay setTimeout.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "One stack, two queues and a render",
        "setTimeout sends the callback to the macrotasks",
        "Promise.then sends the callback to the microtasks",
        "The stack empties and all microtasks run",
        "With no microtasks left, the browser may render",
        "Only then does a macrotask reach the stack"
      ]
    },
    {
      "slug": "vdom-reatividade",
      "modulo": "execucao",
      "titulo": "Virtual DOM and fine-grained reactivity",
      "resumo": "Two ways to propagate a state change: re-run components, or update only what depends on the value.",
      "dificuldade": "avancado",
      "minutos": 11,
      "fidelidade": "modelo",
      "passos": [
        "Same interface, two models",
        "State changes: who re-runs?",
        "Re-running is not repainting: the diff",
        "Reconciliation: how the diff decides",
        "No winner, just different costs"
      ]
    },
    {
      "slug": "modelos-de-renderizacao",
      "modulo": "execucao",
      "titulo": "CSR, SSR, SSG and ISR",
      "resumo": "Where and when the HTML is generated: in the browser, on the server per request, at build time, or in a middle ground that regenerates pages and streams.",
      "dificuldade": "intermediario",
      "minutos": 11,
      "fidelidade": "modelo",
      "passos": [
        "CSR: the browser builds everything",
        "SSR: ready HTML on every request",
        "SSG: HTML generated at build time",
        "ISR: static that renews itself",
        "Streaming SSR: the HTML arrives in chunks",
        "Choose per page, not per app"
      ]
    },
    {
      "slug": "hidratacao",
      "modulo": "execucao",
      "titulo": "Hydration",
      "resumo": "Why HTML that is already on screen still ignores clicks, and what JavaScript has to do to switch the page on.",
      "dificuldade": "intermediario",
      "minutos": 8,
      "fidelidade": "modelo",
      "passos": [
        "The HTML arrives ready and shows up",
        "The button is on screen, but inert",
        "The JavaScript arrives and takes the main thread",
        "Hydrating means rebuilding the tree and attaching handlers",
        "Now the page responds"
      ]
    },
    {
      "slug": "ilhas-e-resumabilidade",
      "modulo": "execucao",
      "titulo": "Islands, resumability and Server Components",
      "resumo": "Hydrating the whole page redoes on the client what the server already did. Three approaches attack that cost from different sides.",
      "dificuldade": "avancado",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Full hydration: everything runs again",
        "Islands: only the interactive part hydrates",
        "Resumability: resume instead of repeating",
        "Server Components: code that stays on the server",
        "Each alternative charges somewhere else"
      ]
    },
    {
      "slug": "core-web-vitals",
      "modulo": "entrega",
      "titulo": "Core Web Vitals",
      "resumo": "LCP, CLS and INP: what each metric measures, where the number comes from and what makes it worse.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Three metrics, three questions",
        "LCP: when the largest element appears",
        "CLS: content that jumps",
        "INP: how long the response takes",
        "Measure, do not memorize"
      ]
    },
    {
      "slug": "carregamento-de-recursos",
      "modulo": "entrega",
      "titulo": "Resource priority and images",
      "resumo": "preconnect, preload, prefetch, lazy loading and responsive images: tell the browser what matters first and reserve space for what comes later.",
      "dificuldade": "intermediario",
      "minutos": 11,
      "fidelidade": "modelo",
      "passos": [
        "The browser only requests what it has found",
        "preconnect: warm up the connection",
        "preload: fetch now what is critical and late",
        "prefetch: the next page, at low priority",
        "Images: format, size and laziness",
        "Reserve space: width, height and fonts"
      ]
    },
    {
      "slug": "code-splitting",
      "modulo": "entrega",
      "titulo": "Code splitting",
      "resumo": "What leaves the initial bundle, when it comes back and what changes when the import becomes dynamic.",
      "dificuldade": "intermediario",
      "minutos": 8,
      "fidelidade": "modelo",
      "passos": [
        "Static import: everything in the initial bundle",
        "import() cuts the graph in two",
        "The chunk only travels when someone needs it",
        "Prefetch pays the wait in advance"
      ]
    },
    {
      "slug": "tipos-de-estado",
      "modulo": "arquitetura",
      "titulo": "Server, client and URL state",
      "resumo": "Three kinds of state with different owners, and why keeping server data in a generic store means reinventing a cache.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Not all state is the same",
        "Client state: synchronous and yours",
        "Server state: a copy that ages",
        "URL state: what must survive the link",
        "Server state in a generic store is a hand-made cache",
        "One owner for each piece of state"
      ]
    },
    {
      "slug": "cache-cliente",
      "modulo": "arquitetura",
      "titulo": "Client-side cache",
      "resumo": "Stale-while-revalidate, invalidation by key and optimistic updates with rollback when the server says no.",
      "dificuldade": "avancado",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "Empty cache: a trip to the server",
        "Second read: instant response",
        "Stale-while-revalidate: show the old, fetch the new",
        "Invalidate by key after a mutation",
        "Optimistic update: the screen changes before the server",
        "The server refuses: rollback"
      ]
    },
    {
      "slug": "design-de-componentes",
      "modulo": "arquitetura",
      "titulo": "Deep components",
      "resumo": "Small interface, hidden complexity: what makes a component easy to use, and why prop drilling is a modeling symptom, not a lack of Context.",
      "dificuldade": "avancado",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "A shallow component: 15 props",
        "A deep component: little interface, a lot inside",
        "Separate fetching from displaying",
        "Prop drilling is a symptom",
        "Composition solves it before Context"
      ]
    },
    {
      "slug": "padroes-de-composicao",
      "modulo": "arquitetura",
      "titulo": "Composition patterns",
      "resumo": "Composition over inheritance, and when to use render props, hooks or compound components to share behavior.",
      "dificuldade": "avancado",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "Inheritance: the hierarchy that locks you in",
        "Composition: assembling parts",
        "Render props: the component asks what to draw",
        "Hooks: logic without a component",
        "Compound components: one API in several parts",
        "Which pattern to use"
      ]
    },
    {
      "slug": "bundlers",
      "modulo": "ferramentas",
      "titulo": "Bundlers and the move to ESM",
      "resumo": "What a bundler does, why webpack got slow on large projects and how Vite, esbuild and the Rust tools changed the game.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "What a bundler does",
        "webpack: bundle everything before serving",
        "Vite: the browser imports ESM directly",
        "Tools written in Go and Rust",
        "Why ESM is the foundation"
      ]
    },
    {
      "slug": "tree-shaking",
      "modulo": "ferramentas",
      "titulo": "Tree-shaking and bundle size",
      "resumo": "How the bundler removes code nobody imports, what stops that from working and how to find out what is heavy.",
      "dificuldade": "intermediario",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "Remove what nobody uses",
        "It only works with static ESM",
        "Side effects keep code around",
        "Why importing all of lodash is a code smell",
        "Measure before cutting"
      ]
    },
    {
      "slug": "micro-frontends",
      "modulo": "ferramentas",
      "titulo": "Micro-frontends and Module Federation",
      "resumo": "Split a large frontend into independently deployed parts: when it pays off, how Module Federation loads code from another deploy and what it costs.",
      "dificuldade": "avancado",
      "minutos": 9,
      "fidelidade": "modelo",
      "passos": [
        "One frontend, many teams",
        "Micro-frontends: slices with their own deploy",
        "Module Federation: import code from another deploy",
        "The duplicated dependencies problem",
        "When the cost pays off"
      ]
    },
    {
      "slug": "estrategia-de-testes",
      "modulo": "qualidade",
      "titulo": "Frontend testing strategy",
      "resumo": "Unit, integration and E2E: what each layer proves, what it costs, and why testing visible behavior separates useful tests from brittle ones.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "The pyramid: many fast, few slow",
        "Unit: pure logic",
        "Integration: components and hooks together",
        "E2E: the path of a real user",
        "Test what the user sees",
        "What makes a test brittle"
      ]
    },
    {
      "slug": "acessibilidade",
      "modulo": "qualidade",
      "titulo": "Accessibility and semantics",
      "resumo": "Semantic HTML as a free foundation, the accessibility tree, keyboard focus, contrast and aria-live for content that changes on its own.",
      "dificuldade": "intermediario",
      "minutos": 10,
      "fidelidade": "modelo",
      "passos": [
        "The browser builds one more tree",
        "Semantic HTML is accessibility for free",
        "ARIA: for what HTML does not cover",
        "Focus and keyboard",
        "Contrast and color",
        "aria-live: announce what changes on its own"
      ]
    }
  ]
};
