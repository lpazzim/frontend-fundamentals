import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';

/** Modelo animado de code splitting. A fase de polimento troca isto por medicao real do bundle. */
// Navegador a esquerda, CDN a direita; o bundle fica acima da CDN e o chunk, quando
// existe, ao lado dele. No prefetch o chunk se MOVE para perto do cache do browser.
const navegador: EntidadeFonte = { pos: [0, 0], rotulo: 'Navegador', icone: 'tela', cor: 'amarelo' };
const cdn: EntidadeFonte = { pos: [6, 0], rotulo: 'CDN', icone: 'servidor', cor: 'azul' };
const bundle = (peso: string): EntidadeFonte => ({
  pos: [6, -4],
  rotulo: 'bundle',
  sub: `inicial · ${peso}`,
  icone: 'caixa',
  cor: 'laranja',
});
const grafico = (pos: EntidadeFonte['pos']): EntidadeFonte => ({
  pos,
  rotulo: 'gráficos',
  sub: '180 kB',
  icone: 'caixa',
  cor: 'roxo',
  tamanho: [1.6, 1.6],
});
const AO_LADO_DO_BUNDLE: EntidadeFonte['pos'] = [9.4, -2];
const AO_LADO_DO_CACHE: EntidadeFonte['pos'] = [-3.4, -2];
const cache: EntidadeFonte = { pos: [0, -4.4], rotulo: 'Cache', sub: 'do browser', icone: 'banco', cor: 'verde' };

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
function metricas(inicial: [string, Nivel], espera: [string, Nivel]) {
  return [
    { rotulo: 'Bundle inicial', valor: inicial[0], nivel: inicial[1] },
    { rotulo: 'Espera ao navegar', valor: espera[0], nivel: espera[1] },
  ];
}

