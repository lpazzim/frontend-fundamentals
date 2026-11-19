import type { EntidadeFonte, LicaoFonte, LigacaoFonte } from '../../schema/licao';

/**
 * Modelo simplificado: estado no componente App, sem memo. Em React real,
 * memo, estado mais baixo na arvore e o React Compiler reduzem os rerenders.
 *
 * Duas arvores espelhadas, em [coluna, linha] direto: a esquerda o virtual
 * DOM, a direita a reatividade fina. Os Contadores ficam do lado de dentro,
 * perto do DOM real no centro, para as ligacoes ate ele nao cruzarem nada.
 * "Itens x2" e uma peca so: dois itens iguais nao ensinam nada a mais.
 */
type Lado = 'v' | 'f';
const LADO: Record<Lado, number> = { v: -1, f: 1 };
const TAMANHO: [number, number] = [1.5, 1.5];

function no(lado: Lado, coluna: number, linha: number, rotulo: string, cor: EntidadeFonte['cor']): EntidadeFonte {
  return { pos: [LADO[lado] * coluna, linha], rotulo, cor, tamanho: TAMANHO };
}

type Papel = 'app' | 'lista' | 'itens' | 'contador';

function arvore(lado: Lado, ajuste: Partial<Record<Papel, Partial<EntidadeFonte>>> = {}): Record<string, EntidadeFonte> {
  return {
    [`${lado}-app`]: { ...no(lado, 4, -2.6, 'App', 'azul'), ...ajuste.app },
    [`${lado}-lista`]: { ...no(lado, 5.6, 0.6, 'Lista', 'neutro'), ...ajuste.lista },
    [`${lado}-itens`]: { ...no(lado, 5.6, 3.8, 'Itens ×2', 'neutro'), ...ajuste.itens },
    [`${lado}-contador`]: { ...no(lado, 2.4, 0.6, 'Contador', 'amarelo'), ...ajuste.contador },
  };
}

function arestas(lado: Lado): Record<string, LigacaoFonte> {
  return {
    [`${lado}-a-l`]: { de: `${lado}-app`, para: `${lado}-lista` },
    [`${lado}-a-c`]: { de: `${lado}-app`, para: `${lado}-contador` },
    [`${lado}-l-i`]: { de: `${lado}-lista`, para: `${lado}-itens` },
  };
}

const sinal: EntidadeFonte = { tipo: 'cartao', pos: [0.6, -2.2], rotulo: 'signal', sub: 'count', icone: 'raio', cor: 'roxo', tamanho: [1.6, 1.6] };
const dom: EntidadeFonte = { tipo: 'placa', pos: [0, 3.6], rotulo: 'DOM real', icone: 'tela', cor: 'verde', tamanho: [2.4, 2] };
const reexecuta: Partial<EntidadeFonte> = { destaque: true };
const quieto: Partial<EntidadeFonte> = { apagado: true };
const le = (estilo: LigacaoFonte['estilo'] = 'tracejada', rotulo = 'lê'): LigacaoFonte => ({
  de: 'sinal',
  para: 'f-contador',
  estilo,
  rotulo,
});

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
function contagem(vdom: string, fina: string, nivelVdom: Nivel = 'neutro', nivelFina: Nivel = 'neutro') {
  return [
    { rotulo: 'Virtual DOM', valor: vdom, nivel: nivelVdom },
    { rotulo: 'Reatividade fina', valor: fina, nivel: nivelFina },
  ];
}

