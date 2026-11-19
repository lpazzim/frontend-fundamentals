import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';

/**
 * Uma tela de pedidos e os tres donos do estado que ela le. No passo de server
 * state, o cache entra entre a tela e o servidor, e o servidor SE MOVE para dar
 * lugar a ele; no passo do Redux, um store generico ocupa o mesmo lugar.
 */
const tela: EntidadeFonte = { pos: [0, 0], rotulo: 'Tela', sub: 'pedidos', icone: 'tela', cor: 'amarelo' };
const url: EntidadeFonte = { pos: [-3.6, -2.8], rotulo: 'URL', sub: '?status=pago', icone: 'globo', cor: 'azul' };
const ui: EntidadeFonte = { pos: [-3.6, 2.8], rotulo: 'UI local', sub: 'useState', icone: 'cpu', cor: 'verde' };
const cache: EntidadeFonte = { pos: [3.6, 0], rotulo: 'Cache', sub: 'TanStack', icone: 'banco', cor: 'roxo' };
const redux: EntidadeFonte = { pos: [3.6, 0], rotulo: 'Redux', sub: 'store global', icone: 'caixa', cor: 'laranja' };
const servidor = (coluna: number): EntidadeFonte => ({ pos: [coluna, 0], rotulo: 'Servidor', sub: 'API', icone: 'servidor', cor: 'azul' });
const AO_LADO_DA_TELA = 3.6;
const ATRAS_DO_CACHE = 7.2;

