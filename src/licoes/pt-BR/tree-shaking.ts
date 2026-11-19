import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Tree-shaking: o que sai do bundle e o que impede de sair. O tamanho do
 * lodash (cerca de 70 kB minificado, 25 kB com gzip, na 4.17) e o publicado
 * pelo bundlephobia; os demais numeros sao de um cenario de exemplo.
 */
const app: EntidadeFonte = { pos: [-5.4, -1.6], rotulo: 'App.tsx', sub: 'importa 1', icone: 'arquivo', cor: 'amarelo' };
const utils: EntidadeFonte = { tipo: 'placa', pos: [0, 0.4], rotulo: 'utils.ts', sub: '3 exports', icone: 'arquivo', cor: 'roxo', tamanho: [6, 2.4] };
const POSICAO = [-1.9, 0, 1.9] as const;
const exportado = (i: 0 | 1 | 2, rotulo: string, usado: boolean): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(utils.pos, POSICAO[i], 0),
  rotulo,
  sub: usado ? 'usada' : 'sem uso',
  cor: usado ? 'verde' : 'neutro',
  apagado: !usado,
  tamanho: [1.6, 1.6],
});
const bundle = (pos: EntidadeFonte['pos'], sub: string, cor: EntidadeFonte['cor'] = 'verde'): EntidadeFonte => ({
  pos,
  rotulo: 'bundle',
  sub,
  icone: 'caixa',
  cor,
});

