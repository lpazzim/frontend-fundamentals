import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { g, sobre } from '../autoria';

/** Modelo animado de hidratacao. A licao diz isso ao leitor (fidelidade: 'modelo'). */
const servidor: EntidadeFonte = { pos: g(0, 0), rotulo: 'Servidor', sub: 'SSR', icone: 'servidor', cor: 'azul' };
const tela: EntidadeFonte = { tipo: 'placa', pos: g(4.6, 0), rotulo: 'Navegador', icone: 'tela', cor: 'amarelo', tamanho: [3, 2.4] };
// Voce fica a direita da tela, na mesma altura: o clique chega pelo lado, sem cruzar a pilula da tela.
const voce: EntidadeFonte = { pos: [7.6, 3.2], rotulo: 'Você', icone: 'usuario', cor: 'neutro', tamanho: [1.4, 1.4] };
const thread: EntidadeFonte = { pos: g(4.6, -3.6), rotulo: 'Main thread', sub: 'JavaScript', icone: 'cpu', cor: 'roxo' };
const botao = (etiquetas: EntidadeFonte['etiquetas'] = []): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(tela.pos),
  rotulo: 'Comprar',
  cor: 'laranja',
  etiquetas,
});

function metricas(visivel: string, interativo: string, nivel: 'neutro' | 'bom' | 'alerta' | 'ruim' = 'neutro') {
  return [
    { rotulo: 'Visível', valor: visivel, nivel: 'bom' as const },
    { rotulo: 'Interativo', valor: interativo, nivel },
  ];
}

