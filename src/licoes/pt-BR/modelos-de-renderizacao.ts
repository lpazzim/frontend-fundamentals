import type { EntidadeFonte, LicaoFonte, LigacaoFonte } from '../../schema/licao';

/**
 * Modelo animado de CSR, SSR, SSG, ISR e streaming. Os chips sao qualitativos
 * (modelo, nao medicao): comparam os modelos entre si, nao um site real.
 *
 * Navegador a esquerda; a direita, em cima o que e estatico (CDN e build) e
 * embaixo o que roda a cada pedido (servidor e banco). Cada modelo acende o
 * caminho que o HTML faz ate a tela.
 */
const navegador: EntidadeFonte = { pos: [0, 0], rotulo: 'Navegador', icone: 'tela', cor: 'amarelo' };
const cdn: EntidadeFonte = { pos: [4.4, -2.8], rotulo: 'CDN', sub: 'arquivos', icone: 'globo', cor: 'verde' };
const build: EntidadeFonte = { pos: [8.8, -2.8], rotulo: 'Build', sub: 'no deploy', icone: 'cpu', cor: 'laranja' };
const servidor: EntidadeFonte = { pos: [4.4, 2.8], rotulo: 'Servidor', sub: 'renderiza', icone: 'servidor', cor: 'azul' };
const banco: EntidadeFonte = { pos: [8.8, 2.8], rotulo: 'Banco', sub: 'dados', icone: 'banco', cor: 'roxo' };

const apagar = (e: EntidadeFonte): EntidadeFonte => ({ ...e, apagado: true });
const ida = (de: string, para: string, rotulo?: string, estilo: LigacaoFonte['estilo'] = 'solida'): LigacaoFonte => ({
  de,
  para,
  rotulo,
  estilo,
});

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
function metricas(ttfb: [string, Nivel], lcp: [string, Nivel], html: [string, Nivel], custo: [string, Nivel]) {
  return [
    { rotulo: 'TTFB', valor: ttfb[0], nivel: ttfb[1] },
    { rotulo: 'LCP', valor: lcp[0], nivel: lcp[1] },
    { rotulo: 'HTML inicial', valor: html[0], nivel: html[1] },
    { rotulo: 'Servidor', valor: custo[0], nivel: custo[1] },
  ];
}

/** Um modelo no passo final: o nome no bloco, o caso de uso embaixo e o preco na etiqueta. */
const modelo = (coluna: number, rotulo: string, sub: string, preco: string, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  pos: [coluna, 0],
  rotulo,
  sub,
  cor,
  etiquetas: [{ texto: preco, tom: 'alerta' }],
});

