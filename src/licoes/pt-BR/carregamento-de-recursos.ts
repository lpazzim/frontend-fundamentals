import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Modelo animado de prioridade de recursos. A cadeia HTML -> CSS -> fonte e o
 * exemplo classico de descoberta tardia: no preload, a fonte SE MOVE para
 * perto do navegador, porque passa a ser pedida na primeira ida.
 */
const navegador: EntidadeFonte = { pos: [0, 0], rotulo: 'Navegador', icone: 'tela', cor: 'amarelo' };
const html: EntidadeFonte = { pos: [3.4, 0], rotulo: 'HTML', sub: 'index.html', icone: 'arquivo', cor: 'laranja' };
const css: EntidadeFonte = { pos: [6.8, 0], rotulo: 'CSS', sub: 'estilos.css', icone: 'arquivo', cor: 'roxo' };
const fonte = (pos: EntidadeFonte['pos']): EntidadeFonte => ({ pos, rotulo: 'Fonte', sub: 'titulo.woff2', icone: 'arquivo', cor: 'azul' });
const NO_FIM_DA_CADEIA: EntidadeFonte['pos'] = [10.2, 0];
const NA_PRIMEIRA_IDA: EntidadeFonte['pos'] = [3.4, -3.6];

const cdn: EntidadeFonte = { pos: [6, 0], rotulo: 'CDN', sub: 'mesma origem', icone: 'globo', cor: 'verde' };
const outraOrigem: EntidadeFonte = { pos: [6, 0], rotulo: 'Outra origem', sub: 'fontes', icone: 'servidor', cor: 'roxo' };
const cache: EntidadeFonte = { pos: [0, -4.4], rotulo: 'Cache', sub: 'HTTP', icone: 'banco', cor: 'verde' };

const imagens: EntidadeFonte = { tipo: 'placa', pos: [6, -0.4], rotulo: 'hero.avif', sub: 'srcset', icone: 'caixa', cor: 'laranja', tamanho: [6, 2] };
const POSICAO = [-1.9, 0, 1.9] as const;
const variante = (i: 0 | 1 | 2, rotulo: string, sub: string, cor: EntidadeFonte['cor'] = 'neutro'): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(imagens.pos, POSICAO[i], 0),
  rotulo,
  sub,
  cor,
  tamanho: [1.6, 1.6],
});

