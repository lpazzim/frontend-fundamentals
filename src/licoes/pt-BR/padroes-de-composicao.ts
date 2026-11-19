import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Quatro formas de reaproveitar codigo entre componentes. O Cursor atravessa
 * a licao: aparece com render prop e SE MOVE para o lado de um hook no passo
 * seguinte, porque e o mesmo componente com outra forma de receber a logica.
 */
const bloco = (pos: EntidadeFonte['pos'], rotulo: string, sub: string, cor: EntidadeFonte['cor'], icone: EntidadeFonte['icone'] = 'caixa'): EntidadeFonte => ({
  pos,
  rotulo,
  sub,
  icone,
  cor,
});

const base = bloco([-4.2, -2.4], 'BotaoBase', 'classe base', 'neutro');
const primario = bloco([0, 0], 'Primario', 'extends Base', 'laranja');
const comIcone = bloco([4.2, 2.4], 'ComIcone', 'extends', 'laranja');

const botao = bloco([2.6, 0], 'Botao', 'componente', 'verde');
const entrada = (linha: number, rotulo: string, sub: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: [-3.2, linha],
  rotulo,
  sub,
  cor: 'neutro',
  tamanho: [1.8, 1.8],
});

const mouse = bloco([-4.2, 0], 'Mouse', 'rastreia', 'azul', 'cpu');
const render = bloco([0, 0], 'render(pos)', 'função', 'roxo', 'raio');
const cursor = (pos: EntidadeFonte['pos']) => bloco(pos, 'Cursor', 'desenha', 'amarelo', 'tela');
const mira = bloco([2.8, 2.4], 'Mira', 'desenha', 'amarelo', 'tela');
const useMouse = (linha: number): EntidadeFonte => bloco([-2.6, linha], 'useMouse', 'hook', 'roxo', 'raio');

const tabs: EntidadeFonte = { tipo: 'placa', pos: [1.2, 0.6], rotulo: 'Tabs', sub: 'Context interno', icone: 'camadas', cor: 'verde', tamanho: [6, 2.4] };
const POSICAO = [-1.9, 0, 1.9] as const;
const parte = (i: 0 | 1 | 2, rotulo: string, sub: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(tabs.pos, POSICAO[i], 0),
  rotulo,
  sub,
  cor: 'neutro',
  tamanho: [1.6, 1.6],
});
const consumidor = bloco([-5.4, -1.6], 'Tela', 'monta peças', 'amarelo', 'tela');