const apagar = (e: EntidadeFonte): EntidadeFonte => ({ ...e, apagado: true });
const leUrl = { de: 'url', para: 'tela', rotulo: 'filtros' };
const leUi = { de: 'ui', para: 'tela', rotulo: 'modal aberto' };

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const tiposDeEstado: LicaoFonte = {
  slug: 'tipos-de-estado',
  modulo: 'arquitetura',
  titulo: 'Server, client e URL state',
  resumo:
    'Três tipos de estado com donos diferentes, e por que guardar dados do servidor num store genérico é reinventar um cache.',
  dificuldade: 'intermediario',
  minutos: 9,
  objetivos: [
    { texto: 'Distinguir client, server e URL state', passo: 1 },
    { texto: 'Por que server state envelhece e precisa de cache', passo: 3 },
    { texto: 'O que deve morar na URL', passo: 4 },
    { texto: 'Por que Redux puro para server state é redundante', passo: 5 },
    { texto: 'Um dono para cada estado', passo: 6 },
  ],
  passos: [
    {
      id: 'tres-donos',
      titulo: 'Nem todo estado é igual',
      narracao:
        'Um filtro de busca, um modal aberto e a lista de pedidos parecem "estado" do mesmo jeito, mas têm donos diferentes. Client state é da interface e só existe neste browser. Server state é uma cópia de algo que mora no servidor e pode mudar sem você saber. URL state é o que precisa sobreviver a um reload, a um link compartilhado e ao botão voltar.',
      cena: {
        foco: 'Donos do estado',
        entidades: { tela: { ...tela, destaque: true }, url, ui, servidor: servidor(AO_LADO_DA_TELA) },
        ligacoes: {
          leUrl,
          leUi,
          busca: { de: 'tela', para: 'servidor', rotulo: 'pedidos', setas: 'ambas' },
        },
        fluxos: [
          { rota: ['leUrl'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['leUi'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['busca'], taxa: 0.5, volta: true },
        ],
        metricas: [m('Client state', 'só aqui'), m('Server state', 'cópia remota'), m('URL state', 'compartilhável')],
      },
    },
    {
      id: 'client-state',
      titulo: 'Client state: síncrono e seu',
      narracao:
        'Modal aberto, aba ativa, texto ainda não enviado: o browser é o dono, a leitura é síncrona e o valor nunca fica velho. useState no componente resolve a maior parte; quando componentes distantes precisam do mesmo valor, Context ou uma store pequena como Zustand. Não há cache, revalidação nem estado de loading para gerenciar.',
      cena: {
        foco: 'Client state',
        entidades: {
          tela,
          url: apagar(url),
          ui: { ...ui, destaque: true, etiquetas: [{ texto: 'sempre atual', tom: 'bom' }] },
          servidor: apagar(servidor(AO_LADO_DA_TELA)),
        },
        ligacoes: { leUi },
        fluxos: [{ rota: ['leUi'], tipo: 'sinal', taxa: 1.4 }],
        metricas: [m('Leitura', 'síncrona', 'bom'), m('Fica velho?', 'nunca', 'bom'), m('Ferramenta', 'useState')],
      },
    },
    {
      id: 'server-state',
      titulo: 'Server state: uma cópia que envelhece',
      narracao:
        'A lista de pedidos não é sua: você tem uma fotografia dela. Esse estado é assíncrono, compartilhado com outros usuários e fica desatualizado sem aviso. Precisa de cache por chave, deduplicação de pedidos iguais, revalidação, retry e invalidação depois de mutações. É exatamente o que TanStack Query, SWR e RTK Query fazem, e o assunto da próxima lição.',
      cena: {
        foco: 'Server state',
        entidades: {
          tela,
          url: apagar(url),
          ui: apagar(ui),
          cache: { ...cache, destaque: true, etiquetas: [{ texto: 'por chave' }] },
          servidor: { ...servidor(ATRAS_DO_CACHE), etiquetas: [{ texto: 'muda sem avisar', tom: 'alerta' }] },
        },
        ligacoes: {
          consulta: { de: 'tela', para: 'cache', rotulo: 'useQuery', setas: 'ambas' },
          revalida: { de: 'cache', para: 'servidor', rotulo: 'revalida', setas: 'ambas', estilo: 'tracejada' },
        },
        fluxos: [
          { rota: ['consulta'], taxa: 1.1, volta: true },
          { rota: ['revalida'], tipo: 'lento', taxa: 0.45, volta: true },
        ],
        metricas: [m('Leitura', 'assíncrona', 'alerta'), m('Fica velho?', 'sim', 'alerta'), m('Precisa de', 'cache e retry')],
      },
    },
    {
      id: 'url-state',
      titulo: 'URL state: o que precisa sobreviver ao link',
      narracao:
        'Filtros, ordenação, página atual e a aba de um painel moram melhor na URL (?status=pago&pagina=2). De graça vêm o deep link, o botão voltar e o compartilhamento. Este projeto faz isso com o passo de cada lição: ele está na rota, não num useState, e por isso o voltar do browser e o link direto funcionam sem nenhum código de sincronização.',
      cena: {
        foco: 'URL state',
        entidades: {
          tela,
          url: { ...url, destaque: true, etiquetas: [{ texto: 'compartilhável', tom: 'bom' }] },
          ui: apagar(ui),
          cache: apagar(cache),
          servidor: apagar(servidor(ATRAS_DO_CACHE)),
        },
        ligacoes: { leUrl },
        fluxos: [{ rota: ['leUrl'], tipo: 'sinal', taxa: 1.4 }],
        metricas: [m('Sobrevive a', 'reload e link', 'bom'), m('Botão voltar', 'funciona', 'bom'), m('Ferramenta', 'search params')],
        nota: '/licao/$slug/$passo: o passo mora na URL',
      },
    },
    {
      id: 'redux-redundante',
      titulo: 'Server state num store genérico é cache feito à mão',
      narracao:
        'Guardar a resposta da API num Redux puro obriga a escrever, para cada endpoint, actions de loading, sucesso e erro, decidir quando refazer o pedido, deduplicar chamadas e invalidar depois de mutações: um cache reinventado, e com bugs. Foi por isso que o próprio time do Redux criou o RTK Query. O que sobra para um store global costuma ser pouco client state de verdade.',
      cena: {
        foco: 'Store genérico',
        entidades: {
          tela,
          url: apagar(url),
          ui: apagar(ui),
          redux: {
            ...redux,
            destaque: true,
            etiquetas: [
              { texto: 'loading à mão', tom: 'ruim' },
              { texto: 'invalidação à mão', tom: 'ruim' },
            ],
          },
          servidor: servidor(ATRAS_DO_CACHE),
        },
        ligacoes: {
          despacha: { de: 'tela', para: 'redux', rotulo: 'dispatch', setas: 'ambas' },
          busca: { de: 'redux', para: 'servidor', rotulo: 'thunk', setas: 'ambas' },
        },
        fluxos: [
          { rota: ['despacha', 'busca'], tipo: 'pesado', taxa: 0.6, volta: true },
          { rota: ['despacha'], tipo: 'sinal', taxa: 1.2 },
        ],
        metricas: [m('Código de cache', 'manual', 'ruim'), m('Risco', 'dado velho', 'ruim'), m('Alternativa', 'RTK Query', 'bom')],
      },
    },
    {
      id: 'um-dono',
      titulo: 'Um dono para cada estado',
      narracao:
        'A regra prática: dado que veio do servidor vai para uma biblioteca de server state; o que precisa de link vai para a URL; o resto fica o mais perto possível de quem usa, e só sobe para Context ou store quando componentes distantes precisam dele. Duplicar o mesmo dado em dois lugares, como copiar a resposta da API para um useState, é a origem da maioria dos bugs de estado dessincronizado.',
      cena: {
        foco: 'Mapa do estado',
        entidades: {
          tela: { ...tela, destaque: true },
          url: { ...url, sub: 'filtros', etiquetas: [{ texto: 'URL state' }] },
          ui: { ...ui, sub: 'modal', etiquetas: [{ texto: 'client state' }] },
          cache: { ...cache, etiquetas: [{ texto: 'server state' }] },
          servidor: servidor(ATRAS_DO_CACHE),
        },
        ligacoes: {
          leUrl,
          leUi,
          consulta: { de: 'tela', para: 'cache', rotulo: 'useQuery', setas: 'ambas' },
          revalida: { de: 'cache', para: 'servidor', rotulo: 'revalida', setas: 'ambas', estilo: 'tracejada' },
        },
        fluxos: [
          { rota: ['leUrl'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['leUi'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['consulta'], taxa: 0.9, volta: true },
        ],
        metricas: [m('Do servidor', 'Query/SWR', 'bom'), m('Do link', 'URL', 'bom'), m('Da interface', 'useState', 'bom')],
      },
    },
  ],
  fontes: [
    { titulo: 'Does TanStack Query replace Redux, MobX or other global state managers?', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state', origem: 'TanStack Query', tipo: 'documentacao', idioma: 'en', nota: 'A separação entre server state e client state, nas palavras de quem faz a biblioteca.' },
    { titulo: 'Redux Essentials: RTK Query basics', url: 'https://redux.js.org/tutorials/essentials/part-7-rtk-query-basics', origem: 'Redux', tipo: 'guia', idioma: 'en', nota: 'Por que o time do Redux recomenda não escrever cache de dados à mão.' },
    { titulo: 'Application State Management with React', url: 'https://kentcdodds.com/blog/application-state-management-with-react', origem: 'Kent C. Dodds', tipo: 'artigo', idioma: 'en', nota: 'Colocar o estado perto de quem usa e quando subir para Context.' },
    { titulo: 'Choosing the State Structure', url: 'https://react.dev/learn/choosing-the-state-structure', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Evitar estado duplicado, redundante ou derivável.' },
    { titulo: 'Search params', url: 'https://tanstack.com/router/latest/docs/guide/search-params', origem: 'TanStack Router', tipo: 'documentacao', idioma: 'en', nota: 'Search params tipados e validados como estado da aplicação.' },
    { titulo: 'Practical React Query', url: 'https://tkdodo.eu/blog/practical-react-query', origem: 'TkDodo (mantenedor do TanStack Query)', tipo: 'artigo', idioma: 'en', nota: 'Série de artigos sobre usar o TanStack Query no dia a dia.' },
  ],
};
