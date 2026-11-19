import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Limites "bom" publicados pelo web.dev: LCP <= 2,5 s, CLS <= 0,1, INP <= 200 ms.
 * Esta licao e um modelo: os numeros dos chips sao de um cenario de exemplo.
 * A medicao real no browser do leitor entra na fase de polimento.
 *
 * A pagina e uma faixa comprida com tres posicoes (o "fluxo" do documento).
 * No CLS, o banner chega na posicao do meio e o texto e EMPURRADO para a
 * ultima: o layout shift acontece na cena, nao numa etiqueta.
 */
const servidor: EntidadeFonte = { pos: [-5.4, 0], rotulo: 'Servidor', icone: 'servidor', cor: 'azul' };
const pagina: EntidadeFonte = { tipo: 'placa', pos: [0, 0.6], rotulo: 'Página', icone: 'tela', cor: 'amarelo', tamanho: [6, 2.4] };
const voce: EntidadeFonte = { pos: [5.2, 1.6], rotulo: 'Você', icone: 'usuario', cor: 'neutro', tamanho: [1.4, 1.4] };
const thread: EntidadeFonte = { pos: [3.6, -2.6], rotulo: 'Main thread', icone: 'cpu', cor: 'roxo' };

/** As tres posicoes da pagina, ao longo do comprimento dela. */
const POSICAO = [-1.9, 0, 1.9] as const;
const naPagina = (i: 0 | 1 | 2) => sobre(pagina.pos, POSICAO[i], 0);
const cartao = (i: 0 | 1 | 2, rotulo: string, cor: EntidadeFonte['cor'], sub?: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: naPagina(i),
  rotulo,
  sub,
  cor,
  tamanho: [1.6, 1.6],
});
const hero = cartao(0, 'hero', 'laranja', 'imagem');
const banner = cartao(1, 'banner', 'roxo', 'tardio');
const texto = (i: 1 | 2) => cartao(i, 'texto', 'neutro');

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
function vitais(lcp: [string, Nivel], cls: [string, Nivel], inp: [string, Nivel]) {
  return [
    { rotulo: 'LCP', valor: lcp[0], nivel: lcp[1] },
    { rotulo: 'CLS', valor: cls[0], nivel: cls[1] },
    { rotulo: 'INP', valor: inp[0], nivel: inp[1] },
  ];
}