const opcao = (coluna: number, rotulo: string, sub: string, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  pos: [coluna, 0],
  rotulo,
  sub,
  cor,
});

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const padroesDeComposicao: LicaoFonte = {
  slug: 'padroes-de-composicao',
  modulo: 'arquitetura',
  titulo: 'Padrões de composição',
  resumo:
    'Composição em vez de herança, e quando usar render props, hooks ou compound components para compartilhar comportamento.',
  dificuldade: 'avancado',
  minutos: 10,
  objetivos: [
    { texto: 'Por que o React prefere composição a herança', passo: 2 },
    { texto: 'Render props: delegar o que desenhar', passo: 3 },
    { texto: 'Custom hooks: lógica sem componente', passo: 4 },
    { texto: 'Compound components: uma API em várias peças', passo: 5 },
    { texto: 'Escolher o padrão pelo problema', passo: 6 },
  ],
  passos: [
    {
      id: 'heranca',
      titulo: 'Herança: a hierarquia que engessa',
      narracao:
        'Em orientação a objetos é comum criar BotaoBase, Primario extends BotaoBase, ComIcone extends Primario… Cada variação nova obriga a escolher um lugar numa árvore rígida, e o filho herda tudo do pai, inclusive o que não queria. A documentação do React conta que, em milhares de componentes no Facebook, não apareceu nenhum caso em que hierarquias de herança fossem a recomendação.',
      cena: {
        foco: 'Herança',
        entidades: {
          base,
          primario,
          comIcone: { ...comIcone, destaque: true, etiquetas: [{ texto: 'herda tudo', tom: 'ruim' }] },
        },
        ligacoes: {
          h1: { de: 'base', para: 'primario', rotulo: 'herda' },
          h2: { de: 'primario', para: 'comIcone', rotulo: 'herda' },
        },
        fluxos: [{ rota: ['h1', 'h2'], tipo: 'pesado', taxa: 0.8 }],
        metricas: [m('Variações', '3 classes'), m('Nova variação', 'novo nível', 'ruim')],
      },
    },
    {
      id: 'composicao',
      titulo: 'Composição: montar peças',
      narracao:
        'Composição combina peças independentes: <Botao variante="primario" icone={<Seta />}>Salvar</Botao>. Props e children cobrem quase todo reaproveitamento de aparência, sem hierarquia nenhuma. A pergunta mais difícil é como compartilhar COMPORTAMENTO (estado, eventos, efeitos) entre componentes diferentes, e é aí que entram os três padrões a seguir.',
      cena: {
        foco: 'Composição',
        entidades: {
          variante: entrada(-2.6, 'variante', '"primario"'),
          icone: entrada(0, 'icone', '<Seta />'),
          filhos: entrada(2.6, 'children', '"Salvar"'),
          botao: { ...botao, destaque: true },
        },
        ligacoes: {
          e1: { de: 'variante', para: 'botao' },
          e2: { de: 'icone', para: 'botao' },
          e3: { de: 'filhos', para: 'botao' },
        },
        fluxos: [
          { rota: ['e1'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['e2'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['e3'], tipo: 'sinal', taxa: 0.8 },
        ],
        metricas: [m('Herança', 'nenhuma', 'bom'), m('Nova variação', 'nova prop', 'bom')],
      },
    },
    {
      id: 'render-props',
      titulo: 'Render props: o componente pergunta o que desenhar',
      narracao:
        'Um componente com render prop cuida do comportamento e delega a renderização a uma função: <Mouse render={(pos) => <Cursor {...pos} />} />. Foi o padrão dominante antes dos hooks. O custo é o aninhamento quando vários se combinam e uma função nova a cada render. Ainda é útil quando o componente precisa decidir ONDE e QUANDO algo aparece, como numa lista virtualizada.',
      cena: {
        foco: 'Render props',
        entidades: {
          mouse: { ...mouse, destaque: true, etiquetas: [{ texto: 'comportamento' }] },
          render,
          cursor: { ...cursor([4.2, 0]), etiquetas: [{ texto: 'aparência' }] },
        },
        ligacoes: {
          chama: { de: 'mouse', para: 'render', rotulo: 'pos' },
          desenha: { de: 'render', para: 'cursor', rotulo: 'JSX' },
        },
        fluxos: [{ rota: ['chama', 'desenha'], taxa: 0.9 }],
        metricas: [m('Aninhamento', 'cresce', 'alerta'), m('Controla', 'onde renderizar', 'bom')],
      },
    },
    {
      id: 'hooks',
      titulo: 'Hooks: lógica sem componente',
      narracao:
        'Um custom hook extrai a lógica com estado para uma função: const pos = useMouse(). O componente decide sozinho o que desenhar, sem aninhamento, e vários hooks se combinam em sequência. Atenção: hooks compartilham a lógica, não o estado. Cada componente que chama useMouse tem a própria cópia. É a forma padrão de reaproveitar comportamento no React de hoje.',
      cena: {
        foco: 'Custom hooks',
        entidades: {
          h1: { ...useMouse(-2.4), destaque: true },
          h2: { ...useMouse(2.4), etiquetas: [{ texto: 'outra cópia' }] },
          cursor: cursor([2.8, -2.4]),
          mira,
        },
        ligacoes: {
          c1: { de: 'h1', para: 'cursor', rotulo: 'pos' },
          c2: { de: 'h2', para: 'mira', rotulo: 'pos' },
        },
        fluxos: [
          { rota: ['c1'], tipo: 'sinal', taxa: 1.2 },
          { rota: ['c2'], tipo: 'sinal', taxa: 1.2 },
        ],
        metricas: [m('Aninhamento', 'nenhum', 'bom'), m('Estado', 'um por chamada')],
        nota: 'const pos = useMouse()',
      },
    },
    {
      id: 'compound',
      titulo: 'Compound components: uma API em várias peças',
      narracao:
        'Quando várias partes trabalham juntas, como Tabs, Select ou Accordion, compound components expõem as partes e escondem o estado compartilhado num Context interno: <Tabs><Tabs.Lista><Tabs.Aba /></Tabs.Lista><Tabs.Painel /></Tabs>. O consumidor controla a ordem e a marcação; o pai controla qual aba está ativa. Bibliotecas como Radix UI são construídas assim.',
      cena: {
        foco: 'Compound components',
        entidades: {
          consumidor,
          tabs: { ...tabs, destaque: true },
          lista: parte(0, 'Lista', '.Lista'),
          aba: parte(1, 'Aba', '.Aba'),
          painel: parte(2, 'Painel', '.Painel'),
        },
        ligacoes: { monta: { de: 'consumidor', para: 'tabs', rotulo: 'JSX' } },
        fluxos: [{ rota: ['monta'], taxa: 0.9 }],
        metricas: [m('Estado', 'no pai', 'bom'), m('Ordem e marcação', 'do consumidor', 'bom')],
        nota: 'as peças leem o estado pelo Context do Tabs',
      },
    },
    {
      id: 'escolher',
      titulo: 'Qual padrão usar',
      narracao:
        'Reaproveitar aparência: props e children. Reaproveitar lógica com estado: custom hook. Um conjunto de peças que dividem estado e que o consumidor monta: compound components. Um componente que precisa decidir quando renderizar algo que outro define: render prop. Na dúvida, comece pelo mais simples, com o mesmo objetivo da lição anterior: interface pequena, complexidade escondida.',
      cena: {
        foco: 'Escolha',
        entidades: {
          props: opcao(0, 'props', 'aparência', 'verde'),
          hook: opcao(3.4, 'hook', 'lógica', 'roxo'),
          compound: opcao(6.8, 'compound', 'peças juntas', 'azul'),
          renderProp: opcao(10.2, 'render prop', 'onde e quando', 'laranja'),
        },
        metricas: [],
      },
    },
  ],
  fontes: [
    { titulo: 'Composition vs Inheritance', url: 'https://legacy.reactjs.org/docs/composition-vs-inheritance.html', origem: 'React (documentação antiga)', tipo: 'documentacao', idioma: 'en', nota: 'O texto clássico sobre children e por que evitar herança entre componentes.' },
    { titulo: 'Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Extrair lógica com estado e por que cada chamada tem o próprio estado.' },
    { titulo: 'Compound Pattern', url: 'https://www.patterns.dev/react/compound-pattern', origem: 'patterns.dev', tipo: 'guia', idioma: 'en', nota: 'Compound components com Context, passo a passo.' },
    { titulo: 'Render Props Pattern', url: 'https://www.patterns.dev/react/render-props-pattern', origem: 'patterns.dev', tipo: 'guia', idioma: 'en', nota: 'Vantagens, problemas e o que os hooks substituíram.' },
    { titulo: 'Hooks Pattern', url: 'https://www.patterns.dev/react/hooks-pattern', origem: 'patterns.dev', tipo: 'guia', idioma: 'en', nota: 'Comparação direta com classes, HOCs e render props.' },
    { titulo: 'React Hooks: Compound Components', url: 'https://kentcdodds.com/blog/compound-components-with-react-hooks', origem: 'Kent C. Dodds', tipo: 'artigo', idioma: 'en', nota: 'Implementação de um Toggle composto com hooks e Context.' },
    { titulo: 'Composition', url: 'https://www.radix-ui.com/primitives/docs/guides/composition', origem: 'Radix UI', tipo: 'documentacao', idioma: 'en', nota: 'Como uma biblioteca de componentes real expõe peças e asChild.' },
  ],
};
