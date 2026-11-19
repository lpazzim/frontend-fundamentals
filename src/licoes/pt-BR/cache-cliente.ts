import type { EntidadeFonte, LicaoFonte, LigacaoFonte } from '../../schema/licao';
import { g } from '../autoria';


const tela: EntidadeFonte = { pos: g(0, 0), rotulo: 'Tela', icone: 'tela', cor: 'amarelo' };
const cache: EntidadeFonte = { pos: g(3.6, 0), rotulo: 'Cache', sub: 'por chave', icone: 'banco', cor: 'roxo' };
const servidor: EntidadeFonte = { pos: g(7.2, 0), rotulo: 'Servidor', icone: 'servidor', cor: 'azul' };

const pede: LigacaoFonte = { de: 'tela', para: 'cache', setas: 'ambas' };
const busca = (estilo: LigacaoFonte['estilo'] = 'solida', rotulo?: string): LigacaoFonte => ({
  de: 'cache',
  para: 'servidor',
  setas: 'ambas',
  estilo,
  rotulo,
});

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
function metricas(tempo: [string, Nivel], dado: string) {
  return [
    { rotulo: 'Até a tela', valor: tempo[0], nivel: tempo[1] },
    { rotulo: 'Na tela', valor: dado },
  ];
}

export const cacheCliente: LicaoFonte = {
  slug: 'cache-cliente',
  modulo: 'arquitetura',
  titulo: 'Cache no cliente',
  resumo:
    'Stale-while-revalidate, invalidação por chave e update otimista com rollback quando o servidor recusa.',
  dificuldade: 'avancado',
  minutos: 10,
  objetivos: [
    { texto: 'Cache miss e cache hit', passo: 2 },
    { texto: 'Stale-while-revalidate na prática', passo: 3 },
    { texto: 'Invalidar por chave depois de uma mutação', passo: 4 },
    { texto: 'Update otimista e rollback', passo: 6 },
  ],
  passos: [
    {
      id: 'miss',
      titulo: 'Cache vazio: ida ao servidor',
      narracao:
        'A primeira leitura de uma chave não encontra nada no cache. O cliente pede ao servidor, espera, guarda a resposta sob uma chave (por exemplo ["post", 7]) e entrega à tela. A chave é a identidade do dado: tudo o mais depende dela.',
      cena: {
        foco: 'Servidor',
        entidades: { tela, cache: { ...cache, etiquetas: [{ texto: 'miss', tom: 'alerta' }] }, servidor: { ...servidor, destaque: true } },
        ligacoes: { pede, busca: busca() },
        fluxos: [{ rota: ['pede', 'busca'], taxa: 0.6, volta: true }],
        metricas: metricas(['320 ms', 'alerta'], 'post 7 · v1'),
        nota: 'cache miss',
      },
    },
    {
      id: 'hit',
      titulo: 'Segunda leitura: resposta instantânea',
      narracao:
        'Agora a chave existe no cache e a tela é servida na hora, sem rede: o pacote nem chega ao servidor. O custo é o risco de mostrar um dado que já mudou lá. A pergunta passa a ser por quanto tempo confiar nele.',
      cena: {
        foco: 'Cache',
        entidades: { tela, cache: { ...cache, destaque: true, etiquetas: [{ texto: 'hit', tom: 'bom' }] }, servidor: { ...servidor, apagado: true } },
        ligacoes: { pede, busca: busca('desligada') },
        fluxos: [{ rota: ['pede'], taxa: 1.3, volta: true }],
        metricas: metricas(['4 ms', 'bom'], 'post 7 · v1'),
        nota: 'cache hit',
      },
    },
    {
      id: 'swr',
      titulo: 'Stale-while-revalidate: mostra o velho, busca o novo',
      narracao:
        'Com o dado vencido (stale), a tela é servida do cache imediatamente e, em paralelo, uma revalidação busca a versão atual. Quando ela chega, cache e tela são atualizados. O leitor nunca espera uma tela vazia, e o dado converge para o correto.',
      cena: {
        foco: 'Revalidação',
        entidades: {
          tela: { ...tela, etiquetas: [{ texto: 'mostra v1 já' }] },
          cache: { ...cache, etiquetas: [{ texto: 'stale', tom: 'alerta' }] },
          servidor: { ...servidor, destaque: true },
        },
        ligacoes: { pede, busca: busca('tracejada', 'revalida') },
        fluxos: [
          { rota: ['pede'], taxa: 1.1, volta: true },
          { rota: ['busca'], tipo: 'lento', taxa: 0.5, volta: true },
        ],
        metricas: metricas(['4 ms', 'bom'], 'v1 → v2'),
      },
    },
    {
      id: 'invalidacao',
      titulo: 'Invalidar por chave depois de uma mutação',
      narracao:
        'Quando o leitor edita o post 7, qualquer cópia dele no cache passa a ser suspeita. Invalidar a chave ["post", 7] a marca como vencida e dispara nova busca; as demais chaves ficam intactas. Invalidar demais refaz requisições à toa, invalidar de menos deixa dado velho na tela.',
      cena: {
        foco: 'Cache',
        entidades: {
          tela,
          cache: { ...cache, destaque: true, etiquetas: [{ texto: '["post",7] inválida', tom: 'ruim' }] },
          servidor,
        },
        ligacoes: { pede, busca: busca('solida', 'refetch') },
        fluxos: [{ rota: ['busca'], taxa: 0.8, volta: true }],
        metricas: [...metricas(['4 ms', 'bom'], 'post 7 · v2'), { rotulo: 'Outras chaves', valor: 'intactas', nivel: 'bom' }],
      },
    },
    {
      id: 'otimista',
      titulo: 'Update otimista: a tela muda antes do servidor',
      narracao:
        'Para parecer instantâneo, o cliente grava a mudança no cache e na tela já, e só então envia ao servidor, guardando a versão anterior. O pacote fica retido no servidor enquanto ele decide; se tudo der certo, ninguém percebeu a espera.',
      cena: {
        foco: 'Tela',
        entidades: {
          tela: { ...tela, destaque: true, etiquetas: [{ texto: 'título novo', tom: 'bom' }] },
          cache: { ...cache, etiquetas: [{ texto: 'anterior guardado' }] },
          servidor,
        },
        ligacoes: { pede, busca: busca('solida', 'PATCH') },
        fluxos: [{ rota: ['pede', 'busca'], taxa: 0.45, volta: true, segura: 1 }],
        metricas: metricas(['0 ms', 'bom'], 'título novo'),
      },
    },
    {
      id: 'rollback',
      titulo: 'O servidor recusa: rollback',
      narracao:
        'A requisição falha (o X vermelho). O cliente restaura a versão guardada no cache e na tela, e avisa o leitor. É por isso que o update otimista exige guardar o estado anterior: sem ele, não há como desfazer uma promessa que não foi cumprida.',
      cena: {
        foco: 'Servidor',
        entidades: {
          tela: { ...tela, etiquetas: [{ texto: 'título antigo', tom: 'alerta' }] },
          cache: { ...cache, etiquetas: [{ texto: 'restaurado' }] },
          servidor: { ...servidor, destaque: true, etiquetas: [{ texto: 'erro 500', tom: 'ruim' }] },
        },
        ligacoes: { pede, busca: busca('erro', 'PATCH') },
        fluxos: [{ rota: ['pede', 'busca'], taxa: 0.6, falha: 1 }],
        metricas: metricas(['0 ms', 'bom'], 'rollback'),
        nota: 'rollback',
      },
    },
  ],
  fontes: [
    { titulo: 'Important Defaults', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults', origem: 'TanStack Query', tipo: 'documentacao', idioma: 'en', nota: 'staleTime, gcTime e quando a biblioteca refaz pedidos sozinha.' },
    { titulo: 'Optimistic Updates', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates', origem: 'TanStack Query', tipo: 'documentacao', idioma: 'en', nota: 'onMutate, rollback e invalidação, passo a passo.' },
    { titulo: 'Effective React Query Keys', url: 'https://tkdodo.eu/blog/effective-react-query-keys', origem: 'TkDodo (mantenedor do TanStack Query)', tipo: 'artigo', idioma: 'en', nota: 'Como organizar chaves para invalidar com precisão.' },
    { titulo: 'RFC 5861: HTTP Cache-Control Extensions for Stale Content', url: 'https://www.rfc-editor.org/rfc/rfc5861.html', origem: 'IETF', tipo: 'especificacao', idioma: 'en', nota: 'A origem do stale-while-revalidate, no cache HTTP.' },
    { titulo: 'SWR: getting started', url: 'https://swr.vercel.app/docs/getting-started', origem: 'Vercel', tipo: 'documentacao', idioma: 'en', nota: 'A mesma estratégia em outra biblioteca, com nome tirado da RFC.' },
  ],
};
