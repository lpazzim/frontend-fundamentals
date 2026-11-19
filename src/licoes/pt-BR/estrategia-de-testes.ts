import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * As camadas de teste e o que cada uma prova. Os tempos dos chips sao ordens
 * de grandeza tipicas, nao medicoes deste projeto (que usa Vitest e Playwright).
 */
const camada = (coluna: number, rotulo: string, sub: string, lado: number, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  pos: [coluna, 0],
  rotulo,
  sub,
  icone: 'camadas',
  cor,
  tamanho: [lado, lado],
});
const unitario = camada(-4.4, 'Unitário', 'muitos · ms', 2.6, 'verde');
const integracao = camada(0, 'Integração', 'alguns · s', 2, 'azul');
const e2e = camada(4, 'E2E', 'poucos', 1.4, 'laranja');

const vitest: EntidadeFonte = { pos: [-3.6, 0], rotulo: 'Vitest', sub: 'teste', icone: 'cpu', cor: 'roxo' };
const funcao: EntidadeFonte = { pos: [1.2, 0], rotulo: 'passo.ts', sub: 'função pura', icone: 'arquivo', cor: 'verde' };

const rtl: EntidadeFonte = { pos: [-5, 0], rotulo: 'Teste', sub: 'Testing Lib.', icone: 'cpu', cor: 'roxo' };
const formulario: EntidadeFonte = { tipo: 'placa', pos: [0, 0.4], rotulo: 'Formulário', sub: 'render real', icone: 'tela', cor: 'azul', tamanho: [6, 2.4] };
const POSICAO = [-1.9, 0, 1.9] as const;
const peca = (i: 0 | 1 | 2, rotulo: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(formulario.pos, POSICAO[i], 0),
  rotulo,
  cor: 'neutro',
  tamanho: [1.6, 1.6],
});
const msw: EntidadeFonte = { pos: [5.2, -1.6], rotulo: 'MSW', sub: 'rede falsa', icone: 'servidor', cor: 'neutro' };

const playwright: EntidadeFonte = { pos: [-5.4, 0], rotulo: 'Playwright', sub: 'browser real', icone: 'tela', cor: 'roxo' };
const appReal: EntidadeFonte = { pos: [-0.8, 0], rotulo: 'App', sub: 'build real', icone: 'caixa', cor: 'amarelo' };
const api: EntidadeFonte = { pos: [3.8, 0], rotulo: 'API', sub: 'staging', icone: 'servidor', cor: 'azul' };

