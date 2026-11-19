import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Continuacao da licao de hidratacao: a mesma pagina com tres partes, duas
 * estaticas (cabecalho e artigo) e uma interativa (carrinho). Cada passo
 * mostra quanto dela vira JavaScript no cliente em cada abordagem.
 */
const servidor: EntidadeFonte = { pos: [-4.2, -2.6], rotulo: 'Servidor', icone: 'servidor', cor: 'azul' };
const thread: EntidadeFonte = { pos: [4.2, -2.6], rotulo: 'Main thread', sub: 'JavaScript', icone: 'cpu', cor: 'roxo' };
const pagina: EntidadeFonte = { tipo: 'placa', pos: [0, 1.2], rotulo: 'Página', icone: 'tela', cor: 'amarelo', tamanho: [6, 2.4] };
const voce: EntidadeFonte = { pos: [5.6, 2.6], rotulo: 'Você', icone: 'usuario', cor: 'neutro', tamanho: [1.4, 1.4] };
const banco: EntidadeFonte = { pos: [-6.4, 1.4], rotulo: 'Banco', icone: 'banco', cor: 'roxo', tamanho: [1.6, 1.6] };

const POSICAO = [-1.9, 0, 1.9] as const;
const parte = (i: 0 | 1 | 2, rotulo: string, sub: string, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(pagina.pos, POSICAO[i], 0),
  rotulo,
  sub,
  cor,
  tamanho: [1.6, 1.6],
});
const cabecalho = parte(0, 'cabeçalho', 'estático', 'neutro');
const artigo = parte(1, 'artigo', 'estático', 'neutro');
const carrinho = parte(2, 'carrinho', 'interativo', 'laranja');

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
function metricas(js: [string, Nivel], reexecuta: [string, Nivel], clique: [string, Nivel]) {
  return [
    { rotulo: 'JS na carga', valor: js[0], nivel: js[1] },
    { rotulo: 'Reexecuta no cliente', valor: reexecuta[0], nivel: reexecuta[1] },
    { rotulo: '1º clique', valor: clique[0], nivel: clique[1] },
  ];
}

const abordagem = (coluna: number, rotulo: string, sub: string, ganho: string, preco: string): EntidadeFonte => ({
  pos: [coluna, 0],
  rotulo,
  sub,
  cor: 'neutro',
  etiquetas: [
    { texto: ganho, tom: 'bom' },
    { texto: preco, tom: 'alerta' },
  ],
});

