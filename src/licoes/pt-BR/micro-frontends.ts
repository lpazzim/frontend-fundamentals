import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Um app de loja com tres dominios (catalogo, carrinho, conta). O shell e uma
 * placa com uma fatia por time; os times entram e saem de cena conforme o
 * passo fala de organizacao (times) ou de runtime (CDNs e dependencias).
 */
const time = (linha: number, rotulo: string): EntidadeFonte => ({
  pos: [-5.4, linha],
  rotulo,
  sub: 'time',
  icone: 'usuario',
  cor: 'neutro',
});
const timeCatalogo = time(-3, 'Catálogo');
const timeCarrinho = time(0.8, 'Carrinho');
const timeConta = time(3.6, 'Conta');

const monolito: EntidadeFonte = { pos: [0, 0], rotulo: 'App', sub: 'um repo', icone: 'caixa', cor: 'laranja' };
const deploy: EntidadeFonte = { pos: [4.6, 0], rotulo: 'Deploy', sub: 'um só', icone: 'servidor', cor: 'azul' };

const shell: EntidadeFonte = { tipo: 'placa', pos: [2, 0.4], rotulo: 'Shell', sub: 'compõe a tela', icone: 'tela', cor: 'amarelo', tamanho: [6, 2.4] };
const POSICAO = [-1.9, 0, 1.9] as const;
const fatia = (i: 0 | 1 | 2, rotulo: string, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(shell.pos, POSICAO[i], 0),
  rotulo,
  cor,
  tamanho: [1.6, 1.6],
});
const catalogo = fatia(0, 'catálogo', 'verde');
const carrinho = fatia(1, 'carrinho', 'laranja');
const conta = fatia(2, 'conta', 'azul');

