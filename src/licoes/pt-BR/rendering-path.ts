import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { g } from '../autoria';

/** Pecas da licao. Cada passo escolhe quais estao em cena; o motor anima quem entra, sai e se move. */

const html: EntidadeFonte = { pos: g(0, 0), rotulo: 'HTML', sub: 'bytes', icone: 'arquivo', cor: 'laranja' };
const css: EntidadeFonte = { pos: g(0, 3.4), rotulo: 'CSS', sub: 'bytes', icone: 'arquivo', cor: 'roxo' };
const dom: EntidadeFonte = { pos: g(3.8, 0), rotulo: 'DOM', sub: 'nós', icone: 'arvore', cor: 'azul' };
const cssom: EntidadeFonte = { pos: g(3.8, 3.4), rotulo: 'CSSOM', sub: 'estilos', icone: 'arvore', cor: 'roxo' };
const render: EntidadeFonte = { pos: g(7.4, 1.7), rotulo: 'Render tree', sub: 'visível', icone: 'camadas', cor: 'verde' };
const layout: EntidadeFonte = { pos: g(11, 1.7), rotulo: 'Layout', sub: 'geometria', icone: 'regua', cor: 'amarelo' };
const paint: EntidadeFonte = { pos: g(14.6, 1.7), rotulo: 'Paint', sub: 'pixels', icone: 'pincel', cor: 'laranja' };
const composite: EntidadeFonte = { pos: g(18.2, 1.7), rotulo: 'Composite', sub: 'GPU', icone: 'camadas', cor: 'azul' };

const foco = (e: EntidadeFonte, etiquetas: EntidadeFonte['etiquetas'] = []): EntidadeFonte => ({
  ...e,
  destaque: true,
  etiquetas,
});

function metricas(estagio: number, entrada: string, saida: string) {
  return [
    { rotulo: 'Estágio', valor: `${estagio} de 6` },
    { rotulo: 'Entra', valor: entrada },
    { rotulo: 'Sai', valor: saida },
  ];
}

