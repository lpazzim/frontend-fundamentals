import type { EntidadeFonte, LicaoFonte, LigacaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Codigo que a licao acompanha:
 *   console.log('A'); setTimeout(() => log('B'), 0);
 *   Promise.resolve().then(() => log('C')); console.log('D');
 * Saida real: A D C B.
 *
 * Os callbacks sao cartoes: nascem na fila onde o browser os poe e SE MOVEM
 * para a call stack quando o event loop os escolhe. E a animacao de movimento
 * do motor contando a historia.
 */
// Posicoes em [coluna, linha] direto: as filas ficam a direita da pilha (uma acima, outra
// abaixo), o render a esquerda. Assim nenhuma ligacao cruza a pilula de outra peca.
const pilha: EntidadeFonte = { tipo: 'placa', pos: [0, 0], rotulo: 'Call stack', icone: 'camadas', cor: 'verde', tamanho: [2.2, 2.2] };
const micro: EntidadeFonte = { tipo: 'placa', pos: [5, -1.5], rotulo: 'Microtasks', icone: 'raio', cor: 'roxo', tamanho: [3.6, 1.8] };
const macro: EntidadeFonte = { tipo: 'placa', pos: [5, 2.4], rotulo: 'Macrotasks', icone: 'relogio', cor: 'laranja', tamanho: [3.6, 1.8] };
const render: EntidadeFonte = { pos: [-4.4, 0], rotulo: 'Render', sub: 'entre tarefas', icone: 'pincel', cor: 'azul' };

const cartao = (pos: EntidadeFonte['pos'], rotulo: string, cor: EntidadeFonte['cor']): EntidadeFonte => ({
  tipo: 'cartao',
  pos,
  rotulo,
  cor,
});
const naPilha = sobre(pilha.pos);
const script = cartao(naPilha, 'script', 'neutro');
const thenC = (pos = sobre(micro.pos, -0.9)) => cartao(pos, "then → 'C'", 'roxo');
const timerB = (pos = sobre(macro.pos, -0.9)) => cartao(pos, "timer → 'B'", 'laranja');

const agenda = (para: 'micro' | 'macro', rotulo: string): LigacaoFonte => ({ de: 'pilha', para, rotulo, estilo: 'tracejada' });
const escolhe = (de: 'micro' | 'macro', rotulo: string): LigacaoFonte => ({ de, para: 'pilha', rotulo });

function metricas(saida: string, micros: number, macros: number) {
  return [
    { rotulo: 'Saída', valor: saida },
    { rotulo: 'Microtasks', valor: String(micros) },
    { rotulo: 'Macrotasks', valor: String(macros) },
  ];
}

export const eventLoop: LicaoFonte = {
  slug: 'event-loop',
  modulo: 'execucao',
  titulo: 'O event loop',
  resumo:
    'Call stack, microtasks, macrotasks e a janela de render: por que um Promise.then roda antes de um setTimeout de zero.',
  dificuldade: 'intermediario',
  minutos: 10,
  objetivos: [
    { texto: 'Pilha, fila de macrotasks e fila de microtasks', passo: 1 },
    { texto: 'Para onde vão setTimeout e Promise.then', passo: 3 },
    { texto: 'Por que as microtasks rodam todas de uma vez', passo: 4 },
    { texto: 'Onde o render cabe no ciclo', passo: 5 },
    { texto: 'Prever a ordem de saída de um trecho assíncrono', passo: 6 },
  ],
  passos: [
    {
      id: 'pilha-e-filas',
      titulo: 'Uma pilha, duas filas e um render',
      narracao:
        'O JavaScript do browser roda numa única thread. O que está executando agora fica na call stack; o que espera a vez fica numa de duas filas: microtasks (promises) ou macrotasks (timers, eventos). Entre uma macrotask e outra, o browser pode renderizar. Vamos acompanhar um script com console.log, setTimeout e Promise.then.',
      cena: {
        foco: 'Call stack',
        entidades: { pilha: { ...pilha, destaque: true }, micro, macro, render, script },
        metricas: metricas('—', 0, 0),
      },
    },
    {
      id: 'settimeout',
      titulo: 'setTimeout manda o callback para as macrotasks',
      narracao:
        'O script imprime A e chega no setTimeout com zero de atraso. O browser não executa o callback agora: agenda, e o callback vai para a fila de macrotasks. Zero milissegundo quer dizer "o quanto antes, mas depois do que já está rodando".',
      cena: {
        foco: 'Macrotasks',
        entidades: { pilha, micro, macro: { ...macro, destaque: true }, render, script, 'timer-b': timerB() },
        ligacoes: { agenda: agenda('macro', 'setTimeout') },
        fluxos: [{ rota: ['agenda'], tipo: 'sinal', taxa: 0.9 }],
        metricas: metricas('A', 0, 1),
      },
    },
    {
      id: 'promise',
      titulo: 'Promise.then manda o callback para as microtasks',
      narracao:
        'Em seguida o script registra um Promise.then. Esse callback não entra na fila dos timers: entra na fila de microtasks, que tem prioridade. O script ainda não terminou, então nada disso executa ainda; o último console.log imprime D.',
      cena: {
        foco: 'Microtasks',
        entidades: { pilha, micro: { ...micro, destaque: true }, macro, render, script, 'timer-b': timerB(), 'then-c': thenC() },
        ligacoes: { agenda: agenda('micro', '.then()') },
        fluxos: [{ rota: ['agenda'], tipo: 'sinal', taxa: 0.9 }],
        metricas: metricas('A D', 1, 1),
      },
    },
    {
      id: 'microtasks-primeiro',
      titulo: 'A pilha esvazia e as microtasks rodam todas',
      narracao:
        'O script termina e sai da call stack. Antes de qualquer macrotask, o event loop esvazia a fila de microtasks inteira: o then sobe para a pilha e imprime C. Se esse then enfileirasse outra microtask, ela também rodaria antes do timer. É por isso que um laço de promises pode travar a página.',
      cena: {
        foco: 'Call stack',
        entidades: {
          pilha: { ...pilha, destaque: true },
          micro,
          macro,
          render,
          'timer-b': timerB(),
          'then-c': thenC(naPilha),
        },
        ligacoes: { escolhe: escolhe('micro', 'esvazia tudo') },
        fluxos: [{ rota: ['escolhe'], taxa: 1.2 }],
        metricas: metricas('A D C', 0, 1),
      },
    },
    {
      id: 'render',
      titulo: 'Com as microtasks vazias, o browser pode renderizar',
      narracao:
        'Fila de microtasks vazia: agora o browser tem a chance de renderizar um frame (não é obrigatório a cada volta; ele decide pela taxa de atualização da tela). Se a stack nunca esvazia, esta etapa nunca chega. É a ponte com a lição de reflow: o render só acontece entre tarefas.',
      cena: {
        foco: 'Render',
        entidades: {
          pilha,
          micro: { ...micro, apagado: true },
          macro,
          render: { ...render, destaque: true, etiquetas: [{ texto: 'style → layout → paint' }] },
          'timer-b': timerB(),
        },
        ligacoes: { frame: { de: 'pilha', para: 'render', rotulo: 'pilha vazia' } },
        fluxos: [{ rota: ['frame'], taxa: 1.2 }],
        metricas: metricas('A D C', 0, 1),
      },
    },
    {
      id: 'macrotask',
      titulo: 'Só então uma macrotask entra na pilha',
      narracao:
        'Por fim o event loop pega UMA macrotask: o callback do timer sobe para a pilha e imprime B. A ordem final é A, D, C, B: código síncrono, depois todas as microtasks, depois a próxima macrotask. Depois dela o ciclo recomeça: microtasks, talvez render, próxima macrotask.',
      cena: {
        foco: 'Call stack',
        entidades: { pilha: { ...pilha, destaque: true }, micro, macro, render, 'timer-b': timerB(naPilha) },
        ligacoes: { escolhe: escolhe('macro', '1 por volta') },
        fluxos: [{ rota: ['escolhe'], taxa: 1 }],
        metricas: metricas('A D C B', 0, 0),
        nota: 'saída final: A D C B',
      },
    },
  ],
  fontes: [
    { titulo: 'Tasks, microtasks, queues and schedules', url: 'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/', origem: 'Jake Archibald', tipo: 'artigo', idioma: 'en', nota: 'A ordem exata de tasks e microtasks, com exemplos passo a passo.' },
    { titulo: 'In The Loop (JSConf.Asia)', url: 'https://www.youtube.com/watch?v=cCOL7MC4Pl0', origem: 'JSConf', tipo: 'palestra', idioma: 'en', nota: 'Event loop, requestAnimationFrame e render, explicados ao vivo.' },
    { titulo: 'Using microtasks in JavaScript with queueMicrotask()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide', origem: 'MDN Web Docs', tipo: 'guia', idioma: 'en', nota: 'Quando enfileirar uma microtask e o risco de travar a página.' },
    { titulo: 'HTML Standard: event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops', origem: 'WHATWG', tipo: 'especificacao', idioma: 'en', nota: 'A definição normativa de tarefas, microtasks e da etapa de renderização.' },
    { titulo: 'Optimize long tasks', url: 'https://web.dev/articles/optimize-long-tasks', origem: 'web.dev', tipo: 'artigo', idioma: 'en', nota: 'Como quebrar tarefas longas para o browser conseguir responder.' },
  ],
};