export const vdomReatividade: LicaoFonte = {
  slug: 'vdom-reatividade',
  modulo: 'execucao',
  titulo: 'Virtual DOM e reatividade fina',
  resumo: 'Dois modelos de propagar uma mudança de estado: reexecutar componentes ou atualizar só quem depende do valor.',
  dificuldade: 'avancado',
  minutos: 11,
  objetivos: [
    { texto: 'Dois modelos para a mesma interface', passo: 1 },
    { texto: 'O que reexecuta quando o estado muda', passo: 2 },
    { texto: 'Como o diff evita escritas no DOM', passo: 3 },
    { texto: 'Reconciliation: tipo do elemento e key', passo: 4 },
    { texto: 'Os custos de cada modelo', passo: 5 },
  ],
  passos: [
    {
      id: 'mesma-arvore',
      titulo: 'A mesma interface, dois modelos',
      narracao:
        'Uma tela com um App, uma Lista de dois Itens e um Contador. À esquerda, o modelo de virtual DOM (React): o estado mora no App e componentes são funções que rodam de novo a cada mudança. À direita, reatividade fina (signals, como em Solid e Svelte 5): o framework registra quem lê cada valor e atualiza só essa leitura.',
      cena: {
        foco: 'Visão geral',
        entidades: { ...arvore('v', { app: { sub: 'useState' } }), ...arvore('f'), sinal },
        ligacoes: { ...arestas('v'), ...arestas('f'), le: le() },
        metricas: contagem('—', '—'),
      },
    },
    {
      id: 'mudanca',
      titulo: 'O estado muda: quem reexecuta?',
      narracao:
        'O leitor clica em incrementar. No virtual DOM, o App, dono do estado, reexecuta e, por padrão, todos os filhos reexecutam junto: cinco execuções de componente para mudar um número (os pacotes descendo a árvore). Na reatividade fina só a leitura do signal no texto do contador é refeita: uma atualização, direto do signal para quem o lê.',
      cena: {
        foco: 'Quem reexecuta',
        entidades: {
          ...arvore('v', { app: reexecuta, lista: reexecuta, itens: reexecuta, contador: reexecuta }),
          ...arvore('f', { app: quieto, lista: quieto, itens: quieto, contador: { destaque: true } }),
          sinal,
        },
        ligacoes: { ...arestas('v'), ...arestas('f'), le: le('solida', 'muda') },
        fluxos: [
          { rota: ['v-a-l', 'v-l-i'], tipo: 'pesado', taxa: 1 },
          { rota: ['v-a-c'], tipo: 'pesado', taxa: 1 },
          { rota: ['le'], tipo: 'sinal', taxa: 1 },
        ],
        metricas: contagem('5 execuções', '1 atualização', 'ruim', 'bom'),
      },
    },
    {
      id: 'diff',
      titulo: 'Reexecutar não é repintar: o diff',
      narracao:
        'Reexecutar componentes não significa mexer no DOM. O virtual DOM compara a árvore nova com a anterior (diff) e só aplica no DOM real o que mudou: aqui, um nó de texto. Os dois modelos tocam o mesmo nó; a diferença é o trabalho antes disso: o diff de cinco componentes, que a reatividade fina não faz.',
      cena: {
        foco: 'DOM real',
        entidades: {
          ...arvore('v', { contador: { destaque: true } }),
          ...arvore('f', { contador: { destaque: true } }),
          sinal,
          dom: { ...dom, destaque: true },
        },
        ligacoes: {
          ...arestas('v'),
          ...arestas('f'),
          le: le('solida', ''),
          'v-patch': { de: 'v-contador', para: 'dom', rotulo: 'patch' },
          'f-escreve': { de: 'f-contador', para: 'dom', rotulo: 'escreve' },
        },
        fluxos: [
          { rota: ['v-patch'], taxa: 0.9 },
          { rota: ['le', 'f-escreve'], tipo: 'sinal', taxa: 0.9 },
        ],
        metricas: [
          { rotulo: 'Nós do DOM tocados', valor: '1 e 1' },
          { rotulo: 'Trabalho antes', valor: 'diff de 5 × nenhum', nivel: 'alerta' },
        ],
        nota: 'esquerda: diff, depois patch · direita: escrita direta',
      },
    },
    {
      id: 'reconciliacao',
      titulo: 'Reconciliation: como o diff decide',
      narracao:
        'Comparar duas árvores quaisquer de forma ótima custa O(n³). O React faz isso em O(n) com duas heurísticas. Elemento de tipo diferente gera árvore diferente: trocar um <div> por um <section> desmonta tudo abaixo e perde o estado. Em listas, a key diz qual item é qual: com uma key estável, reordenar só move nós do DOM; com o índice como key, estado e DOM se embaralham.',
      cena: {
        foco: 'Reconciliation',
        entidades: {
          ...arvore('v', { lista: { destaque: true }, itens: { destaque: true, sub: 'key=id' } }),
          ...arvore('f', { app: quieto, lista: quieto, itens: quieto, contador: quieto }),
          sinal: { ...sinal, apagado: true },
          dom,
        },
        ligacoes: {
          ...arestas('v'),
          ...arestas('f'),
          le: le(),
          'v-move': { de: 'v-itens', para: 'dom', rotulo: 'move' },
        },
        fluxos: [
          { rota: ['v-l-i'], taxa: 1 },
          { rota: ['v-move'], taxa: 0.8 },
        ],
        metricas: [
          { rotulo: 'Tipo mudou', valor: 'remonta', nivel: 'alerta' },
          { rotulo: 'Mesma key', valor: 'reaproveita', nivel: 'bom' },
        ],
        nota: 'key estável: reordenar só move nós do DOM',
      },
    },
    {
      id: 'tradeoff',
      titulo: 'Não há vencedor, há custos diferentes',
      narracao:
        'O virtual DOM troca eficiência por um modelo mental simples: a UI é uma função do estado, e reexecutar sempre é seguro. A reatividade fina é mais eficiente por mudança, mas exige rastrear dependências e tem armadilhas próprias, como perder a reatividade ao desestruturar um valor. Em React, memo e mover o estado para baixo na árvore reduzem os rerenders do primeiro modelo.',
      cena: {
        foco: 'Trade-offs',
        entidades: {
          // Etiquetas so no topo das arvores: ligacoes chegam nas outras pecas por cima e cruzariam o texto.
          ...arvore('v', { app: { etiquetas: [{ texto: 'simples', tom: 'bom' }, { texto: 'cascata', tom: 'alerta' }] } }),
          ...arvore('f', { app: { etiquetas: [{ texto: 'rastrear deps', tom: 'alerta' }] } }),
          sinal: { ...sinal, etiquetas: [{ texto: 'cirúrgico', tom: 'bom' }] },
        },
        ligacoes: { ...arestas('v'), ...arestas('f'), le: le() },
        metricas: contagem('previsível', 'cirúrgica'),
      },
    },
  ],
  fontes: [
    { titulo: 'Reconciliation', url: 'https://legacy.reactjs.org/docs/reconciliation.html', origem: 'React (documentação antiga)', tipo: 'documentacao', idioma: 'en', nota: 'As duas heurísticas que deixam o diff em tempo linear.' },
    { titulo: 'Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Por que posição na árvore e key decidem se o estado sobrevive.' },
    { titulo: 'Rendering Lists: keeping list items in order with key', url: 'https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Por que o índice é uma key ruim para listas que mudam.' },
    { titulo: 'A Hands-on Introduction to Fine-Grained Reactivity', url: 'https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf', origem: 'Ryan Carniato (criador do Solid)', tipo: 'artigo', idioma: 'en', nota: 'Signals, efeitos e memos construídos do zero.' },
    { titulo: 'Introducing runes', url: 'https://svelte.dev/blog/runes', origem: 'Svelte', tipo: 'artigo', idioma: 'en', nota: 'Como o Svelte 5 adotou signals.' },
    { titulo: 'React Compiler', url: 'https://react.dev/learn/react-compiler', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Memoização automática para cortar rerenders no modelo de virtual DOM.' },
  ],
};
