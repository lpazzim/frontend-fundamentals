import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Componentes como modulos (Ousterhout): profundidade = o quanto a interface e
 * pequena perto do que o componente faz. No ultimo passo o Avatar SE MOVE para
 * perto do App: com composicao, quem tem o dado renderiza quem precisa dele.
 */
const telaA: EntidadeFonte = { pos: [-4.6, -2.4], rotulo: 'Tela A', sub: 'pedidos', icone: 'tela', cor: 'amarelo' };
const telaB: EntidadeFonte = { pos: [-4.6, 2.4], rotulo: 'Tela B', sub: 'clientes', icone: 'tela', cor: 'amarelo' };
const rasa: EntidadeFonte = { pos: [2.2, 0], rotulo: 'DataTable', sub: '15 props', icone: 'caixa', cor: 'laranja' };

const profunda: EntidadeFonte = { tipo: 'placa', pos: [2.6, 0.4], rotulo: 'DataTable', sub: 'profundo', icone: 'caixa', cor: 'verde', tamanho: [6, 2.4] };
const POSICAO = [-1.9, 0, 1.9] as const;
const pecaInterna = (i: 0 | 1 | 2, rotulo: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(profunda.pos, POSICAO[i], 0),
  rotulo,
  sub: 'interno',
  cor: 'neutro',
  tamanho: [1.6, 1.6],
});

const api: EntidadeFonte = { pos: [-6, 0], rotulo: 'API', sub: 'JSON cru', icone: 'servidor', cor: 'azul' };
const hook: EntidadeFonte = { pos: [-1.6, 0], rotulo: 'usePedidos', sub: 'busca dados', icone: 'raio', cor: 'roxo' };
const exibe: EntidadeFonte = { pos: [2.8, 0], rotulo: 'DataTable', sub: 'só exibe', icone: 'caixa', cor: 'verde' };