const componente: EntidadeFonte = { pos: [0, 0], rotulo: 'Componente', sub: 'Menu', icone: 'caixa', cor: 'amarelo' };
const fragil: EntidadeFonte = { pos: [-4.6, -2.6], rotulo: 'state.aberto', sub: 'por dentro', icone: 'arquivo', cor: 'laranja' };
const estavel: EntidadeFonte = { pos: [-4.6, 2.6], rotulo: 'getByRole', sub: 'acessível', icone: 'arquivo', cor: 'verde' };

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const estrategiaDeTestes: LicaoFonte = {
  slug: 'estrategia-de-testes',
  modulo: 'qualidade',
  titulo: 'Estratégia de testes no frontend',
  resumo:
    'Unitário, integração e E2E: o que cada camada prova, quanto custa, e por que testar o comportamento visível separa teste útil de teste frágil.',
  dificuldade: 'intermediario',
  minutos: 10,
  objetivos: [
    { texto: 'A pirâmide: custo e confiança por camada', passo: 1 },
    { texto: 'O que um teste unitário cobre bem', passo: 2 },
    { texto: 'Integração: o melhor retorno no frontend', passo: 3 },
    { texto: 'E2E só para os fluxos críticos', passo: 4 },
    { texto: 'Testar comportamento, não implementação', passo: 5 },
  ],
  passos: [
    {
      id: 'piramide',
      titulo: 'A pirâmide: muitos rápidos, poucos lentos',
      narracao:
        'A pirâmide de testes, de Mike Cohn e popularizada por Martin Fowler, diz: muitos testes pequenos e rápidos na base, menos testes de integração no meio, poucos de ponta a ponta no topo. Quanto mais alto, mais confiança cada teste dá sobre o produto real, e mais lento, caro e instável ele é de manter.',
      cena: {
        foco: 'Pirâmide',
        entidades: {
          unitario: { ...unitario, etiquetas: [{ texto: 'barato', tom: 'bom' }] },
          integracao,
          e2e: { ...e2e, etiquetas: [{ texto: 'caro', tom: 'alerta' }] },
        },
        metricas: [m('Unitário', 'milissegundos', 'bom'), m('Integração', 'segundos'), m('E2E', 'minutos', 'alerta')],
        nota: 'confiança sobe, velocidade desce',
      },
    },
    {
      id: 'unitario',
      titulo: 'Unitário: lógica pura',
      narracao:
        'O teste unitário cobre uma função sem DOM e sem rede: formatar um preço, validar um formulário, calcular o próximo passo. Roda em milissegundos e aponta exatamente o que quebrou. Neste projeto, o schema das lições, a navegação entre passos e o detector de legibilidade das cenas são testados assim, com Vitest. O que ele não prova é se as peças funcionam juntas.',
      cena: {
        foco: 'Unitário',
        entidades: {
          vitest,
          funcao: { ...funcao, destaque: true, etiquetas: [{ texto: 'sem DOM', tom: 'bom' }] },
        },
        ligacoes: { chama: { de: 'vitest', para: 'funcao', rotulo: 'expect', setas: 'ambas' } },
        fluxos: [{ rota: ['chama'], tipo: 'sinal', taxa: 2, volta: true }],
        metricas: [m('Roda em', 'ms', 'bom'), m('Quebrou?', 'aponta a linha', 'bom'), m('Não prova', 'a integração', 'alerta')],
      },
    },
    {
      id: 'integracao',
      titulo: 'Integração: componentes e hooks juntos',
      narracao:
        'No frontend, a camada que mais costuma render é a de integração: renderizar um componente com seus filhos, hooks e Context reais, e simular só a fronteira, a rede (com MSW, por exemplo). Kent C. Dodds chama esse formato de troféu de testes: análise estática na base (TypeScript, ESLint), poucos unitários, o volume maior em integração e alguns E2E no topo.',
      cena: {
        foco: 'Integração',
        entidades: {
          rtl,
          formulario: { ...formulario, destaque: true },
          hook: peca(0, 'useForm'),
          contexto: peca(1, 'Context'),
          filhos: peca(2, 'Campo'),
          msw,
        },
        ligacoes: {
          renderiza: { de: 'rtl', para: 'formulario', rotulo: 'render' },
          rede: { de: 'formulario', para: 'msw', rotulo: 'fetch', setas: 'ambas' },
        },
        fluxos: [
          { rota: ['renderiza'], taxa: 0.9 },
          { rota: ['rede'], taxa: 0.6, volta: true },
        ],
        metricas: [m('Roda em', 'segundos'), m('Prova', 'peças juntas', 'bom'), m('Simula', 'só a rede')],
      },
    },
    {
      id: 'e2e',
      titulo: 'E2E: o caminho de um usuário de verdade',
      narracao:
        'Playwright e Cypress abrem um browser real e percorrem o app como uma pessoa: navegar, clicar, digitar, conferir a tela. Pegam o que nenhuma outra camada pega (roteamento, build, integração com o backend), mas são lentos e sensíveis a tempo. Use para os fluxos críticos, como login e checkout, e espere por estados, nunca por sleep: os testes deste projeto esperam o atributo data-atalhos.',
      cena: {
        foco: 'E2E',
        entidades: {
          playwright: { ...playwright, destaque: true },
          app: appReal,
          api: { ...api, etiquetas: [{ texto: 'pode oscilar', tom: 'alerta' }] },
        },
        ligacoes: {
          usa: { de: 'playwright', para: 'app', rotulo: 'clica, digita', setas: 'ambas' },
          chama: { de: 'app', para: 'api', rotulo: 'fetch', setas: 'ambas' },
        },
        fluxos: [{ rota: ['usa', 'chama'], tipo: 'lento', taxa: 0.45, volta: true }],
        metricas: [m('Roda em', 'minutos', 'alerta'), m('Prova', 'o fluxo todo', 'bom'), m('Risco', 'instabilidade', 'alerta')],
      },
    },
    {
      id: 'comportamento',
      titulo: 'Testar o que o usuário vê',
      narracao:
        'O princípio da Testing Library: quanto mais o teste se parece com o uso real, mais confiança ele dá. Em vez de ler o state interno ou procurar por className, busque como uma pessoa busca: getByRole("button", { name: "Salvar" }), getByLabelText("E-mail"). Um teste assim sobrevive a refatorações e só quebra quando o comportamento quebra.',
      cena: {
        foco: 'Comportamento',
        entidades: {
          componente,
          fragil: { ...fragil, apagado: true },
          estavel: { ...estavel, destaque: true },
        },
        ligacoes: {
          espia: { de: 'fragil', para: 'componente', rotulo: 'lê por dentro', estilo: 'tracejada' },
          consulta: { de: 'estavel', para: 'componente', rotulo: 'papel e nome' },
        },
        fluxos: [{ rota: ['consulta'], tipo: 'sinal', taxa: 1, volta: true }],
        metricas: [m('Consulta por', 'papel e nome', 'bom'), m('Sobrevive a', 'refatoração', 'bom')],
      },
    },
    {
      id: 'frageis',
      titulo: 'O que torna um teste frágil',
      narracao:
        'Troque useState por useReducer sem mudar nada na tela: o teste que lia o state quebra (o X vermelho), o que consultava por papel continua verde. Testes acoplados à implementação geram falsos alarmes que ensinam o time a ignorar o CI; mockar demais faz o contrário, o teste passa e o app quebra. Bônus: consultar por papel e nome acessível também testa a acessibilidade, o tema da próxima lição.',
      cena: {
        foco: 'Refatoração',
        entidades: {
          componente: { ...componente, destaque: true, etiquetas: [{ texto: 'useState → useReducer' }] },
          fragil: { ...fragil, etiquetas: [{ texto: 'quebrou', tom: 'ruim' }] },
          estavel: { ...estavel, etiquetas: [{ texto: 'passou', tom: 'bom' }] },
        },
        ligacoes: {
          espia: { de: 'fragil', para: 'componente', rotulo: 'lê por dentro', estilo: 'erro' },
          consulta: { de: 'estavel', para: 'componente', rotulo: 'papel e nome' },
        },
        fluxos: [
          { rota: ['espia'], tipo: 'sinal', taxa: 0.8, falha: 1 },
          { rota: ['consulta'], tipo: 'sinal', taxa: 0.8, volta: true },
        ],
        metricas: [m('Tela', 'igual'), m('Teste de implementação', 'quebrou', 'ruim'), m('Teste de comportamento', 'passou', 'bom')],
      },
    },
  ],
  fontes: [
    { titulo: 'The Practical Test Pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html', origem: 'martinfowler.com (Ham Vocke)', tipo: 'artigo', idioma: 'en', nota: 'A pirâmide explicada camada por camada, com exemplos.' },
    { titulo: 'The Testing Trophy and Testing Classifications', url: 'https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications', origem: 'Kent C. Dodds', tipo: 'artigo', idioma: 'en', nota: 'Por que integração dá o melhor retorno no frontend.' },
    { titulo: 'Guiding Principles', url: 'https://testing-library.com/docs/guiding-principles', origem: 'Testing Library', tipo: 'documentacao', idioma: 'en', nota: 'Testar o software do jeito que ele é usado.' },
    { titulo: 'About Queries: priority', url: 'https://testing-library.com/docs/queries/about/#priority', origem: 'Testing Library', tipo: 'documentacao', idioma: 'en', nota: 'Que consulta usar primeiro: getByRole, getByLabelText...' },
    { titulo: 'Testing Implementation Details', url: 'https://kentcdodds.com/blog/testing-implementation-details', origem: 'Kent C. Dodds', tipo: 'artigo', idioma: 'en', nota: 'Falsos negativos e falsos positivos de testes acoplados.' },
    { titulo: 'Best Practices', url: 'https://playwright.dev/docs/best-practices', origem: 'Playwright', tipo: 'documentacao', idioma: 'en', nota: 'Locators por papel, esperas automáticas e isolamento de testes.' },
    { titulo: 'Mock Service Worker', url: 'https://mswjs.io/docs/', origem: 'MSW', tipo: 'documentacao', idioma: 'en', nota: 'Simular a rede no nível do fetch, igual em teste e no browser.' },
  ],
};
