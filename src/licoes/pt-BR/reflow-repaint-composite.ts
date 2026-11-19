import type { EntidadeFonte, LicaoFonte, LigacaoFonte } from '../../schema/licao';

/**
 * O pipeline a partir do layout, mais um cartao: "a sua mudanca". A cada passo
 * o cartao se move ate o estagio onde aquela propriedade faz o browser voltar,
 * e os estagios que ficam de fora esmaecem. As ligacoes l-p e p-c existem em
 * todos os passos: o laboratorio dispara pacotes por elas (ver LicaoPagina).
 */

// Pipeline na HORIZONTAL ([coluna, linha] direto): esta licao divide a altura com o
// laboratorio, entao a cena precisa ser larga e baixa para a camera nao encolher o texto.
const layout: EntidadeFonte = { pos: [0, 0], rotulo: 'Layout', sub: 'geometria', icone: 'regua', cor: 'amarelo' };
const paint: EntidadeFonte = { pos: [4.2, 0], rotulo: 'Paint', sub: 'pixels', icone: 'pincel', cor: 'laranja' };
const composite: EntidadeFonte = { pos: [8.4, 0], rotulo: 'Composite', sub: 'GPU', icone: 'camadas', cor: 'azul' };

/** O cartao da mudanca: base quadrada (texto cabe melhor num losango do que num paralelogramo). */
/** O cartao da mudanca fica acima, logo antes do estagio que ela reabre. */
const mudanca = (coluna: number, rotulo: string, sub?: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: [coluna, -1.9],
  rotulo,
  sub,
  cor: 'neutro',
  tamanho: [2, 2],
});

const pipeline = (estilo: LigacaoFonte['estilo'] = 'solida'): Record<string, LigacaoFonte> => ({
  'l-p': { de: 'layout', para: 'paint', estilo },
  'p-c': { de: 'paint', para: 'composite' },
});

// Sem chips de metricas nesta licao: o painel do laboratorio, ao lado, mostra o
// que foi MEDIDO. Chips de modelo aqui repetiriam a informacao e roubariam altura do palco.