const relatorio: EntidadeFonte = { tipo: 'placa', pos: [0, 0.6], rotulo: 'dist/app.js', sub: 'mapa do bundle', icone: 'caixa', cor: 'neutro', tamanho: [7, 3] };
const pedaco = (dgx: number, rotulo: string, sub: string, lado: number, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(relatorio.pos, dgx, 0),
  rotulo,
  sub,
  cor,
  tamanho: [lado, lado],
});

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const treeShaking: LicaoFonte = {
  slug: 'tree-shaking',
  modulo: 'ferramentas',
  titulo: 'Tree-shaking e o tamanho do bundle',
  resumo:
    'Como o bundler remove o código que ninguém importa, o que impede isso de funcionar e como descobrir o que está pesando.',
  dificuldade: 'intermediario',
  minutos: 9,
  objetivos: [
    { texto: 'O que o tree-shaking remove', passo: 1 },
    { texto: 'Por que depende de ESM estático', passo: 2 },
    { texto: 'Efeitos colaterais e sideEffects', passo: 3 },
    { texto: 'Por que lodash inteiro é um code smell', passo: 4 },
    { texto: 'Medir o bundle e travar regressões no CI', passo: 5 },
  ],
  passos: [
    {
      id: 'ideia',
      titulo: 'Remover o que ninguém usa',
      narracao:
        'Tree-shaking é eliminar do bundle os exports que nenhum módulo importa. Se utils.ts exporta data(), moeda() e slug(), e o app só importa data(), as outras duas não precisam ir para o usuário. O bundler marca o que é alcançável a partir do ponto de entrada e descarta o resto; o nome vem da imagem de sacudir a árvore para as folhas mortas caírem.',
      cena: {
        foco: 'Código morto',
        entidades: {
          app,
          utils,
          data: { ...exportado(0, 'data()', true), destaque: true },
          moeda: exportado(1, 'moeda()', false),
          slug: exportado(2, 'slug()', false),
          bundle: bundle([5.4, -1.6], 'só data()'),
        },
        ligacoes: {
          importa: { de: 'app', para: 'data', rotulo: 'import' },
          empacota: { de: 'utils', para: 'bundle', rotulo: '1 de 3' },
        },
        fluxos: [
          { rota: ['importa'], tipo: 'sinal', taxa: 0.9 },
          { rota: ['empacota'], taxa: 0.8 },
        ],
        metricas: [m('Exportadas', '3'), m('Importadas', '1'), m('No bundle', '1', 'bom')],
      },
    },
    {
      id: 'esm-estatico',
      titulo: 'Só funciona com ESM estático',
      narracao:
        'Para saber o que é usado sem executar o código, o bundler precisa de import e export estáticos. Com require(), o módulo é um objeto montado em runtime: o bundler não consegue provar que uma propriedade nunca é lida e mantém tudo. Misturar CommonJS com ESM, ou depender de uma biblioteca publicada só em CommonJS, desliga o tree-shaking daquele pedaço.',
      cena: {
        foco: 'ESM × CommonJS',
        entidades: {
          esm: { pos: [-4.6, -2.6], rotulo: 'import { }', sub: 'ESM', icone: 'arquivo', cor: 'verde' },
          cjs: { pos: [-4.6, 2.6], rotulo: 'require()', sub: 'CommonJS', icone: 'arquivo', cor: 'laranja' },
          bundleEsm: bundle([2.4, -2.6], '1 função'),
          bundleCjs: { ...bundle([2.4, 2.6], 'utils todo', 'laranja'), etiquetas: [{ texto: 'nada sai', tom: 'ruim' }] },
        },
        ligacoes: {
          sacode: { de: 'esm', para: 'bundleEsm', rotulo: 'sacode' },
          mantem: { de: 'cjs', para: 'bundleCjs', rotulo: 'mantém tudo' },
        },
        fluxos: [
          { rota: ['sacode'], taxa: 1 },
          { rota: ['mantem'], tipo: 'pesado', taxa: 0.8 },
        ],
        metricas: [m('Com ESM', '1 de 3', 'bom'), m('Com CommonJS', '3 de 3', 'ruim')],
      },
    },
    {
      id: 'efeitos-colaterais',
      titulo: 'Efeitos colaterais seguram código',
      narracao:
        'Um módulo que, só por ser importado, altera algo global (um polyfill, um CSS, um registro de componentes) não pode ser removido mesmo sem nenhum export usado. Na dúvida, o bundler mantém. O campo "sideEffects": false no package.json de uma biblioteca promete que os módulos dela são puros, e libera o bundler para descartar arquivos inteiros. Prometer errado quebra o app só em produção.',
      cena: {
        foco: 'sideEffects',
        entidades: {
          app: { ...app, pos: [-4.6, 0], sub: 'import' },
          registro: {
            pos: [0, 0],
            rotulo: 'registro.ts',
            sub: 'polyfill',
            icone: 'arquivo',
            cor: 'laranja',
            destaque: true,
            etiquetas: [{ texto: 'sem export usado', tom: 'alerta' }],
          },
          bundle: bundle([4.6, 0], 'mantido', 'laranja'),
          pacote: { pos: [0, 4], rotulo: 'package.json', sub: 'sideEffects', icone: 'arquivo', cor: 'neutro' },
        },
        ligacoes: {
          importa: { de: 'app', para: 'registro', rotulo: 'import' },
          fica: { de: 'registro', para: 'bundle', rotulo: 'fica' },
          promete: { de: 'pacote', para: 'bundle', rotulo: 'false', estilo: 'tracejada' },
        },
        fluxos: [
          { rota: ['importa', 'fica'], taxa: 0.8 },
          { rota: ['promete'], tipo: 'sinal', taxa: 0.6 },
        ],
        metricas: [m('Módulo puro', 'pode sair', 'bom'), m('Efeito global', 'fica', 'alerta')],
      },
    },
    {
      id: 'lodash',
      titulo: 'Por que lodash inteiro é um code smell',
      narracao:
        "import _ from 'lodash' puxa a biblioteca inteira, cerca de 70 kB minificados (25 kB com gzip), para usar duas funções: o pacote lodash é CommonJS e um objeto único, então não há o que sacudir. As saídas: lodash-es, que é ESM e sacode; importar por caminho (lodash/debounce); ou trocar pela API nativa, como structuredClone, Array.prototype.flat e Object.groupBy. Vale o mesmo para moment, pacotes de ícones e bibliotecas de componentes importadas por inteiro.",
      cena: {
        foco: 'Dependência pesada',
        entidades: {
          app: { ...app, pos: [-5, 0], sub: '2 funções' },
          lodash: { pos: [-0.6, 0], rotulo: 'lodash', sub: 'CommonJS', icone: 'caixa', cor: 'laranja', destaque: true },
          bundle: { ...bundle([3.8, 0], '~70 kB', 'laranja'), etiquetas: [{ texto: 'biblioteca inteira', tom: 'ruim' }] },
          lodashEs: { pos: [-0.6, 4.2], rotulo: 'lodash-es', sub: 'ESM', icone: 'caixa', cor: 'verde' },
        },
        ligacoes: {
          importa: { de: 'app', para: 'lodash', rotulo: 'import _' },
          tudo: { de: 'lodash', para: 'bundle', rotulo: 'tudo' },
          melhor: { de: 'app', para: 'lodashEs', rotulo: '{ debounce }', estilo: 'tracejada' },
        },
        fluxos: [
          { rota: ['importa', 'tudo'], tipo: 'pesado', taxa: 0.8 },
          { rota: ['melhor'], tipo: 'sinal', taxa: 0.6 },
        ],
        metricas: [m('Usado', '2 funções'), m('Enviado', '~70 kB', 'ruim'), m('Com lodash-es', 'só as 2', 'bom')],
      },
    },
    {
      id: 'analisar',
      titulo: 'Medir antes de cortar',
      narracao:
        'webpack-bundle-analyzer, rollup-plugin-visualizer (que funciona no Vite) e source-map-explorer desenham o bundle como um mapa de retângulos proporcionais ao tamanho. Em geral a surpresa é uma dependência pesada importada por inteiro ou duplicada em duas versões. Depois, ponha um limite de tamanho no CI, com size-limit por exemplo, para a regressão aparecer no pull request e não em produção.',
      cena: {
        foco: 'Análise do bundle',
        entidades: {
          analisador: { pos: [-5.2, -1.6], rotulo: 'Visualizer', sub: 'treemap', icone: 'regua', cor: 'azul' },
          relatorio,
          lodash: { ...pedaco(-2.2, 'lodash', '70 kB', 2, 'laranja'), destaque: true },
          react: pedaco(0, 'react-dom', '45 kB', 1.6, 'azul'),
          codigo: pedaco(2, 'app', '20 kB', 1.2, 'verde'),
          ci: { pos: [5.2, -1.6], rotulo: 'size-limit', sub: 'no CI', icone: 'cpu', cor: 'roxo', etiquetas: [{ texto: 'falha o PR', tom: 'bom' }] },
        },
        ligacoes: {
          mede: { de: 'analisador', para: 'relatorio', rotulo: 'mede' },
          limita: { de: 'relatorio', para: 'ci', rotulo: 'limite' },
        },
        fluxos: [
          { rota: ['mede'], tipo: 'sinal', taxa: 0.8 },
          { rota: ['limita'], taxa: 0.6 },
        ],
        metricas: [m('Maior peça', 'lodash', 'ruim'), m('Limite no CI', '150 kB'), m('Regressão', 'barrada no PR', 'bom')],
      },
    },
  ],
  fontes: [
    { titulo: 'Tree Shaking', url: 'https://webpack.js.org/guides/tree-shaking/', origem: 'webpack', tipo: 'documentacao', idioma: 'en', nota: 'ESM, sideEffects e o que impede a remoção de código.' },
    { titulo: 'Reduce JavaScript payloads with tree shaking', url: 'https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Um caso real: encontrar e remover código não usado.' },
    { titulo: 'Tree-shaking', url: 'https://rollupjs.org/introduction/#tree-shaking', origem: 'Rollup', tipo: 'documentacao', idioma: 'en', nota: 'A ferramenta que popularizou a técnica, explicando por que ESM permite.' },
    { titulo: 'lodash@4.17.21', url: 'https://bundlephobia.com/package/lodash@4.17.21', origem: 'Bundlephobia', tipo: 'documentacao', idioma: 'en', nota: 'Tamanho minificado e com gzip de qualquer pacote do npm.' },
    { titulo: 'webpack-bundle-analyzer', url: 'https://github.com/webpack/webpack-bundle-analyzer', origem: 'GitHub', tipo: 'documentacao', idioma: 'en', nota: 'Treemap interativo do bundle do webpack.' },
    { titulo: 'rollup-plugin-visualizer', url: 'https://github.com/btd/rollup-plugin-visualizer', origem: 'GitHub', tipo: 'documentacao', idioma: 'en', nota: 'O equivalente para Rollup, Rolldown e Vite.' },
    { titulo: 'Size Limit', url: 'https://github.com/ai/size-limit', origem: 'GitHub', tipo: 'documentacao', idioma: 'en', nota: 'Limite de tamanho no CI, que falha o build numa regressão.' },
  ],
};