export const hidratacao: LicaoFonte = {
  slug: 'hidratacao',
  modulo: 'execucao',
  titulo: 'Hidratação',
  resumo:
    'Por que HTML pronto na tela ainda não responde a cliques, e o que o JavaScript precisa fazer para ligar a página.',
  dificuldade: 'intermediario',
  minutos: 8,
  objetivos: [
    { texto: 'Por que o HTML do servidor aparece rápido', passo: 1 },
    { texto: 'A janela em que a página parece pronta e não responde', passo: 2 },
    { texto: 'O custo do JavaScript na main thread', passo: 3 },
    { texto: 'O que a hidratação faz de fato', passo: 4 },
    { texto: 'Quando a página passa a responder', passo: 5 },
  ],
  passos: [
    {
      id: 'html-pronto',
      titulo: 'O HTML chega pronto e aparece',
      narracao:
        'Com renderização no servidor, o HTML já vem com o botão dentro. O browser monta o DOM e pinta: o leitor vê o botão logo, antes de qualquer JavaScript. Ver não é o mesmo que poder usar.',
      cena: {
        foco: 'Tela',
        entidades: { servidor, tela: { ...tela, destaque: true }, botao: botao() },
        ligacoes: { html: { de: 'servidor', para: 'tela', rotulo: 'HTML pronto' } },
        fluxos: [{ rota: ['html'], taxa: 1.4 }],
        metricas: metricas('0,4 s', '—'),
      },
    },
    {
      id: 'inerte',
      titulo: 'O botão está na tela, mas inerte',
      narracao:
        'O bundle de JavaScript ainda está na rede. Nenhum handler de clique foi registrado, então clicar no botão não faz nada: o clique acontece e se perde (o X vermelho). Esta janela entre "pintou" e "respondeu" é o problema real da hidratação, e dá para ver nesta própria página: os atalhos de teclado só entram no ar quando o React termina de montar.',
      cena: {
        foco: 'Event handlers',
        entidades: { servidor, tela, botao: botao([{ texto: 'inerte', tom: 'ruim' }]), voce },
        ligacoes: {
          js: { de: 'servidor', para: 'tela', rotulo: 'app.js baixando…', estilo: 'tracejada' },
          clique: { de: 'voce', para: 'tela', rotulo: 'clique' },
        },
        fluxos: [
          { rota: ['js'], tipo: 'lento', taxa: 0.5 },
          { rota: ['clique'], tipo: 'sinal', taxa: 0.9, falha: 1 },
        ],
        metricas: metricas('0,4 s', 'ainda não', 'ruim'),
        nota: 'clique agora: nada acontece',
      },
    },
    {
      id: 'executa',
      titulo: 'O JavaScript chega e ocupa a main thread',
      narracao:
        'O bundle termina de baixar e vai para a main thread, onde precisa ser parseado e executado. Enquanto isso a thread está ocupada: cliques ainda esperam, e quanto maior o bundle, maior a janela morta.',
      cena: {
        foco: 'Main thread',
        entidades: {
          servidor,
          tela,
          botao: botao([{ texto: 'inerte', tom: 'ruim' }]),
          voce,
          thread: { ...thread, destaque: true, etiquetas: [{ texto: 'parse + execução', tom: 'alerta' }] },
        },
        ligacoes: {
          bundle: { de: 'servidor', para: 'thread', rotulo: 'app.js' },
          clique: { de: 'voce', para: 'tela', rotulo: 'clique' },
        },
        fluxos: [
          { rota: ['bundle'], tipo: 'pesado', taxa: 0.8 },
          { rota: ['clique'], tipo: 'sinal', taxa: 0.9, falha: 1 },
        ],
        metricas: metricas('0,4 s', 'ainda não', 'ruim'),
      },
    },
    {
      id: 'hidratando',
      titulo: 'Hidratar é reconstruir a árvore e anexar handlers',
      narracao:
        'O framework roda os componentes de novo no cliente, compara o resultado com o DOM que o servidor mandou e, em vez de recriar os nós, reaproveita-os e anexa os event handlers. Se o HTML do servidor e a árvore do cliente divergirem, surge o erro de hydration mismatch.',
      cena: {
        foco: 'Event handlers',
        entidades: {
          servidor: { ...servidor, apagado: true },
          tela: { ...tela, destaque: true },
          botao: botao(),
          voce,
          thread,
        },
        ligacoes: { hidratar: { de: 'thread', para: 'tela', rotulo: 'handlers' } },
        fluxos: [{ rota: ['hidratar'], tipo: 'sinal', taxa: 1.4 }],
        metricas: metricas('0,4 s', 'quase', 'alerta'),
      },
    },
    {
      id: 'interativo',
      titulo: 'Agora a página responde',
      narracao:
        'Com o handler anexado, o mesmo clique agora vai e volta: a página responde. O custo foi pago em tempo de espera, não em pixels: a tela não mudou entre o passo 2 e o passo 5. Por isso ilhas, resumabilidade e Server Components existem (a próxima lição): todos tentam encolher a janela em que a página parece pronta e não está.',
      cena: {
        foco: 'Tela',
        entidades: {
          servidor: { ...servidor, apagado: true },
          tela,
          botao: botao([{ texto: 'responde', tom: 'bom' }]),
          voce: { ...voce, destaque: true },
          thread: { ...thread, apagado: true },
        },
        ligacoes: { clique: { de: 'voce', para: 'tela', rotulo: 'clique', setas: 'ambas' } },
        fluxos: [{ rota: ['clique'], tipo: 'sinal', taxa: 0.9, volta: true }],
        metricas: [...metricas('0,4 s', '2,1 s', 'alerta'), { rotulo: 'Janela morta', valor: '1,7 s', nivel: 'ruim' }],
        nota: 'clique agora: responde',
      },
    },
  ],
  fontes: [
    { titulo: 'hydrateRoot', url: 'https://react.dev/reference/react-dom/client/hydrateRoot', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'A API de hidratação do React e os erros de mismatch.' },
    { titulo: 'Rendering on the Web', url: 'https://web.dev/articles/rendering-on-the-web', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'O "um app pelo preço de dois": por que reidratar custa caro.' },
    { titulo: 'Hydration is Pure Overhead', url: 'https://www.builder.io/blog/hydration-is-pure-overhead', origem: 'Builder.io', tipo: 'artigo', idioma: 'en', nota: 'O argumento do criador do Qwik contra refazer no cliente o trabalho do servidor.' },
  ],
};