const pagina: EntidadeFonte = { tipo: 'placa', pos: [0, 0.6], rotulo: 'Página', icone: 'tela', cor: 'amarelo', tamanho: [6, 2.4] };
const servidor: EntidadeFonte = { pos: [-5.4, 0], rotulo: 'CDN', icone: 'globo', cor: 'verde' };
const naPagina = (i: 0 | 1 | 2) => sobre(pagina.pos, POSICAO[i], 0);

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const carregamentoDeRecursos: LicaoFonte = {
  slug: 'carregamento-de-recursos',
  modulo: 'entrega',
  titulo: 'Prioridade de recursos e imagens',
  resumo:
    'preconnect, preload, prefetch, lazy loading e imagens responsivas: dizer ao browser o que importa primeiro e reservar o espaço do que vem depois.',
  dificuldade: 'intermediario',
  minutos: 11,
  objetivos: [
    { texto: 'Por que recursos descobertos tarde atrasam a tela', passo: 1 },
    { texto: 'preconnect, preload e prefetch: quando usar cada um', passo: 4 },
    { texto: 'Formatos modernos, srcset e lazy loading', passo: 5 },
    { texto: 'Reservar espaço para imagens e fontes', passo: 6 },
  ],
  passos: [
    {
      id: 'descoberta',
      titulo: 'O browser só pede o que já descobriu',
      narracao:
        'O preload scanner lê o HTML à frente do parser e dispara pedidos para o que encontra: scripts, CSS, imagens em <img>. O que só aparece depois, como uma fonte declarada dentro do CSS, uma imagem de fundo ou um recurso injetado por JavaScript, é descoberto tarde e entra tarde na fila. Aqui a fonte do título só é pedida na terceira ida à rede.',
      cena: {
        foco: 'Descoberta',
        entidades: {
          navegador,
          html,
          css,
          fonte: { ...fonte(NO_FIM_DA_CADEIA), destaque: true, etiquetas: [{ texto: 'descoberta tarde', tom: 'ruim' }] },
        },
        ligacoes: {
          pede: { de: 'navegador', para: 'html', rotulo: '1ª ida' },
          linka: { de: 'html', para: 'css', rotulo: '2ª ida' },
          declara: { de: 'css', para: 'fonte', rotulo: '3ª ida' },
        },
        fluxos: [{ rota: ['pede', 'linka', 'declara'], tipo: 'lento', taxa: 0.5 }],
        metricas: [m('Fonte pedida', 'na 3ª ida', 'ruim'), m('Título visível', 'atrasado', 'alerta')],
        nota: '@font-face mora no CSS: só é vista depois dele',
      },
    },
    {
      id: 'preconnect',
      titulo: 'preconnect: aquecer a conexão',
      narracao:
        'Buscar algo de outra origem (uma CDN de fontes, uma API) começa com DNS, TCP e TLS: várias idas e voltas antes do primeiro byte útil. <link rel="preconnect"> abre essa conexão cedo, enquanto o browser ainda lê o HTML. Use para uma ou duas origens críticas: conexões abertas e não usadas gastam CPU e são fechadas depois de alguns segundos.',
      cena: {
        foco: 'Conexão',
        entidades: {
          navegador: { ...navegador, destaque: true },
          origem: { ...outraOrigem, etiquetas: [{ texto: 'conexão pronta', tom: 'bom' }] },
        },
        ligacoes: { aperto: { de: 'navegador', para: 'origem', rotulo: 'DNS · TCP · TLS', setas: 'ambas' } },
        fluxos: [{ rota: ['aperto'], tipo: 'sinal', taxa: 1.4, volta: true }],
        metricas: [m('Idas poupadas', 'até 3', 'bom'), m('Origens', '1 ou 2', 'alerta')],
        nota: '<link rel="preconnect" href="https://fonts.exemplo">',
      },
    },
    {
      id: 'preload',
      titulo: 'preload: buscar já o que é crítico e tardio',
      narracao:
        '<link rel="preload" as="font"> manda buscar agora um recurso que esta página vai usar e que o browser só descobriria tarde, como a fonte do título ou a imagem de LCP declarada no CSS. Para a imagem de LCP num <img>, fetchpriority="high" sobe a prioridade sem preload. Preload demais disputa banda com o que é realmente crítico, e o Chrome avisa no console quando um preload não é usado.',
      cena: {
        foco: 'Preload',
        entidades: {
          navegador,
          html,
          css,
          fonte: { ...fonte(NA_PRIMEIRA_IDA), destaque: true, etiquetas: [{ texto: 'na 1ª ida', tom: 'bom' }] },
        },
        ligacoes: {
          pede: { de: 'navegador', para: 'html', rotulo: '1ª ida' },
          linka: { de: 'html', para: 'css', rotulo: '2ª ida' },
          antecipa: { de: 'navegador', para: 'fonte', rotulo: 'preload' },
        },
        fluxos: [
          { rota: ['antecipa'], taxa: 1 },
          { rota: ['pede', 'linka'], taxa: 0.6 },
        ],
        metricas: [m('Fonte pedida', 'na 1ª ida', 'bom'), m('Título visível', 'mais cedo', 'bom')],
        nota: 'preload: para ESTA página, e precisa ser usado',
      },
    },
    {
      id: 'prefetch',
      titulo: 'prefetch: a próxima página, em baixa prioridade',
      narracao:
        '<link rel="prefetch"> busca algo provável para a PRÓXIMA navegação, com prioridade baixa e quando a rede está ociosa, e guarda no cache HTTP. A regra prática: preload é para esta página e é certeza; prefetch é uma aposta para depois. A Speculation Rules API vai além e pode pré-renderizar a próxima página inteira em segundo plano.',
      cena: {
        foco: 'Prefetch',
        entidades: {
          navegador,
          cdn,
          cache: { ...cache, destaque: true, etiquetas: [{ texto: 'próxima página', tom: 'bom' }] },
        },
        ligacoes: {
          prefetch: { de: 'cdn', para: 'cache', rotulo: 'prefetch ocioso', estilo: 'tracejada' },
          usa: { de: 'cache', para: 'navegador' },
        },
        fluxos: [
          { rota: ['prefetch'], tipo: 'lento', taxa: 0.45 },
          { rota: ['usa'], tipo: 'sinal', taxa: 1.2 },
        ],
        metricas: [m('Prioridade', 'baixa'), m('Navegação seguinte', 'sem espera', 'bom')],
      },
    },
    {
      id: 'imagens',
      titulo: 'Imagens: formato, tamanho e preguiça',
      narracao:
        'Imagens costumam ser a maior parte dos bytes de uma página. AVIF e WebP comprimem bem mais que JPEG e PNG. srcset e sizes deixam o browser escolher o arquivo certo para a largura da tela e a densidade de pixels, em vez de mandar 1920 px para um celular. loading="lazy" adia o que está fora da tela; a exceção é a imagem de LCP, que nunca deve ser lazy.',
      cena: {
        foco: 'Imagens',
        entidades: {
          navegador: { ...navegador, sub: 'tela 960 px' },
          imagens,
          p480: variante(0, '480w', 'celular'),
          p960: { ...variante(1, '960w', 'escolhida', 'laranja'), destaque: true },
          p1920: variante(2, '1920w', 'telão'),
        },
        ligacoes: { escolhe: { de: 'p960', para: 'navegador', rotulo: 'srcset' } },
        fluxos: [{ rota: ['escolhe'], taxa: 1 }],
        metricas: [m('Formato', 'AVIF', 'bom'), m('Arquivo', '960w', 'bom'), m('Fora da tela', 'lazy', 'bom')],
        nota: 'sizes diz a largura; srcset lista os arquivos',
      },
    },
    {
      id: 'reservar-espaco',
      titulo: 'Reservar espaço: width, height e fontes',
      narracao:
        'Toda imagem precisa de width e height (ou aspect-ratio): com a proporção conhecida, o browser reserva o espaço antes de o arquivo chegar e nada pula. Com fontes, font-display: swap mostra o texto na hora com uma fonte do sistema e troca quando a web font chega; ajustar size-adjust na fonte de fallback deixa essa troca sem layout shift. É a ponte com a lição de Core Web Vitals.',
      cena: {
        foco: 'Espaço reservado',
        entidades: {
          servidor,
          pagina: { ...pagina, destaque: true },
          img: { tipo: 'cartao', pos: naPagina(0), rotulo: 'imagem', sub: 'proporção', cor: 'laranja', tamanho: [1.6, 1.6] },
          texto: { tipo: 'cartao', pos: naPagina(1), rotulo: 'texto', sub: 'swap', cor: 'neutro', tamanho: [1.6, 1.6] },
        },
        ligacoes: { chega: { de: 'servidor', para: 'pagina', rotulo: 'hero.avif' } },
        fluxos: [{ rota: ['chega'], tipo: 'pesado', taxa: 0.6 }],
        metricas: [m('CLS', '0', 'bom'), m('Texto visível', 'na hora', 'bom'), m('Troca de fonte', 'sem salto', 'bom')],
        nota: 'o espaço existe antes de o arquivo chegar',
      },
    },
  ],
  fontes: [
    { titulo: 'Preload critical assets to improve loading speed', url: 'https://web.dev/articles/preload-critical-assets', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Quando o preload ajuda, quando atrapalha e como conferir no DevTools.' },
    { titulo: 'Establish network connections early to improve perceived page speed', url: 'https://web.dev/articles/preconnect-and-dns-prefetch', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'preconnect e dns-prefetch, e o custo de cada conexão.' },
    { titulo: 'Optimize resource loading with the Fetch Priority API', url: 'https://web.dev/articles/fetch-priority', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'fetchpriority na imagem de LCP e em scripts.' },
    { titulo: 'Learn Images', url: 'https://web.dev/learn/images', origem: 'web.dev', tipo: 'guia', idioma: 'en', nota: 'Curso completo: formatos, srcset, sizes, compressão e lazy loading.' },
    { titulo: 'Responsive images', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images', origem: 'MDN Web Docs', tipo: 'guia', idioma: 'en', nota: 'srcset, sizes e <picture> com exemplos.' },
    { titulo: 'Best practices for fonts', url: 'https://web.dev/articles/font-best-practices', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'font-display, preload de fontes e fallbacks ajustados.' },
    { titulo: 'Prerender pages in Chrome for instant page navigations', url: 'https://developer.chrome.com/docs/web-platform/prerender-pages', origem: 'Chrome for Developers', tipo: 'documentacao', idioma: 'en', nota: 'A Speculation Rules API para prefetch e prerender da próxima página.' },
  ],
};