export const ilhasEResumabilidade: LicaoFonte = {
  slug: 'ilhas-e-resumabilidade',
  modulo: 'execucao',
  titulo: 'Ilhas, resumabilidade e Server Components',
  resumo:
    'Hidratar a página inteira refaz no cliente o que o servidor já fez. Três abordagens atacam esse custo de lados diferentes.',
  dificuldade: 'avancado',
  minutos: 9,
  objetivos: [
    { texto: 'Por que a hidratação completa é cara', passo: 1 },
    { texto: 'Ilhas: hidratar só o que é interativo', passo: 2 },
    { texto: 'Resumabilidade: retomar em vez de repetir', passo: 3 },
    { texto: 'Server Components e a fronteira use client', passo: 4 },
    { texto: 'O preço de cada alternativa', passo: 5 },
  ],
  passos: [
    {
      id: 'hidratacao-completa',
      titulo: 'Hidratação completa: tudo roda de novo',
      narracao:
        'Na hidratação clássica o cliente baixa o código de todos os componentes da página e executa a árvore inteira para anexar os handlers, inclusive o cabeçalho e o artigo, que nunca vão reagir a nada. O servidor já tinha feito esse trabalho: o cliente refaz tudo só para descobrir onde estão os eventos. Quanto maior a página, maior o bundle e a janela morta.',
      cena: {
        foco: 'Hidratação',
        entidades: {
          servidor,
          thread: { ...thread, destaque: true, etiquetas: [{ texto: 'reexecuta tudo', tom: 'ruim' }] },
          pagina,
          cabecalho: { ...cabecalho, destaque: true },
          artigo: { ...artigo, destaque: true },
          carrinho: { ...carrinho, destaque: true },
        },
        ligacoes: {
          js: { de: 'servidor', para: 'thread', rotulo: 'JS da página toda' },
          hidrata: { de: 'thread', para: 'pagina', rotulo: 'hidrata' },
        },
        fluxos: [
          { rota: ['js'], tipo: 'pesado', taxa: 0.8 },
          { rota: ['hidrata'], tipo: 'sinal', taxa: 1.2 },
        ],
        metricas: metricas(['100%', 'ruim'], ['3 de 3', 'ruim'], ['espera hidratar', 'alerta']),
      },
    },
    {
      id: 'ilhas',
      titulo: 'Ilhas: só o interativo hidrata',
      narracao:
        'A arquitetura de ilhas (Astro, Fresh) trata a página como HTML estático com ilhas de interatividade. Cada ilha é um componente isolado que baixa e hidrata sozinho; o resto da página nunca vira JavaScript. No Astro, diretivas como client:load, client:idle e client:visible dizem quando cada ilha acorda, e uma ilha fora da tela pode nem baixar.',
      cena: {
        foco: 'Ilhas',
        entidades: {
          servidor,
          thread: { ...thread, etiquetas: [{ texto: 'só a ilha', tom: 'bom' }] },
          pagina,
          cabecalho: { ...cabecalho, apagado: true },
          artigo: { ...artigo, apagado: true },
          carrinho: { ...carrinho, destaque: true, sub: 'ilha' },
        },
        ligacoes: {
          js: { de: 'servidor', para: 'thread', rotulo: 'carrinho.js' },
          hidrata: { de: 'thread', para: 'carrinho', rotulo: 'hidrata' },
        },
        fluxos: [
          { rota: ['js'], taxa: 0.9 },
          { rota: ['hidrata'], tipo: 'sinal', taxa: 1.2 },
        ],
        metricas: metricas(['~20%', 'bom'], ['1 de 3', 'bom'], ['após a ilha', 'bom']),
        nota: 'HTML estático com ilhas de JavaScript',
      },
    },
    {
      id: 'resumabilidade',
      titulo: 'Resumabilidade: retomar em vez de repetir',
      narracao:
        'O Qwik leva a ideia ao extremo: o servidor serializa no HTML o estado e onde está cada handler, e o cliente não executa nenhum componente na carga. Um loader de poucos kB escuta os eventos; no primeiro clique em comprar, baixa só o código daquele handler e o executa. Não há fase de hidratação: a página é retomada de onde o servidor parou.',
      cena: {
        foco: 'Resumabilidade',
        entidades: {
          servidor,
          thread: { ...thread, etiquetas: [{ texto: 'ociosa na carga', tom: 'bom' }] },
          pagina,
          cabecalho,
          artigo,
          carrinho: { ...carrinho, destaque: true },
          voce: { ...voce, destaque: true },
        },
        ligacoes: {
          handler: { de: 'servidor', para: 'thread', rotulo: 'só o handler', estilo: 'tracejada' },
          clique: { de: 'voce', para: 'carrinho', rotulo: 'clique' },
        },
        fluxos: [
          { rota: ['clique'], tipo: 'sinal', taxa: 0.6, volta: true, segura: 0.6 },
          { rota: ['handler'], tipo: 'lento', taxa: 0.6 },
        ],
        metricas: metricas(['~1 kB', 'bom'], ['nada', 'bom'], ['baixa o handler', 'alerta']),
        nota: 'o estado já vem serializado no HTML',
      },
    },
    {
      id: 'server-components',
      titulo: 'Server Components: código que fica no servidor',
      narracao:
        "React Server Components dividem a árvore. Componentes de servidor rodam só no servidor (podem até ler o banco direto) e mandam ao cliente o resultado já renderizado, sem o próprio código. Só os componentes marcados com 'use client' entram no bundle e hidratam. É a ideia das ilhas dentro do modelo de componentes do React, e é o padrão do App Router do Next.js.",
      cena: {
        foco: 'Server Components',
        entidades: {
          servidor: { ...servidor, destaque: true, sub: 'RSC' },
          banco,
          thread,
          pagina,
          cabecalho: { ...cabecalho, sub: 'servidor' },
          artigo: { ...artigo, sub: 'servidor' },
          carrinho: { ...carrinho, sub: 'use client', destaque: true },
        },
        ligacoes: {
          leitura: { de: 'banco', para: 'servidor', rotulo: 'lê direto' },
          rsc: { de: 'servidor', para: 'pagina', rotulo: 'HTML pronto' },
          js: { de: 'servidor', para: 'thread', rotulo: 'só use client' },
          hidrata: { de: 'thread', para: 'carrinho', rotulo: 'hidrata' },
        },
        fluxos: [
          { rota: ['leitura', 'rsc'], taxa: 0.8 },
          { rota: ['js', 'hidrata'], taxa: 0.6 },
        ],
        metricas: metricas(['só use client', 'bom'], ['1 de 3', 'bom'], ['após hidratar', 'bom']),
      },
    },
    {
      id: 'custos',
      titulo: 'Cada alternativa cobra em outro lugar',
      narracao:
        'Ilhas complicam o estado compartilhado entre partes da página. Resumabilidade troca a hidratação por uma pequena espera de rede na primeira interação, que o prefetch de handlers ajuda a esconder. Server Components exigem pensar na fronteira entre servidor e cliente e um framework que fale o protocolo. A pergunta é sempre a mesma: quanto desta página precisa mesmo ser interativo?',
      cena: {
        foco: 'Trade-offs',
        entidades: {
          ilhas: abordagem(-4.2, 'Ilhas', 'Astro, Fresh', 'menos JS', 'estado entre ilhas'),
          resumavel: abordagem(0, 'Resumável', 'Qwik', 'zero hidratação', '1º clique na rede'),
          rsc: abordagem(4.2, 'RSC', 'Next.js', 'menos bundle', 'nova fronteira'),
        },
        metricas: [],
      },
    },
  ],
  fontes: [
    { titulo: 'Islands Architecture', url: 'https://jasonformat.com/islands-architecture/', origem: 'Jason Miller', tipo: 'artigo', idioma: 'en', nota: 'O texto que popularizou o termo e a motivação por trás dele.' },
    { titulo: 'Islands architecture', url: 'https://docs.astro.build/en/concepts/islands/', origem: 'Astro', tipo: 'documentacao', idioma: 'en', nota: 'Ilhas na prática, com as diretivas client:* que decidem quando hidratar.' },
    { titulo: 'Resumable', url: 'https://qwik.dev/docs/concepts/resumable/', origem: 'Qwik', tipo: 'documentacao', idioma: 'en', nota: 'O que é serializado no HTML e como o Qwik retoma a execução.' },
    { titulo: 'Server Components', url: 'https://react.dev/reference/rsc/server-components', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Componentes que rodam só no servidor e o que vai para o cliente.' },
    { titulo: "'use client'", url: 'https://react.dev/reference/rsc/use-client', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Como a diretiva marca a fronteira entre servidor e cliente.' },
    { titulo: 'Islands Architecture', url: 'https://www.patterns.dev/vanilla/islands-architecture', origem: 'patterns.dev', tipo: 'guia', idioma: 'en', nota: 'Comparação das ilhas com SSR, SSG e hidratação progressiva.' },
  ],
};
