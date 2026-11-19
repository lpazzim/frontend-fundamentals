import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';

/**
 * Modelo animado de bundlers. Os tempos dos chips sao ordens de grandeza
 * citadas pela documentacao do Vite e do esbuild, nao medicoes deste projeto.
 */
const main: EntidadeFonte = { pos: [-4.6, -2.6], rotulo: 'main.tsx', sub: 'entrada', icone: 'arquivo', cor: 'laranja' };
const app: EntidadeFonte = { pos: [-4.6, 2.6], rotulo: 'App.tsx', sub: 'módulo', icone: 'arquivo', cor: 'laranja' };
const bundler = (rotulo: string, sub: string, cor: EntidadeFonte['cor'] = 'roxo'): EntidadeFonte => ({
  pos: [0, 0],
  rotulo,
  sub,
  icone: 'cpu',
  cor,
});
const saida: EntidadeFonte = { pos: [4.6, 0], rotulo: 'app.4f9a.js', sub: 'minificado', icone: 'caixa', cor: 'verde' };
const navegador: EntidadeFonte = { pos: [4.6, 0], rotulo: 'Navegador', sub: 'dev', icone: 'tela', cor: 'amarelo' };

const ferramenta = (coluna: number, rotulo: string, sub: string, etiqueta?: string): EntidadeFonte => ({
  pos: [coluna, 0],
  rotulo,
  sub,
  icone: 'raio',
  cor: 'neutro',
  etiquetas: etiqueta ? [{ texto: etiqueta, tom: 'bom' }] : [],
});

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const bundlers: LicaoFonte = {
  slug: 'bundlers',
  modulo: 'ferramentas',
  titulo: 'Bundlers e o salto para ESM',
  resumo:
    'O que um bundler faz, por que o webpack ficou lento em projetos grandes e como o Vite, o esbuild e as ferramentas em Rust mudaram o jogo.',
  dificuldade: 'intermediario',
  minutos: 9,
  objetivos: [
    { texto: 'O grafo de módulos e o que sai dele', passo: 1 },
    { texto: 'Por que empacotar tudo antes de servir fica lento', passo: 2 },
    { texto: 'Dev server com ES modules nativos', passo: 3 },
    { texto: 'Por que Go e Rust aceleraram o build', passo: 4 },
    { texto: 'Por que ESM estático é a base de tudo', passo: 5 },
  ],
  passos: [
    {
      id: 'o-que-faz',
      titulo: 'O que um bundler faz',
      narracao:
        'O bundler parte de um ponto de entrada, segue cada import e monta o grafo de módulos. Depois transforma o que o browser não entende (TypeScript, JSX), junta os módulos em poucos arquivos, minifica e gera nomes com hash, para que o cache possa durar para sempre. Sem ele, o browser baixaria centenas de arquivos pequenos e não saberia o que fazer com um .tsx.',
      cena: {
        foco: 'Grafo de módulos',
        entidades: { main, app, bundler: { ...bundler('Bundler', 'grafo'), destaque: true }, saida },
        ligacoes: {
          importa: { de: 'main', para: 'app', rotulo: 'import' },
          le1: { de: 'main', para: 'bundler' },
          le2: { de: 'app', para: 'bundler' },
          gera: { de: 'bundler', para: 'saida', rotulo: 'gera' },
        },
        fluxos: [
          { rota: ['importa'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['le1', 'gera'], taxa: 0.7 },
          { rota: ['le2', 'gera'], taxa: 0.7 },
        ],
        metricas: [m('Entrada', 'main.tsx'), m('Transforma', 'TS, JSX, CSS'), m('Saída', 'arquivos com hash', 'bom')],
      },
    },
    {
      id: 'webpack',
      titulo: 'webpack: empacotar tudo antes de servir',
      narracao:
        'O webpack, padrão da última década, empacota a aplicação inteira antes de servir, inclusive no desenvolvimento. Em projetos grandes, com milhares de módulos, subir o dev server podia levar de dezenas de segundos a minutos, e cada edição reempacotava parte do grafo. A ferramenta é extremamente configurável, mas é escrita em JavaScript, que roda numa thread e paga o custo do runtime.',
      cena: {
        foco: 'Empacotar antes',
        entidades: {
          main,
          app,
          bundler: { ...bundler('webpack', 'JavaScript', 'azul'), destaque: true, etiquetas: [{ texto: 'empacota tudo antes', tom: 'ruim' }] },
          navegador,
        },
        ligacoes: {
          le1: { de: 'main', para: 'bundler' },
          le2: { de: 'app', para: 'bundler' },
          serve: { de: 'bundler', para: 'navegador', rotulo: 'bundle' },
        },
        fluxos: [
          { rota: ['le1', 'serve'], tipo: 'pesado', taxa: 0.5 },
          { rota: ['le2', 'serve'], tipo: 'pesado', taxa: 0.5 },
        ],
        metricas: [m('Dev server sobe em', 'até minutos', 'ruim'), m('Editar 1 arquivo', 'reempacota', 'alerta')],
      },
    },
    {
      id: 'esm-nativo',
      titulo: 'Vite: o browser importa ESM direto',
      narracao:
        'Browsers modernos entendem import nativo. No desenvolvimento, o Vite serve o código-fonte como ES modules: o dev server sobe na hora e o browser pede cada módulo quando precisa dele, transformado sob demanda. As dependências do node_modules são pré-empacotadas uma vez. Editar um arquivo invalida só aquele módulo (HMR), não um bundle. Para produção o Vite ainda empacota, porque centenas de requisições custam caro na rede.',
      cena: {
        foco: 'ESM nativo',
        entidades: {
          main,
          app,
          bundler: { ...bundler('Vite', 'dev server', 'verde'), destaque: true, etiquetas: [{ texto: 'transforma sob demanda', tom: 'bom' }] },
          navegador,
        },
        ligacoes: {
          le1: { de: 'main', para: 'bundler', estilo: 'tracejada' },
          le2: { de: 'app', para: 'bundler', estilo: 'tracejada' },
          serve: { de: 'navegador', para: 'bundler', rotulo: 'import', setas: 'ambas' },
        },
        fluxos: [
          { rota: ['serve'], tipo: 'sinal', taxa: 2, volta: true },
          { rota: ['le2'], tipo: 'sinal', taxa: 0.8 },
        ],
        metricas: [m('Dev server sobe em', 'na hora', 'bom'), m('Editar 1 arquivo', 'só ele (HMR)', 'bom')],
        nota: 'cada import vira um GET do próprio browser',
      },
    },
    {
      id: 'nativas',
      titulo: 'Ferramentas em Go e Rust',
      narracao:
        'O esbuild, escrito em Go, mostrou que dava para empacotar de 10 a 100 vezes mais rápido: código nativo, paralelismo em todos os núcleos e poucas passadas sobre o código. Vieram depois SWC, Rspack, Turbopack e Rolldown, em Rust. Desde o Next.js 16 o Turbopack é o bundler padrão do Next, e o Vite 8 trocou a dupla esbuild e Rollup pelo Rolldown, um bundler só para desenvolvimento e produção.',
      cena: {
        foco: 'Ferramentas nativas',
        entidades: {
          esbuild: ferramenta(0, 'esbuild', 'Go', '10–100× mais rápido'),
          swc: ferramenta(3.4, 'SWC', 'Rust'),
          turbopack: ferramenta(6.8, 'Turbopack', 'Rust', 'padrão no Next 16'),
          rolldown: ferramenta(10.2, 'Rolldown', 'Rust', 'padrão no Vite 8'),
        },
        metricas: [m('Linguagem', 'Go e Rust'), m('Paralelismo', 'todos os núcleos', 'bom')],
      },
    },
    {
      id: 'por-que-esm',
      titulo: 'Por que ESM é a base',
      narracao:
        'import e export são estáticos: ficam no topo do arquivo, com nomes fixos, e dá para conhecer o grafo inteiro sem executar nada. O require() do CommonJS é uma chamada de função, que pode estar dentro de um if e receber um caminho calculado em runtime. Por isso a indústria convergiu para ESM: ele permite servir módulos ao browser, analisar o grafo em paralelo e remover o código não usado, o assunto da próxima lição.',
      cena: {
        foco: 'ESM × CommonJS',
        entidades: {
          esm: { pos: [-3.4, -1.2], rotulo: 'import', sub: 'estático', icone: 'arquivo', cor: 'verde', etiquetas: [{ texto: 'grafo conhecido', tom: 'bom' }] },
          cjs: { pos: [3.4, -1.2], rotulo: 'require()', sub: 'dinâmico', icone: 'arquivo', cor: 'laranja', etiquetas: [{ texto: 'só em runtime', tom: 'ruim' }] },
          bundler: { ...bundler('Bundler', 'lê o grafo'), pos: [0, 3.2] },
        },
        ligacoes: {
          analisa: { de: 'esm', para: 'bundler', rotulo: 'lê' },
          adivinha: { de: 'cjs', para: 'bundler', rotulo: 'executa?', estilo: 'erro' },
        },
        fluxos: [
          { rota: ['analisa'], taxa: 1.1 },
          { rota: ['adivinha'], tipo: 'lento', taxa: 0.6, falha: 0.5 },
        ],
        metricas: [m('ESM', 'analisável', 'bom'), m('CommonJS', 'opaco', 'ruim')],
      },
    },
  ],
  fontes: [
    { titulo: 'Why Vite', url: 'https://vite.dev/guide/why', origem: 'Vite', tipo: 'documentacao', idioma: 'en', nota: 'O problema do dev server lento e a solução com ESM nativo.' },
    { titulo: 'Why is esbuild fast?', url: 'https://esbuild.github.io/faq/#why-is-esbuild-fast', origem: 'esbuild', tipo: 'documentacao', idioma: 'en', nota: 'Linguagem nativa, paralelismo e poucas passadas, explicados pelo autor.' },
    { titulo: 'Concepts', url: 'https://webpack.js.org/concepts/', origem: 'webpack', tipo: 'documentacao', idioma: 'en', nota: 'Entry, output, loaders e plugins: o vocabulário de qualquer bundler.' },
    { titulo: 'JavaScript modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules', origem: 'MDN Web Docs', tipo: 'guia', idioma: 'en', nota: 'ES modules no browser: import, export e import().' },
    { titulo: 'Vite 8.0 is out!', url: 'https://vite.dev/blog/announcing-vite8', origem: 'Vite', tipo: 'artigo', idioma: 'en', nota: 'A troca de esbuild e Rollup pelo Rolldown.' },
    { titulo: 'Next.js 16', url: 'https://nextjs.org/blog/next-16', origem: 'Next.js', tipo: 'artigo', idioma: 'en', nota: 'Turbopack estável e padrão para desenvolvimento e build.' },
    { titulo: 'Introduction', url: 'https://rolldown.rs/guide/introduction', origem: 'Rolldown', tipo: 'documentacao', idioma: 'en', nota: 'O bundler em Rust compatível com a API de plugins do Rollup.' },
  ],
};