export const modelosDeRenderizacao: LicaoFonte = {
  slug: 'modelos-de-renderizacao',
  modulo: 'execucao',
  titulo: 'CSR, SSR, SSG e ISR',
  resumo:
    'Onde e quando o HTML é gerado: no browser, no servidor a cada pedido, no build ou num meio-termo que regenera páginas e faz streaming.',
  dificuldade: 'intermediario',
  minutos: 11,
  objetivos: [
    { texto: 'Por que CSR tem TTFB rápido e LCP lento', passo: 1 },
    { texto: 'O que o SSR ganha e quanto custa por pedido', passo: 2 },
    { texto: 'SSG: a resposta mais rápida, com dado congelado', passo: 3 },
    { texto: 'ISR e streaming: os meios-termos modernos', passo: 5 },
    { texto: 'Escolher o modelo por página', passo: 6 },
  ],
  passos: [
    {
      id: 'csr',
      titulo: 'CSR: o browser monta tudo',
      narracao:
        'No client-side rendering, a CDN devolve um HTML quase vazio: um <div id="root"> e a tag do bundle. O primeiro byte chega rápido, mas nada aparece antes de o JavaScript baixar, executar e buscar os dados na API. FCP e LCP atrasam, e crawlers e prévias de link que não executam JavaScript veem uma página vazia (o Google executa, mas numa segunda etapa).',
      cena: {
        foco: 'CSR',
        entidades: {
          navegador: { ...navegador, destaque: true, etiquetas: [{ texto: 'renderiza aqui', tom: 'alerta' }] },
          cdn,
          servidor: { ...servidor, sub: 'API JSON' },
          banco,
        },
        ligacoes: {
          shell: ida('cdn', 'navegador', 'HTML vazio + JS'),
          api: ida('navegador', 'servidor', 'fetch'),
          consulta: ida('servidor', 'banco', 'query'),
        },
        fluxos: [
          { rota: ['shell'], tipo: 'pesado', taxa: 0.7 },
          { rota: ['api', 'consulta'], taxa: 0.5, volta: true },
        ],
        metricas: metricas(['rápido', 'bom'], ['lento', 'ruim'], ['vazio', 'ruim'], ['só arquivos', 'bom']),
        nota: 'a tela só aparece depois do JavaScript',
      },
    },
    {
      id: 'ssr',
      titulo: 'SSR: HTML pronto a cada pedido',
      narracao:
        'No server-side rendering, o servidor executa os componentes a cada requisição, busca os dados e devolve o HTML completo. Leitor e crawler veem conteúdo no primeiro paint: LCP e SEO melhoram. O custo vai para o servidor, que paga a renderização em todo pedido, e o TTFB passa a incluir o tempo de buscar os dados. A página ainda precisa hidratar para responder a cliques.',
      cena: {
        foco: 'SSR',
        entidades: {
          navegador,
          cdn: apagar(cdn),
          servidor: { ...servidor, destaque: true, etiquetas: [{ texto: 'renderiza por pedido', tom: 'alerta' }] },
          banco,
        },
        ligacoes: {
          pagina: ida('navegador', 'servidor', 'GET /pedidos'),
          consulta: ida('servidor', 'banco', 'query'),
        },
        fluxos: [{ rota: ['pagina', 'consulta'], taxa: 0.6, volta: true, segura: 0.4 }],
        metricas: metricas(['espera dados', 'alerta'], ['rápido', 'bom'], ['completo', 'bom'], ['por pedido', 'alerta']),
      },
    },
    {
      id: 'ssg',
      titulo: 'SSG: HTML gerado no build',
      narracao:
        'Static site generation renderiza as páginas uma vez, no build, e publica arquivos HTML numa CDN. Nenhum servidor renderiza nada na hora do pedido: é a resposta mais rápida e barata possível. O preço é o dado congelado: se um preço muda no banco, a página só muda no próximo deploy. Serve bem para documentação, blog e marketing; não para um painel diferente para cada usuário.',
      cena: {
        foco: 'SSG',
        entidades: {
          navegador,
          cdn: { ...cdn, destaque: true, etiquetas: [{ texto: 'HTML pronto', tom: 'bom' }] },
          build: { ...build, etiquetas: [{ texto: 'roda uma vez' }] },
          servidor: apagar(servidor),
          banco,
        },
        ligacoes: {
          estatico: ida('navegador', 'cdn', 'GET /blog'),
          publica: ida('build', 'cdn', 'deploy', 'tracejada'),
          leitura: ida('banco', 'build', 'no build', 'tracejada'),
        },
        fluxos: [
          { rota: ['estatico'], taxa: 1.2, volta: true },
          { rota: ['leitura', 'publica'], tipo: 'lento', taxa: 0.35 },
        ],
        metricas: metricas(['mínimo', 'bom'], ['rápido', 'bom'], ['completo', 'bom'], ['nenhum', 'bom']),
        nota: 'o dado é o do último build',
      },
    },
    {
      id: 'isr',
      titulo: 'ISR: estático que se renova',
      narracao:
        'Incremental static regeneration (Next.js) serve a página estática do cache e, vencido o tempo de revalidação, regenera aquela página em segundo plano no próximo pedido. Quem pediu recebe a versão antiga na hora; os seguintes recebem a nova. É stale-while-revalidate aplicado a HTML: velocidade de SSG, com um dado que envelhece no máximo o intervalo escolhido. Também dá para revalidar sob demanda, quando o CMS avisa.',
      cena: {
        foco: 'ISR',
        entidades: {
          navegador,
          cdn: { ...cdn, etiquetas: [{ texto: 'serve o stale', tom: 'alerta' }] },
          build: apagar(build),
          servidor: { ...servidor, destaque: true },
          banco,
        },
        ligacoes: {
          estatico: ida('navegador', 'cdn', 'GET /produto/7'),
          regenera: ida('cdn', 'servidor', 'revalida', 'tracejada'),
          consulta: ida('servidor', 'banco', 'query'),
        },
        fluxos: [
          { rota: ['estatico'], taxa: 1.2, volta: true },
          { rota: ['regenera', 'consulta'], tipo: 'lento', taxa: 0.4, volta: true },
        ],
        metricas: metricas(['mínimo', 'bom'], ['rápido', 'bom'], ['completo', 'bom'], ['em 2º plano', 'bom']),
        nota: 'revalidate: 60 → no máximo 60 s de atraso',
      },
    },
    {
      id: 'streaming',
      titulo: 'Streaming SSR: o HTML chega em partes',
      narracao:
        'Em vez de esperar o dado mais lento para mandar tudo, o servidor envia o shell da página na hora e vai completando o mesmo response conforme cada parte fica pronta. Em React, cada <Suspense> é um ponto de corte: o fallback aparece primeiro e o conteúdo chega depois, já no lugar. TTFB e FCP melhoram sem abrir mão do HTML do servidor.',
      cena: {
        foco: 'Streaming',
        entidades: {
          navegador: {
            ...navegador,
            destaque: true,
            etiquetas: [{ texto: 'shell já', tom: 'bom' }, { texto: 'resto depois' }],
          },
          servidor: { ...servidor, sub: 'em stream' },
          banco: { ...banco, etiquetas: [{ texto: 'consulta lenta', tom: 'alerta' }] },
        },
        ligacoes: {
          partes: ida('servidor', 'navegador', 'HTML em partes'),
          consulta: ida('servidor', 'banco', 'query'),
        },
        fluxos: [
          { rota: ['partes'], taxa: 2.2 },
          { rota: ['consulta'], tipo: 'lento', taxa: 0.4, volta: true, segura: 0.8 },
        ],
        metricas: metricas(['rápido', 'bom'], ['rápido', 'bom'], ['em partes', 'bom'], ['por pedido', 'alerta']),
        nota: 'cada <Suspense> é um ponto de corte do stream',
      },
    },
    {
      id: 'escolher',
      titulo: 'Escolher por página, não por app',
      narracao:
        'Nenhum modelo vence sempre; a pergunta é por página. O conteúdo é igual para todos e muda pouco? SSG ou ISR. Depende do usuário ou do pedido? SSR, de preferência com streaming. É uma área logada que não precisa de SEO? CSR resolve. Next.js, React Router, Nuxt e Astro deixam misturar modelos no mesmo app. E todo modelo que manda HTML pronto ainda paga a hidratação, o assunto das duas próximas lições.',
      cena: {
        foco: 'Comparação',
        entidades: {
          csr: modelo(0, 'CSR', 'área logada', 'sem SEO', 'amarelo'),
          ssr: modelo(3.4, 'SSR', 'por usuário', 'custo por pedido', 'azul'),
          ssg: modelo(6.8, 'SSG', 'docs, blog', 'dado congelado', 'verde'),
          isr: modelo(10.2, 'ISR', 'catálogo', 'atraso limitado', 'laranja'),
        },
        metricas: [],
      },
    },
  ],
  fontes: [
    { titulo: 'Rendering on the Web', url: 'https://web.dev/articles/rendering-on-the-web', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'O texto de referência comparando CSR, SSR, renderização estática e hidratação.' },
    { titulo: 'Incremental Static Regeneration (ISR)', url: 'https://nextjs.org/docs/app/guides/incremental-static-regeneration', origem: 'Next.js', tipo: 'documentacao', idioma: 'en', nota: 'Revalidação por tempo e sob demanda, com exemplos.' },
    { titulo: 'renderToPipeableStream', url: 'https://react.dev/reference/react-dom/server/renderToPipeableStream', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Como o React faz streaming de HTML e onde o Suspense entra.' },
    { titulo: 'Streaming Server-Side Rendering', url: 'https://www.patterns.dev/react/streaming-ssr', origem: 'patterns.dev', tipo: 'guia', idioma: 'en', nota: 'O padrão de streaming com diagramas de linha do tempo.' },
    { titulo: 'Understand the JavaScript SEO basics', url: 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics', origem: 'Google Search Central', tipo: 'documentacao', idioma: 'en', nota: 'Como o Google rastreia, renderiza e indexa páginas que dependem de JavaScript.' },
  ],
};
