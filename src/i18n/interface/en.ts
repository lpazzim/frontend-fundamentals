import type { TextosDaInterface } from './pt-BR';

/** Name, in English, of the language of a cited source. */
const NOME_DO_IDIOMA: Record<string, string> = {
  en: 'English',
  'pt-BR': 'Portuguese',
  es: 'Spanish',
};

/**
 * Interface texts in English. The type comes from the Portuguese dictionary:
 * a missing key here does not compile.
 */
export const en: TextosDaInterface = {
  idioma: {
    codigo: 'en',
    sigla: 'EN',
    nome: 'English',
    endonimo: 'English',
    seletor: 'Language',
    trocarPara: (endonimo: string) => `Switch language to ${endonimo}`,
  },

  app: {
    nome: 'Render Lab',
  },

  topo: {
    abrirCurso: 'Open the course',
    marca: 'Render Lab, home',
    secoes: 'Sections',
    aprender: 'Learn',
    pratica: 'Practice',
    emBreve: 'Coming soon',
    laboratorio: 'Lab',
    resumos: 'Overview',
    buscarPlaceholder: 'Search lessons and concepts…',
    buscarRotulo: 'Search lessons',
    paraTemaClaro: 'Switch to light theme',
    paraTemaEscuro: 'Switch to dark theme',
    temaClaro: 'Light theme',
    temaEscuro: 'Dark theme',
    inspiradoEm: 'inspired by',
  },

  naoEncontrada: {
    pagina: 'Page not found',
    licao: 'Lesson not found',
    semSlug: 'There is no lesson with the slug',
    voltarAoInicio: 'Back to home',
  },

  menu: {
    licoes: 'Lessons',
    curso: 'Course',
    totalDeLicoes: (n: number) => (n === 1 ? '1 lesson' : `${n} lessons`),
    fecharCurso: 'Close the course',
    nenhumaLicao: (termo: string) => `No lessons for “${termo}”.`,
    progresso: 'Progress',
  },

  modulos: {
    renderizacao: 'Rendering',
    execucao: 'Execution',
    entrega: 'Delivery',
    arquitetura: 'Architecture',
    ferramentas: 'Tooling',
    qualidade: 'Quality',
  },

  dificuldades: {
    iniciante: 'Beginner',
    intermediario: 'Intermediate',
    avancado: 'Advanced',
  },

  inicio: {
    titulo: 'What the browser does under the hood',
    pitch:
      'Interactive lessons on frontend fundamentals. Each lesson is a scene that moves forward step by step, and the current step lives in the URL.',
  },

  licao: {
    licaoDe: (atual: number, total: number) => `Lesson ${atual} of ${total}`,
    minutos: (n: number) => `${n} min`,
    passos: (n: number) => (n === 1 ? '1 step' : `${n} steps`),
    passoDe: (atual: number, total: number) => `Step ${atual} of ${total}`,
    passoCurto: (atual: number, total: number) => `Step ${atual} / ${total}`,
    fidelidade: {
      medido: { rotulo: 'measured', titulo: 'The panel numbers are measured in your browser' },
      modelo: { rotulo: 'model', titulo: 'Animated model: it explains, it does not measure' },
    },
    passosDaLicao: 'Lesson steps',
    nestaLicao: 'In this lesson',
    naCena: 'In the scene',
    voltar: 'Back',
    fim: 'End of lesson',
    proximo: (titulo: string) => `Next: ${titulo}`,
    atalhos: { passo: 'step', repetir: 'replay', espaco: 'Space', pausar: 'pause' },
    vaiAprender: 'You will learn',
    carregando: 'Loading the lesson…',
    erroAoCarregar: 'Could not load the lesson. Check your connection and try again.',
    tentarDeNovo: 'Try again',
  },

  fontes: {
    titulo: 'Further reading',
    rotulo: 'Sources to study this lesson',
    total: (n: number) => (n === 1 ? '1 source' : `${n} sources`),
    novaAba: '(opens in a new tab)',
    idiomaDoMaterial: (codigo: string) => `Material in ${NOME_DO_IDIOMA[codigo] ?? codigo}`,
    tipos: {
      documentacao: 'documentation',
      artigo: 'article',
      especificacao: 'specification',
      livro: 'book',
      palestra: 'talk',
      guia: 'guide',
    },
  },

  palco: {
    rotulo: 'Lesson stage',
    cena: (foco: string) => `Step scene: ${foco}`,
    repetir: 'Replay',
    repetirRotulo: 'Replay the transition',
    repetirTitulo: 'Replay the transition (R)',
    pausar: 'Pause',
    pausarRotulo: 'Pause the scene',
    pausarTitulo: 'Pause (Space)',
    continuar: 'Resume',
    continuarRotulo: 'Resume the scene',
    continuarTitulo: 'Resume (Space)',
    legenda: 'Legend',
    pacotes: {
      requisicao: 'request',
      sinal: 'signal',
      pesado: 'heavy load',
      lento: 'slow',
      resposta: 'response',
      falha: 'failure',
    },
  },

  laboratorio: {
    rotulo: 'Rendering cost lab',
    elemento: 'element',
    mudar: 'Change:',
    mudarRotulo: (propriedade: string) => `Change ${propriedade}`,
  },

  painel: {
    rotulo: 'Step metrics',
    titulo: 'Last interaction',
    mudou: 'Changed',
    reexecutou: 'Re-ran',
    inferido: 'inferred',
    medido: 'measured',
    layoutShifts: 'Layout shifts',
    shifts: (quantos: number, valor: string) => `${quantos} (value ${valor})`,
    geometriaMudou: 'Geometry changed',
    sim: 'yes',
    nao: 'no',
    layoutForcado: 'Forced layout',
    emFoco: 'In focus',
    nota: 'The browser does not announce “layout ran”: “inferred” comes from the changed property; “measured” comes from the PerformanceObserver and the geometry.',
  },

  estagios: {
    dom: 'DOM',
    cssom: 'CSSOM',
    'render-tree': 'Render tree',
    layout: 'Layout',
    paint: 'Paint',
    composite: 'Composite',
  },
};