const no = (pos: EntidadeFonte['pos'], rotulo: string, sub: string, cor: EntidadeFonte['cor'] = 'neutro'): EntidadeFonte => ({
  pos,
  rotulo,
  sub,
  icone: 'caixa',
  cor,
});
const app = no([-5.4, -2.4], 'App', 'tem o user', 'azul');
const layout = no([-1.8, -0.8], 'Layout', 'só repassa');
const sidebar = no([1.8, 0.8], 'Sidebar', 'só repassa');
const avatar = (pos: EntidadeFonte['pos']) => no(pos, 'Avatar', 'usa o user', 'amarelo');

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const designDeComponentes: LicaoFonte = {
  slug: 'design-de-componentes',
  modulo: 'arquitetura',
  titulo: 'Componentes profundos',
  resumo:
    'Interface pequena, complexidade escondida: o que torna um componente fácil de usar, e por que prop drilling é sintoma de modelagem, não falta de Context.',
  dificuldade: 'avancado',
  minutos: 9,
  objetivos: [
    { texto: 'Reconhecer um componente raso', passo: 1 },
    { texto: 'O que é um módulo profundo', passo: 2 },
    { texto: 'Separar quem busca dados de quem exibe', passo: 3 },
    { texto: 'Ler prop drilling como sintoma', passo: 4 },
    { texto: 'Resolver com composição antes de Context', passo: 5 },
  ],
  passos: [
    {
      id: 'raso',
      titulo: 'Um componente raso: 15 props',
      narracao:
        'Imagine um <DataTable> com 15 props: sortColumn, sortDirection, onSortChange, page, pageSize, onPageChange, isLoading, emptyText… Cada tela que o usa precisa entender e coordenar tudo isso, e as duas telas acabam com o mesmo código de ordenação e paginação. A interface é quase do tamanho da implementação: o componente esconde pouco e empurra o trabalho para quem o usa.',
      cena: {
        foco: 'Componente raso',
        entidades: {
          telaA,
          telaB,
          tabela: { ...rasa, destaque: true, etiquetas: [{ texto: 'esconde pouco', tom: 'ruim' }] },
        },
        ligacoes: {
          usaA: { de: 'telaA', para: 'tabela', rotulo: '15 props' },
          usaB: { de: 'telaB', para: 'tabela', rotulo: '15 props' },
        },
        fluxos: [
          { rota: ['usaA'], tipo: 'pesado', taxa: 1.2 },
          { rota: ['usaB'], tipo: 'pesado', taxa: 1.2 },
        ],
        metricas: [m('Props', '15', 'ruim'), m('Quem coordena', 'cada tela', 'ruim'), m('Lógica repetida', 'nas 2 telas', 'ruim')],
      },
    },
    {
      id: 'profundo',
      titulo: 'Um componente profundo: pouca interface, muito dentro',
      narracao:
        'John Ousterhout chama de módulo profundo aquele cuja interface é pequena perto do que ele faz. <DataTable dados={pedidos} colunas={colunas} /> pode cuidar de ordenação, paginação e estado de loading por dentro, com padrões sensatos e uma saída para o caso raro. O consumidor passa o que só ele sabe (que dados, que colunas); o componente decide o resto.',
      cena: {
        foco: 'Componente profundo',
        entidades: {
          telaA,
          telaB,
          tabela: { ...profunda, destaque: true },
          ordena: pecaInterna(0, 'ordena'),
          pagina: pecaInterna(1, 'pagina'),
          carrega: pecaInterna(2, 'loading'),
        },
        ligacoes: {
          usaA: { de: 'telaA', para: 'tabela', rotulo: '2 props' },
          usaB: { de: 'telaB', para: 'tabela', rotulo: '2 props' },
        },
        fluxos: [
          { rota: ['usaA'], taxa: 0.9 },
          { rota: ['usaB'], taxa: 0.9 },
        ],
        metricas: [m('Props', '2', 'bom'), m('Quem coordena', 'o componente', 'bom'), m('Lógica repetida', 'nenhuma', 'bom')],
        nota: 'interface pequena, implementação grande',
      },
    },
    {
      id: 'acoplamento',
      titulo: 'Separar quem busca de quem exibe',
      narracao:
        'Um componente de UI que importa o cliente HTTP e conhece a forma exata da resposta da API fica preso àquela tela e àquele endpoint. Separe as responsabilidades: um hook (ou o loader da rota) busca e traduz os dados, e o componente recebe valores já no formato da interface. Assim ele pode ser testado com dados de exemplo, reaproveitado e mantido sem tocar na API.',
      cena: {
        foco: 'Acoplamento',
        entidades: {
          api,
          hook: { ...hook, destaque: true },
          tabela: { ...exibe, etiquetas: [{ texto: 'testável sozinho', tom: 'bom' }] },
        },
        ligacoes: {
          busca: { de: 'hook', para: 'api', rotulo: 'fetch', setas: 'ambas' },
          entrega: { de: 'hook', para: 'tabela', rotulo: 'linhas prontas' },
        },
        fluxos: [
          { rota: ['busca'], taxa: 0.6, volta: true },
          { rota: ['entrega'], tipo: 'sinal', taxa: 1 },
        ],
        metricas: [m('UI conhece a API?', 'não', 'bom'), m('Trocar o endpoint', 'só no hook', 'bom')],
      },
    },
    {
      id: 'prop-drilling',
      titulo: 'Prop drilling é um sintoma',
      narracao:
        'Aqui o user atravessa Layout e Sidebar, que não o usam, só para chegar ao Avatar. A reação comum é criar um Context. Muitas vezes, porém, o problema é de modelagem: os componentes do meio existem só para repassar, e qualquer mudança na prop toca todos eles. Antes de esconder o caminho num Context, vale perguntar por que o dado precisa fazer esse caminho.',
      cena: {
        foco: 'Prop drilling',
        entidades: {
          app,
          layout: { ...layout, apagado: true },
          sidebar: { ...sidebar, apagado: true },
          avatar: { ...avatar([5.4, 2.4]), destaque: true },
        },
        ligacoes: {
          a: { de: 'app', para: 'layout', rotulo: 'user' },
          b: { de: 'layout', para: 'sidebar', rotulo: 'user' },
          c: { de: 'sidebar', para: 'avatar', rotulo: 'user' },
        },
        fluxos: [{ rota: ['a', 'b', 'c'], taxa: 0.7 }],
        metricas: [m('No caminho', '2 que não usam', 'ruim'), m('Mudar a prop', 'toca 4 arquivos', 'alerta')],
      },
    },
    {
      id: 'composicao',
      titulo: 'Composição resolve antes do Context',
      narracao:
        'Com children, o App monta <Layout><Sidebar><Avatar user={user} /></Sidebar></Layout>: Layout e Sidebar desenham a estrutura sem conhecer o user, e o dado vai direto de quem tem para quem usa. É a sugestão da própria documentação do React antes de usar Context. Context continua certo para o que é global e muda pouco, como tema, idioma e usuário logado.',
      cena: {
        foco: 'Composição',
        entidades: {
          app: { ...app, destaque: true },
          layout: { ...layout, sub: 'só children' },
          sidebar: { ...sidebar, sub: 'só children' },
          avatar: { ...avatar([1.8, -4]), destaque: true },
        },
        ligacoes: {
          a: { de: 'app', para: 'layout', rotulo: 'children', estilo: 'tracejada' },
          b: { de: 'layout', para: 'sidebar', rotulo: 'children', estilo: 'tracejada' },
          direto: { de: 'app', para: 'avatar', rotulo: 'user' },
        },
        fluxos: [{ rota: ['direto'], tipo: 'sinal', taxa: 1 }],
        metricas: [m('No caminho', 'ninguém', 'bom'), m('Layout conhece o user?', 'não', 'bom')],
        nota: 'quem tem o dado renderiza quem precisa dele',
      },
    },
  ],
  fontes: [
    { titulo: 'A Philosophy of Software Design (Talks at Google)', url: 'https://www.youtube.com/watch?v=bmSAYlu0NcY', origem: 'John Ousterhout', tipo: 'palestra', idioma: 'en', nota: 'Módulos profundos e rasos, contados pelo autor do conceito.' },
    { titulo: 'Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'A seção "Before you use context": props e children primeiro.' },
    { titulo: 'Passing Props to a Component', url: 'https://react.dev/learn/passing-props-to-a-component', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Passar JSX como children para compor componentes.' },
    { titulo: 'Prop Drilling', url: 'https://kentcdodds.com/blog/prop-drilling', origem: 'Kent C. Dodds', tipo: 'artigo', idioma: 'en', nota: 'Quando prop drilling é aceitável e quando indica um problema.' },
    { titulo: 'Thinking in React', url: 'https://react.dev/learn/thinking-in-react', origem: 'react.dev', tipo: 'guia', idioma: 'en', nota: 'Dividir a interface em componentes e decidir onde o estado mora.' },
    { titulo: 'Container/Presentational Pattern', url: 'https://www.patterns.dev/react/presentational-container-pattern', origem: 'patterns.dev', tipo: 'guia', idioma: 'en', nota: 'Separar busca de exibição, e como hooks mudaram esse padrão.' },
  ],
};