export const codeSplitting: LicaoFonte = {
  slug: 'code-splitting',
  modulo: 'entrega',
  titulo: 'Code splitting',
  resumo: 'O que sai do bundle inicial, quando volta e o que muda quando o import vira dinâmico.',
  dificuldade: 'intermediario',
  minutos: 8,
  objetivos: [
    { texto: 'O custo de um bundle inicial único', passo: 1 },
    { texto: 'Como import() cria um chunk separado', passo: 2 },
    { texto: 'Quando o chunk é baixado', passo: 3 },
    { texto: 'Prefetch: esconder a espera antes do clique', passo: 4 },
  ],
  passos: [
    {
      id: 'import-estatico',
      titulo: 'Import estático: tudo no bundle inicial',
      narracao:
        'Com import estático, o bundler segue cada import e junta tudo num arquivo só. O leitor baixa e executa o gráfico de código completo antes da primeira tela, mesmo que nunca abra a página que usa aquela biblioteca grande.',
      cena: {
        foco: 'Bundle inicial',
        entidades: {
          navegador,
          cdn,
          bundle: { ...bundle('420 kB'), etiquetas: [{ texto: 'inclui os gráficos', tom: 'alerta' }] },
        },
        ligacoes: {
          pede: { de: 'navegador', para: 'cdn', rotulo: 'GET /app.js' },
          contem: { de: 'bundle', para: 'cdn', setas: 'nenhuma', estilo: 'tracejada' },
        },
        fluxos: [{ rota: ['pede'], tipo: 'pesado', taxa: 0.6, volta: true }],
        metricas: metricas(['420 kB', 'ruim'], ['—', 'neutro']),
      },
    },
    {
      id: 'import-dinamico',
      titulo: 'import() corta o gráfico em dois',
      narracao:
        'Trocar import estático por import() avisa o bundler de que aquele módulo só é necessário depois. Ele vira um chunk separado: a biblioteca pesada sai do bundle, o bundle inicial encolhe e a primeira tela chega mais cedo.',
      cena: {
        foco: 'Chunk sob demanda',
        entidades: {
          navegador,
          cdn,
          bundle: bundle('240 kB'),
          grafico: { ...grafico(AO_LADO_DO_BUNDLE), etiquetas: [{ texto: 'chunk separado', tom: 'bom' }] },
        },
        ligacoes: {
          pede: { de: 'navegador', para: 'cdn', rotulo: 'GET /app.js' },
          contem: { de: 'bundle', para: 'cdn', setas: 'nenhuma', estilo: 'tracejada' },
          chunk: { de: 'grafico', para: 'cdn', setas: 'nenhuma', estilo: 'tracejada' },
        },
        fluxos: [{ rota: ['pede'], taxa: 0.9, volta: true }],
        metricas: metricas(['240 kB', 'bom'], ['—', 'neutro']),
        nota: 'const grafico = await import("./grafico")',
      },
    },
    {
      id: 'sob-demanda',
      titulo: 'O chunk só viaja quando alguém precisa dele',
      narracao:
        'O leitor abre a página que usa o gráfico. Só agora o browser pede o chunk. É o preço do atalho: surge uma espera na rede no momento da navegação, e é aí que entram o estado de carregamento e o prefetch.',
      cena: {
        foco: 'Rede',
        entidades: {
          navegador: { ...navegador, destaque: true, etiquetas: [{ texto: 'esperando', tom: 'alerta' }] },
          cdn,
          bundle: { ...bundle('240 kB'), apagado: true },
          grafico: grafico(AO_LADO_DO_BUNDLE),
        },
        ligacoes: {
          pede: { de: 'navegador', para: 'cdn', rotulo: 'GET /grafico.js' },
          chunk: { de: 'grafico', para: 'cdn', setas: 'nenhuma', estilo: 'tracejada' },
        },
        fluxos: [{ rota: ['pede'], tipo: 'pesado', taxa: 0.5, volta: true, segura: 0.4 }],
        metricas: metricas(['240 kB', 'bom'], ['600 ms', 'alerta']),
      },
    },
    {
      id: 'prefetch',
      titulo: 'Prefetch paga a espera antes',
      narracao:
        'Dá para baixar o chunk antes do clique, por exemplo quando o ponteiro passa sobre o link. O chunk vai para o cache do browser, e a navegação não espera a rede. Este projeto faz exatamente isso: cada lição é um chunk próprio, e passar o ponteiro sobre o link de uma lição no menu já começa a baixá-la.',
      cena: {
        foco: 'Cache do browser',
        entidades: {
          navegador,
          cdn,
          bundle: { ...bundle('240 kB'), apagado: true },
          cache: { ...cache, destaque: true },
          grafico: grafico(AO_LADO_DO_CACHE),
        },
        ligacoes: {
          prefetch: { de: 'cdn', para: 'cache', rotulo: 'prefetch no hover', estilo: 'tracejada' },
          guardado: { de: 'grafico', para: 'cache', setas: 'nenhuma', estilo: 'tracejada' },
          usa: { de: 'cache', para: 'navegador' },
        },
        fluxos: [
          { rota: ['prefetch'], tipo: 'lento', taxa: 0.5 },
          { rota: ['usa'], tipo: 'sinal', taxa: 1.2 },
        ],
        metricas: metricas(['240 kB', 'bom'], ['0 ms', 'bom']),
        nota: 'hover no link → prefetch do chunk',
      },
    },
  ],
  fontes: [
    { titulo: 'Reduce JavaScript payloads with code splitting', url: 'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Quando dividir o bundle e como medir o ganho.' },
    { titulo: 'lazy', url: 'https://react.dev/reference/react/lazy', origem: 'react.dev', tipo: 'documentacao', idioma: 'en', nota: 'Carregar componentes sob demanda, com Suspense mostrando o fallback.' },
    { titulo: 'import()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import', origem: 'MDN Web Docs', tipo: 'documentacao', idioma: 'en', nota: 'O import dinâmico que o bundler transforma em chunk.' },
    { titulo: 'Features: dynamic import', url: 'https://vite.dev/guide/features#dynamic-import', origem: 'Vite', tipo: 'documentacao', idioma: 'en', nota: 'Como o Vite gera chunks e faz preload das dependências deles.' },
  ],
};