const remoto = (linha: number, sub: string): EntidadeFonte => ({
  pos: [-5.4, linha],
  rotulo: 'CDN',
  sub,
  icone: 'globo',
  cor: 'verde',
});
const react: EntidadeFonte = { pos: [6.6, -2.6], rotulo: 'React', sub: 'singleton', icone: 'camadas', cor: 'azul' };

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const microFrontends: LicaoFonte = {
  slug: 'micro-frontends',
  modulo: 'ferramentas',
  titulo: 'Micro-frontends e Module Federation',
  resumo:
    'Dividir um frontend grande em partes com deploy independente: quando compensa, como o Module Federation carrega código de outro deploy e quanto isso custa.',
  dificuldade: 'avancado',
  minutos: 9,
  objetivos: [
    { texto: 'O gargalo de muitos times num deploy só', passo: 1 },
    { texto: 'Fatiar por domínio, com deploy próprio', passo: 2 },
    { texto: 'Module Federation: import de outro build', passo: 3 },
    { texto: 'Dependências duplicadas e singleton', passo: 4 },
    { texto: 'Quando o custo compensa', passo: 5 },
  ],
  passos: [
    {
      id: 'monolito',
      titulo: 'Um frontend, muitos times',
      narracao:
        'Num monolito de frontend, todos os times editam o mesmo repositório e publicam no mesmo deploy. Com poucos times, é o arranjo mais simples possível. Com dezenas, o build fica lento, o erro de um time segura o release de todos e ninguém atualiza uma dependência sem coordenar com o resto da empresa.',
      cena: {
        foco: 'Monolito',
        entidades: {
          timeCatalogo,
          timeCarrinho,
          timeConta,
          app: { ...monolito, destaque: true, etiquetas: [{ texto: 'um release só', tom: 'alerta' }] },
          deploy,
        },
        ligacoes: {
          t1: { de: 'timeCatalogo', para: 'app' },
          t2: { de: 'timeCarrinho', para: 'app' },
          t3: { de: 'timeConta', para: 'app' },
          publica: { de: 'app', para: 'deploy', rotulo: 'release' },
        },
        fluxos: [
          { rota: ['t1', 'publica'], taxa: 0.5 },
          { rota: ['t2', 'publica'], taxa: 0.5 },
          { rota: ['t3', 'publica'], taxa: 0.5 },
        ],
        metricas: [m('Deploys', '1 para todos', 'alerta'), m('Build', 'cresce com o app', 'alerta')],
      },
    },
    {
      id: 'fatiar',
      titulo: 'Micro-frontends: fatias com deploy próprio',
      narracao:
        'A ideia é dividir a aplicação por domínio de negócio (catálogo, carrinho, conta), cada fatia com repositório, pipeline e deploy próprios, e um app hospedeiro, o shell, que as compõe na tela. Cada time publica quando quiser, sem esperar os outros. Repare: é uma solução para um problema de organização, não de tecnologia.',
      cena: {
        foco: 'Fatias',
        entidades: {
          timeCatalogo,
          timeCarrinho,
          timeConta,
          shell: { ...shell, destaque: true },
          catalogo,
          carrinho,
          conta,
        },
        ligacoes: {
          t1: { de: 'timeCatalogo', para: 'catalogo', rotulo: 'deploy' },
          t2: { de: 'timeCarrinho', para: 'carrinho', rotulo: 'deploy' },
          t3: { de: 'timeConta', para: 'conta', rotulo: 'deploy' },
        },
        fluxos: [
          { rota: ['t1'], taxa: 0.9 },
          { rota: ['t2'], taxa: 0.6 },
          { rota: ['t3'], taxa: 0.4 },
        ],
        metricas: [m('Deploys', '3 independentes', 'bom'), m('Cada time', 'no próprio ritmo', 'bom')],
      },
    },
    {
      id: 'federation',
      titulo: 'Module Federation: importar código de outro deploy',
      narracao:
        "O Module Federation, criado no webpack 5 e hoje disponível também em Rspack e Vite pelo projeto module-federation.io, deixa o shell carregar em runtime um módulo exposto por outro build: import('carrinho/Carrinho') busca o remoteEntry.js publicado pelo time do carrinho. Uma versão nova do carrinho entra no ar sem rebuild do shell.",
      cena: {
        foco: 'Module Federation',
        entidades: {
          cdn: { ...remoto(1.2, 'do carrinho'), etiquetas: [{ texto: 'v2.3 no ar', tom: 'bom' }] },
          shell,
          catalogo,
          carrinho: { ...carrinho, destaque: true },
          conta,
        },
        ligacoes: {
          remota: { de: 'carrinho', para: 'cdn', rotulo: 'remoteEntry.js', setas: 'ambas' },
        },
        fluxos: [{ rota: ['remota'], tipo: 'lento', taxa: 0.6, volta: true }],
        metricas: [m('Carregado', 'em runtime'), m('Rebuild do shell', 'não precisa', 'bom')],
        nota: "import('carrinho/Carrinho')",
      },
    },
    {
      id: 'duplicacao',
      titulo: 'O problema das dependências duplicadas',
      narracao:
        'Se cada fatia traz a própria cópia do React, o usuário baixa o React três vezes, e duas instâncias na mesma página quebram hooks e Context. A configuração shared, com singleton e uma faixa de versões aceitas, faz todas as fatias usarem uma cópia só. Mas isso cria um contrato: todo remote precisa funcionar com a versão que o shell carregar.',
      cena: {
        foco: 'Dependências',
        entidades: {
          shell,
          catalogo: { ...catalogo, sub: 'React' },
          carrinho: { ...carrinho, sub: 'React' },
          conta: { ...conta, sub: 'React' },
          react: { ...react, destaque: true, etiquetas: [{ texto: 'uma cópia', tom: 'bom' }] },
        },
        ligacoes: { compartilha: { de: 'react', para: 'shell', rotulo: 'shared' } },
        fluxos: [{ rota: ['compartilha'], tipo: 'sinal', taxa: 0.9 }],
        metricas: [m('Sem shared', '3 Reacts', 'ruim'), m('Com singleton', '1 React', 'bom'), m('Contrato', 'versão compatível', 'alerta')],
        nota: "shared: { react: { singleton: true } }",
      },
    },
    {
      id: 'quando',
      titulo: 'Quando o custo compensa',
      narracao:
        'Cada fatia passa a ser uma API pública: props, eventos e rotas trocados entre times precisam de versão e de compatibilidade. Somam-se o design system compartilhado, a observabilidade distribuída e um desempenho que tende a piorar. Compensa quando muitos times precisam publicar com autonomia e o custo de coordenar já é maior que o desta infraestrutura. Para um ou dois times, um monorepo bem modularizado resolve.',
      cena: {
        foco: 'Decisão',
        entidades: {
          monorepo: {
            pos: [-3.4, 0],
            rotulo: 'Monorepo',
            sub: 'poucos times',
            icone: 'caixa',
            cor: 'verde',
            etiquetas: [{ texto: 'simples', tom: 'bom' }, { texto: 'um deploy', tom: 'alerta' }],
          },
          mfe: {
            pos: [3.4, 0],
            rotulo: 'MFE',
            sub: 'muitos times',
            icone: 'camadas',
            cor: 'laranja',
            etiquetas: [{ texto: 'autonomia', tom: 'bom' }, { texto: 'contratos', tom: 'alerta' }],
          },
        },
        metricas: [],
      },
    },
  ],
  fontes: [
    { titulo: 'Micro Frontends', url: 'https://martinfowler.com/articles/micro-frontends.html', origem: 'martinfowler.com (Cam Jackson)', tipo: 'artigo', idioma: 'en', nota: 'Benefícios, formas de integração e custos, com um exemplo completo.' },
    { titulo: 'Module Federation', url: 'https://webpack.js.org/concepts/module-federation/', origem: 'webpack', tipo: 'documentacao', idioma: 'en', nota: 'Host, remote, exposes e shared no webpack 5.' },
    { titulo: 'Module Federation', url: 'https://module-federation.io/', origem: 'module-federation.io', tipo: 'documentacao', idioma: 'en', nota: 'A versão atual do projeto, para Rspack, webpack e Vite.' },
    { titulo: 'shared', url: 'https://module-federation.io/configure/shared', origem: 'module-federation.io', tipo: 'documentacao', idioma: 'en', nota: 'singleton, requiredVersion e como evitar cópias duplicadas.' },
    { titulo: 'Micro Frontends: extending the microservice idea to frontend development', url: 'https://micro-frontends.org/', origem: 'Michael Geers', tipo: 'guia', idioma: 'en', nota: 'Princípios e técnicas de composição, de iframes a Web Components.' },
  ],
};