export const coreWebVitals: LicaoFonte = {
  slug: 'core-web-vitals',
  modulo: 'entrega',
  titulo: 'Core Web Vitals',
  resumo: 'LCP, CLS e INP: o que cada métrica mede, de onde vem o número e o que o piora.',
  dificuldade: 'intermediario',
  minutos: 9,
  objetivos: [
    { texto: 'O que LCP, CLS e INP perguntam', passo: 1 },
    { texto: 'O que define o LCP de uma página', passo: 2 },
    { texto: 'Por que reservar espaço evita CLS', passo: 3 },
    { texto: 'Como tarefas longas pioram o INP', passo: 4 },
    { texto: 'Medir no campo em vez de decorar números', passo: 5 },
  ],
  passos: [
    {
      id: 'tres-metricas',
      titulo: 'Três métricas, três perguntas',
      narracao:
        'Os Core Web Vitals respondem a três perguntas sobre a experiência: a página carregou rápido (LCP), ficou estável enquanto carregava (CLS) e respondeu quando o leitor interagiu (INP). Cada uma tem um limite abaixo do qual o Google considera a experiência boa: 2,5 s, 0,1 e 200 ms. O INP entrou em março de 2024 no lugar do FID, que media só o atraso da primeira interação.',
      cena: {
        foco: 'Visão geral',
        entidades: { servidor, pagina: { ...pagina, destaque: true }, texto: texto(1) },
        ligacoes: { html: { de: 'servidor', para: 'pagina', rotulo: 'HTML' } },
        fluxos: [{ rota: ['html'], taxa: 1.2 }],
        metricas: vitais(['—', 'neutro'], ['—', 'neutro'], ['—', 'neutro']),
      },
    },
    {
      id: 'lcp',
      titulo: 'LCP: quando o maior elemento aparece',
      narracao:
        'O Largest Contentful Paint marca o instante em que o maior elemento visível (normalmente uma imagem de destaque ou um bloco de texto) termina de ser pintado. Ele sobe com servidor lento, CSS que bloqueia a renderização e imagem pesada sem prioridade. Dá para medir com um PerformanceObserver do tipo largest-contentful-paint.',
      cena: {
        foco: 'LCP',
        entidades: { servidor, pagina, texto: texto(1), hero: { ...hero, destaque: true } },
        ligacoes: { imagem: { de: 'servidor', para: 'pagina', rotulo: 'hero.jpg' } },
        fluxos: [{ rota: ['imagem'], tipo: 'pesado', taxa: 0.7 }],
        metricas: vitais(['2,1 s', 'bom'], ['—', 'neutro'], ['—', 'neutro']),
        nota: 'o maior elemento visível define o LCP',
      },
    },
    {
      id: 'cls',
      titulo: 'CLS: o conteúdo que pula',
      narracao:
        'O Cumulative Layout Shift soma o quanto elementos visíveis mudam de posição sem o leitor ter pedido. Repare no texto: o banner chegou depois, sem espaço reservado, e empurrou o texto para a frente. Imagem sem width e height, anúncio tardio e fonte que troca de tamanho fazem o mesmo. É o layout-shift que o teste de performance deste projeto procura.',
      cena: {
        foco: 'CLS',
        entidades: { servidor, pagina, hero, banner: { ...banner, destaque: true }, texto: texto(2) },
        ligacoes: { anuncio: { de: 'servidor', para: 'pagina', rotulo: 'banner' } },
        fluxos: [{ rota: ['anuncio'], tipo: 'lento', taxa: 0.6 }],
        metricas: vitais(['2,1 s', 'bom'], ['0,18', 'ruim'], ['—', 'neutro']),
        nota: 'sem espaço reservado, o banner empurrou o texto',
      },
    },
    {
      id: 'inp',
      titulo: 'INP: quanto demora a resposta',
      narracao:
        'O Interaction to Next Paint mede o tempo entre uma interação (clique, toque, tecla) e o próximo frame pintado, e reporta uma das piores interações da visita. Aqui o clique chega numa main thread ocupada por uma tarefa longa: o pacote fica retido, pulsando, antes de a resposta voltar. É a lição do event loop cobrando a conta.',
      cena: {
        foco: 'INP',
        entidades: {
          pagina,
          hero,
          banner,
          texto: texto(2),
          voce,
          thread: { ...thread, destaque: true, etiquetas: [{ texto: 'tarefa de 300 ms', tom: 'ruim' }] },
        },
        ligacoes: {
          clique: { de: 'voce', para: 'pagina', rotulo: 'clique' },
          handler: { de: 'pagina', para: 'thread', rotulo: 'handler' },
        },
        fluxos: [{ rota: ['clique', 'handler'], tipo: 'sinal', taxa: 0.45, volta: true, segura: 1.2 }],
        metricas: vitais(['2,1 s', 'bom'], ['0,18', 'ruim'], ['320 ms', 'ruim']),
        nota: 'quebre tarefas longas em pedaços menores',
      },
    },
    {
      id: 'medir',
      titulo: 'Medir, não decorar',
      narracao:
        'Com espaço reservado para o banner e a tarefa longa quebrada, os três números ficam bons. Eles vêm do browser, não de uma estimativa: LCP e CLS por PerformanceObserver, INP pela Event Timing API. Números de laboratório (uma máquina, uma rede) e de campo (usuários reais) diferem, e o Google avalia o campo. Esta lição ainda é um modelo; a medição no seu browser entra na fase de polimento.',
      cena: {
        foco: 'Medição',
        entidades: {
          pagina: { ...pagina, destaque: true },
          hero,
          banner,
          texto: texto(2),
          voce,
          thread: { ...thread, etiquetas: [{ texto: 'tarefas curtas', tom: 'bom' }] },
        },
        ligacoes: {
          clique: { de: 'voce', para: 'pagina', rotulo: 'clique' },
          handler: { de: 'pagina', para: 'thread', rotulo: 'handler' },
        },
        fluxos: [{ rota: ['clique', 'handler'], tipo: 'sinal', taxa: 0.9, volta: true }],
        metricas: vitais(['2,1 s', 'bom'], ['0,02', 'bom'], ['120 ms', 'bom']),
      },
    },
  ],
  fontes: [
    { titulo: 'Web Vitals', url: 'https://web.dev/articles/vitals', origem: 'web.dev', tipo: 'guia', idioma: 'en', nota: 'As métricas, os limites e como o Google avalia os dados de campo.' },
    { titulo: 'Largest Contentful Paint (LCP)', url: 'https://web.dev/articles/lcp', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Que elementos contam e como medir com PerformanceObserver.' },
    { titulo: 'Cumulative Layout Shift (CLS)', url: 'https://web.dev/articles/cls', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Como o score é somado em janelas de sessão.' },
    { titulo: 'Interaction to Next Paint (INP)', url: 'https://web.dev/articles/inp', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'As três fases de uma interação: atraso, processamento e apresentação.' },
    { titulo: 'Interaction to Next Paint becomes a Core Web Vital on March 12', url: 'https://web.dev/blog/inp-cwv-march-12', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'O anúncio da troca do FID pelo INP, em 2024.' },
    { titulo: 'Optimize Largest Contentful Paint', url: 'https://web.dev/articles/optimize-lcp', origem: 'web.dev', tipo: 'guia', idioma: 'en', nota: 'As quatro partes do LCP e o que atacar em cada uma.' },
  ],
};