export const reflowRepaintComposite: LicaoFonte = {
  slug: 'reflow-repaint-composite',
  modulo: 'renderizacao',
  titulo: 'Reflow, repaint e composite',
  resumo:
    'Três tipos de mudança de estilo, três custos diferentes. Dispare cada uma e veja o browser admitir o que re-executou.',
  dificuldade: 'intermediario',
  minutos: 10,
  laboratorio: 'custo-de-renderizacao',
  fidelidade: 'medido',
  objetivos: [
    { texto: 'Para qual estágio cada mudança de CSS volta', passo: 1 },
    { texto: 'Quais propriedades disparam layout', passo: 2 },
    { texto: 'Quais propriedades só repintam', passo: 3 },
    { texto: 'Por que transform e opacity são baratas', passo: 4 },
    { texto: 'O orçamento de 16,7 ms por frame', passo: 5 },
  ],
  passos: [
    {
      id: 'tres-custos',
      titulo: 'Toda mudança volta a algum estágio',
      narracao:
        'Quando você muda um estilo, o browser não refaz tudo: ele volta ao estágio do pipeline que aquela propriedade afeta e re-executa dali para frente. Há três pontos de retorno possíveis: layout, paint ou composite. Quanto mais cedo ele volta, mais trabalho refaz. Use os três botões abaixo: cada clique dispara um pacote pelo pipeline, a partir do estágio que a mudança reabre.',
      cena: {
        foco: 'Pipeline',
        entidades: {
          layout: { ...layout, etiquetas: [{ texto: 'caro', tom: 'ruim' }] },
          paint: { ...paint, etiquetas: [{ texto: 'médio', tom: 'alerta' }] },
          composite: { ...composite, etiquetas: [{ texto: 'barato', tom: 'bom' }] },
        },
        ligacoes: pipeline(),
        fluxos: [{ rota: ['l-p', 'p-c'], taxa: 0.7 }],
        nota: 'voltar mais cedo = refazer mais',
      },
    },
    {
      id: 'layout',
      titulo: 'Layout: mudou a geometria, refaz tudo',
      narracao:
        'Mudar width ou top altera tamanho e posição, e isso pode empurrar outros elementos. O browser recalcula a geometria, depois repinta, depois compõe. Clique em “width + top”: o painel marca os três estágios e o PerformanceObserver registra um layout-shift, a prova de que algo se moveu na tela.',
      cena: {
        foco: 'Layout',
        entidades: {
          mudanca: mudanca(-2.1, 'width', '+ top'),
          layout: { ...layout, destaque: true },
          paint,
          composite,
        },
        ligacoes: { 'm-entra': { de: 'mudanca', para: 'layout' }, ...pipeline() },
        fluxos: [{ rota: ['m-entra', 'l-p', 'p-c'], tipo: 'pesado', taxa: 0.8 }],
        nota: 'width, height, top, left, margin, font-size',
      },
    },
    {
      id: 'paint',
      titulo: 'Paint: mudou a aparência, a geometria fica',
      narracao:
        'Mudar background-color ou color não mexe em nenhuma caixa: o layout é aproveitado como está. O browser só repinta a camada afetada e recompõe. Clique em “background-color”: a geometria não muda e não há layout-shift, mas o paint foi refeito.',
      cena: {
        foco: 'Paint',
        entidades: {
          mudanca: mudanca(2.1, 'background-color'),
          layout: { ...layout, apagado: true },
          paint: { ...paint, destaque: true },
          composite,
        },
        ligacoes: { 'm-entra': { de: 'mudanca', para: 'paint' }, ...pipeline('desligada') },
        fluxos: [{ rota: ['m-entra', 'p-c'], taxa: 1 }],
        nota: 'color, background-color, box-shadow',
      },
    },
    {
      id: 'composite',
      titulo: 'Composite: só reposiciona camadas',
      narracao:
        'Mudar transform ou opacity é o único caso que não toca em layout nem em paint: a GPU só move ou mistura camadas que já estão pintadas. Clique em “transform + opacity”: o elemento se desloca na tela, mas a geometria de layout é a mesma e não há layout-shift.',
      cena: {
        foco: 'Composite',
        entidades: {
          mudanca: mudanca(6.3, 'transform', '+ opacity'),
          layout: { ...layout, apagado: true },
          paint: { ...paint, apagado: true },
          composite: { ...composite, destaque: true },
        },
        ligacoes: {
          'm-entra': { de: 'mudanca', para: 'composite' },
          'l-p': { de: 'layout', para: 'paint', estilo: 'desligada' },
          'p-c': { de: 'paint', para: 'composite', estilo: 'desligada' },
        },
        fluxos: [{ rota: ['m-entra'], tipo: 'sinal', taxa: 1.6 }],
        nota: 'só transform e opacity chegam aqui',
      },
    },
    {
      id: 'orcamento',
      titulo: 'Por que isso decide a fluidez',
      narracao:
        'A 60 fps cada frame tem cerca de 16 ms para tudo. Animar left ou width força layout em todo frame; animar transform só compõe. Por isso o próprio motor desta cena anima apenas transform e opacity, e por isso o teste de performance garante que o composite não gera layout-shift e que os pacotes desta cena rodam sem nenhum layout.',
      cena: {
        foco: 'Orçamento do frame',
        entidades: {
          'anima-left': { ...mudanca(-2.1, 'animar left'), etiquetas: [{ texto: 'layout a cada frame', tom: 'ruim' }] },
          'anima-transform': { ...mudanca(6.3, 'animar transform'), etiquetas: [{ texto: 'só compõe', tom: 'bom' }] },
          layout,
          paint,
          composite,
        },
        ligacoes: {
          'left-entra': { de: 'anima-left', para: 'layout' },
          'transform-entra': { de: 'anima-transform', para: 'composite' },
          ...pipeline(),
        },
        fluxos: [
          { rota: ['left-entra', 'l-p', 'p-c'], tipo: 'pesado', taxa: 1.6 },
          { rota: ['transform-entra'], tipo: 'sinal', taxa: 1.6 },
        ],
        nota: '16,7 ms por frame: anime só transform e opacity',
      },
    },
  ],
  fontes: [
    { titulo: 'Stick to compositor-only properties and manage layer count', url: 'https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Por que transform e opacity rodam no compositor, e o custo de criar camadas.' },
    { titulo: 'Avoid large, complex layouts and layout thrashing', url: 'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Layout síncrono forçado: ler geometria logo depois de escrever estilo.' },
    { titulo: 'Rendering performance', url: 'https://web.dev/articles/rendering-performance', origem: 'web.dev', tipo: 'guia', idioma: 'en', nota: 'O pipeline de pixels e o orçamento de cada frame.' },
    { titulo: 'will-change', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change', origem: 'MDN Web Docs', tipo: 'documentacao', idioma: 'en', nota: 'A dica de composição, e por que usá-la com parcimônia.' },
    { titulo: 'What forces layout/reflow', url: 'https://gist.github.com/paulirish/5d52fb081b3570c81e3a', origem: 'Paul Irish', tipo: 'artigo', idioma: 'en', nota: 'As propriedades e métodos que forçam layout quando lidos.' },
  ],
};
