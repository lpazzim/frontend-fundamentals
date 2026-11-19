import type { Dificuldade, Estagio, Modulo, TipoDeFonte, TipoDePacote } from '../../schema/licao';

/**
 * Textos da interface em portugues do Brasil. E o dicionario de referencia: o
 * tipo `TextosDaInterface` sai dele, e todo outro idioma precisa preencher as
 * mesmas chaves (o TypeScript recusa um dicionario incompleto).
 *
 * Frases com numeros ou nomes sao funcoes, e nao concatenacao no componente:
 * cada idioma decide a ordem das palavras e o plural.
 */

/** Nome, neste idioma, do idioma de um material citado nas fontes. */
const NOME_DO_IDIOMA: Record<string, string> = {
  en: 'inglês',
  'pt-BR': 'português',
  es: 'espanhol',
};

export const ptBR = {
  idioma: {
    codigo: 'pt-BR',
    sigla: 'PT',
    nome: 'português do Brasil',
    /** Como o idioma se chama nele mesmo: o seletor mostra cada opcao assim. */
    endonimo: 'Português',
    seletor: 'Idioma',
    trocarPara: (endonimo: string) => `Mudar o idioma para ${endonimo}`,
  },

  app: {
    nome: 'Render Lab',
  },

  topo: {
    abrirCurso: 'Abrir o curso',
    marca: 'Render Lab, início',
    secoes: 'Seções',
    aprender: 'Aprender',
    pratica: 'Prática',
    emBreve: 'Em breve',
    laboratorio: 'Laboratório',
    resumos: 'Resumos',
    buscarPlaceholder: 'Buscar lições e conceitos…',
    buscarRotulo: 'Buscar lições',
    paraTemaClaro: 'Mudar para o tema claro',
    paraTemaEscuro: 'Mudar para o tema escuro',
    temaClaro: 'Tema claro',
    temaEscuro: 'Tema escuro',
    inspiradoEm: 'inspirado em',
  },

  naoEncontrada: {
    pagina: 'Página não encontrada',
    licao: 'Lição não encontrada',
    semSlug: 'Não existe lição com o slug',
    voltarAoInicio: 'Voltar para o início',
  },

  menu: {
    licoes: 'Lições',
    curso: 'Curso',
    totalDeLicoes: (n: number) => (n === 1 ? '1 lição' : `${n} lições`),
    fecharCurso: 'Fechar o curso',
    nenhumaLicao: (termo: string) => `Nenhuma lição para “${termo}”.`,
    progresso: 'Progresso',
  },

  modulos: {
    renderizacao: 'Renderização',
    execucao: 'Execução',
    entrega: 'Entrega',
    arquitetura: 'Arquitetura',
    ferramentas: 'Ferramentas',
    qualidade: 'Qualidade',
  } satisfies Record<Modulo, string>,

  dificuldades: {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  } satisfies Record<Dificuldade, string>,

  inicio: {
    titulo: 'O que o browser faz por dentro',
    pitch:
      'Lições interativas sobre fundamentos de frontend. Cada lição é uma cena que avança passo a passo, e o passo atual mora na URL.',
  },

  licao: {
    licaoDe: (atual: number, total: number) => `Lição ${atual} de ${total}`,
    minutos: (n: number) => `${n} min`,
    passos: (n: number) => (n === 1 ? '1 passo' : `${n} passos`),
    passoDe: (atual: number, total: number) => `Passo ${atual} de ${total}`,
    passoCurto: (atual: number, total: number) => `Passo ${atual} / ${total}`,
    fidelidade: {
      medido: { rotulo: 'medido', titulo: 'Os números do painel são medidos no seu browser' },
      modelo: { rotulo: 'modelo', titulo: 'Modelo animado: explica, não mede' },
    },
    passosDaLicao: 'Passos da lição',
    nestaLicao: 'Nesta lição',
    naCena: 'Na cena',
    voltar: 'Voltar',
    fim: 'Fim da lição',
    proximo: (titulo: string) => `Próximo: ${titulo}`,
    atalhos: { passo: 'passo', repetir: 'repetir', espaco: 'Espaço', pausar: 'pausar' },
    vaiAprender: 'Você vai aprender',
    carregando: 'Carregando a lição…',
    erroAoCarregar: 'Não foi possível carregar a lição. Confira a conexão e tente de novo.',
    tentarDeNovo: 'Tentar de novo',
  },

  fontes: {
    titulo: 'Para estudar',
    rotulo: 'Fontes para estudar esta lição',
    total: (n: number) => (n === 1 ? '1 fonte' : `${n} fontes`),
    novaAba: '(abre em nova aba)',
    idiomaDoMaterial: (codigo: string) => `Material em ${NOME_DO_IDIOMA[codigo] ?? codigo}`,
    tipos: {
      documentacao: 'documentação',
      artigo: 'artigo',
      especificacao: 'especificação',
      livro: 'livro',
      palestra: 'palestra',
      guia: 'guia',
    } satisfies Record<TipoDeFonte, string>,
  },

  palco: {
    rotulo: 'Palco da lição',
    cena: (foco: string) => `Cena do passo: ${foco}`,
    repetir: 'Repetir',
    repetirRotulo: 'Repetir a transição',
    repetirTitulo: 'Repetir a transição (R)',
    pausar: 'Pausar',
    pausarRotulo: 'Pausar a cena',
    pausarTitulo: 'Pausar (Espaço)',
    continuar: 'Continuar',
    continuarRotulo: 'Continuar a cena',
    continuarTitulo: 'Continuar (Espaço)',
    legenda: 'Legenda',
    pacotes: {
      requisicao: 'requisição',
      sinal: 'sinal',
      pesado: 'carga pesada',
      lento: 'lento',
      resposta: 'resposta',
      falha: 'falha',
    } satisfies Record<TipoDePacote | 'resposta' | 'falha', string>,
  },

  laboratorio: {
    rotulo: 'Laboratório de custo de renderização',
    elemento: 'elemento',
    mudar: 'Mudar:',
    mudarRotulo: (propriedade: string) => `Mudar ${propriedade}`,
  },

  painel: {
    rotulo: 'Métricas do passo',
    titulo: 'Última interação',
    mudou: 'Mudou',
    reexecutou: 'Reexecutou',
    inferido: 'inferido',
    medido: 'medido',
    layoutShifts: 'Layout-shifts',
    shifts: (quantos: number, valor: string) => `${quantos} (valor ${valor})`,
    geometriaMudou: 'Geometria mudou',
    sim: 'sim',
    nao: 'não',
    layoutForcado: 'Layout forçado',
    emFoco: 'Em foco',
    nota: 'O browser não avisa “o layout rodou”: “inferido” vem da propriedade alterada; “medido”, do PerformanceObserver e da geometria.',
  },

  estagios: {
    dom: 'DOM',
    cssom: 'CSSOM',
    'render-tree': 'Render tree',
    layout: 'Layout',
    paint: 'Paint',
    composite: 'Composite',
  } satisfies Record<Estagio, string>,
};

export type TextosDaInterface = typeof ptBR;