export const renderingPath: LicaoFonte = {
  slug: 'rendering-path',
  modulo: 'renderizacao',
  titulo: 'Como o browser monta a página',
  resumo:
    'Os seis estágios entre receber o HTML e pintar pixels, e por que a ordem deles decide o custo de cada mudança.',
  dificuldade: 'iniciante',
  minutos: 8,
  objetivos: [
    { texto: 'Como o parser transforma HTML em DOM', passo: 1 },
    { texto: 'Por que o CSSOM bloqueia a renderização', passo: 2 },
    { texto: 'O que entra, e o que fica fora, da render tree', passo: 3 },
    { texto: 'O que o layout calcula e por que ele custa caro', passo: 4 },
    { texto: 'Paint e composite: de pixels a camadas na tela', passo: 6 },
  ],
  passos: [
    {
      id: 'dom',
      titulo: 'HTML vira DOM',
      narracao:
        'O parser lê o HTML de cima para baixo e monta uma árvore de nós. Cada tag abre um nó; cada nó guarda seus atributos e seus filhos. Nada foi medido nem desenhado ainda: o DOM é só estrutura.',
      cena: {
        foco: 'DOM',
        entidades: { html, dom: foco(dom) },
        ligacoes: { 'html-dom': { de: 'html', para: 'dom', rotulo: 'parse' } },
        fluxos: [{ rota: ['html-dom'], taxa: 1.4 }],
        metricas: metricas(1, 'HTML', 'DOM'),
      },
    },
    {
      id: 'cssom',
      titulo: 'CSS vira CSSOM',
      narracao:
        'Em paralelo, o CSS vira uma segunda árvore. Ela guarda o estilo já computado de cada seletor, com a cascata e a herança resolvidas. O CSSOM bloqueia a renderização: enquanto ele não existe, o browser não sabe como nada deve parecer.',
      cena: {
        foco: 'CSSOM',
        entidades: { html, dom, css, cssom: foco(cssom, [{ texto: 'bloqueia o render', tom: 'alerta' }]) },
        ligacoes: {
          'html-dom': { de: 'html', para: 'dom', rotulo: 'parse' },
          'css-cssom': { de: 'css', para: 'cssom', rotulo: 'parse' },
        },
        fluxos: [
          { rota: ['html-dom'], taxa: 1.2 },
          { rota: ['css-cssom'], taxa: 1.2 },
        ],
        metricas: metricas(2, 'CSS', 'CSSOM'),
      },
    },
    {
      id: 'render-tree',
      titulo: 'As duas árvores viram uma',
      narracao:
        'DOM e CSSOM se combinam na render tree, que contém apenas o que vai aparecer. Um nó com display none fica de fora; o conteúdo do head também. Por isso display none e visibility hidden custam diferente: um remove o nó daqui, o outro não.',
      cena: {
        foco: 'Render tree',
        entidades: { html, dom, css, cssom, render: foco(render) },
        ligacoes: {
          'html-dom': { de: 'html', para: 'dom' },
          'css-cssom': { de: 'css', para: 'cssom' },
          'dom-render': { de: 'dom', para: 'render' },
          'cssom-render': { de: 'cssom', para: 'render' },
        },
        fluxos: [
          { rota: ['html-dom', 'dom-render'], taxa: 1 },
          { rota: ['css-cssom', 'cssom-render'], taxa: 1 },
        ],
        metricas: metricas(3, 'DOM + CSSOM', 'render tree'),
        nota: 'display: none sai da árvore; visibility: hidden continua nela',
      },
    },
    {
      id: 'layout',
      titulo: 'Layout calcula a geometria',
      narracao:
        'Agora o browser resolve onde cada caixa fica e que tamanho tem, em pixels. Este estágio também se chama reflow. Mexer em width, top, font-size ou inserir um nó obriga a refazer a geometria de tudo que depende dele, e por isso ele é o estágio mais caro.',
      cena: {
        foco: 'Layout',
        entidades: { render, layout: foco(layout, [{ texto: 'caixas em px' }]) },
        ligacoes: { 'render-layout': { de: 'render', para: 'layout', rotulo: 'reflow' } },
        fluxos: [{ rota: ['render-layout'], tipo: 'pesado', taxa: 1 }],
        metricas: metricas(4, 'render tree', 'geometria em px'),
        nota: 'também chamado de reflow',
      },
    },
    {
      id: 'paint',
      titulo: 'Paint preenche os pixels',
      narracao:
        'Com a geometria pronta, o browser desenha: cor, texto, bordas, sombras. O resultado sai em camadas, não numa imagem única. Mudar color ou background-color refaz este estágio sem refazer o layout, o que já é bem mais barato.',
      cena: {
        foco: 'Paint',
        entidades: { render: { ...render, apagado: true }, layout, paint: foco(paint, [{ texto: 'em camadas' }]) },
        ligacoes: {
          'render-layout': { de: 'render', para: 'layout' },
          'layout-paint': { de: 'layout', para: 'paint', rotulo: 'repaint' },
        },
        fluxos: [{ rota: ['render-layout', 'layout-paint'], taxa: 1 }],
        metricas: metricas(5, 'geometria', 'camadas pintadas'),
      },
    },
    {
      id: 'composite',
      titulo: 'Composite junta as camadas',
      narracao:
        'A GPU empilha as camadas na ordem certa e gera o frame. Animar transform ou opacity para aqui: nenhuma geometria é recalculada, nenhum pixel é repintado. É por isso que uma animação em transform roda suave e a mesma animação em left trava.',
      cena: {
        foco: 'Composite',
        entidades: {
          layout: { ...layout, apagado: true },
          paint,
          composite: foco(composite),
        },
        ligacoes: {
          'layout-paint': { de: 'layout', para: 'paint' },
          'paint-composite': { de: 'paint', para: 'composite', rotulo: 'compor' },
        },
        fluxos: [
          { rota: ['layout-paint', 'paint-composite'], taxa: 0.9 },
          { rota: ['paint-composite'], tipo: 'sinal', taxa: 1.6 },
        ],
        metricas: metricas(6, 'camadas', 'frame na tela'),
        nota: 'transform e opacity param neste estágio',
      },
    },
  ],
  fontes: [
    { titulo: 'Understand the critical path', url: 'https://web.dev/learn/performance/understanding-the-critical-path', origem: 'web.dev', tipo: 'guia', idioma: 'en', nota: 'Quais recursos bloqueiam a renderização e como o browser prioriza cada um.' },
    { titulo: 'Critical rendering path', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path', origem: 'MDN Web Docs', tipo: 'documentacao', idioma: 'en', nota: 'DOM, CSSOM, render tree, layout e paint, na mesma ordem desta lição.' },
    { titulo: 'How browsers work', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work', origem: 'MDN Web Docs', tipo: 'guia', idioma: 'en', nota: 'Do DNS ao primeiro pixel: o caminho completo de uma navegação.' },
    { titulo: 'Inside look at modern web browser (part 3)', url: 'https://developer.chrome.com/blog/inside-browser-part3', origem: 'Chrome for Developers', tipo: 'artigo', idioma: 'en', nota: 'O que a main thread e o compositor fazem em cada estágio.' },
    { titulo: 'RenderingNG architecture', url: 'https://developer.chrome.com/docs/chromium/renderingng-architecture', origem: 'Chrome for Developers', tipo: 'artigo', idioma: 'en', nota: 'Como o Chromium implementa o pipeline, com seus processos e threads.' },
  ],
};
