import type { Cena, Licao } from '../schema/licao';

/**
 * Traducao de uma licao: so o texto. A geometria (ids, posicoes, ligacoes,
 * fluxos) vem sempre da licao no idioma padrao, entao a cena traduzida e a
 * mesma cena, por construcao.
 *
 * Textos longos e unicos (narracao, titulo de passo, nota) sao indexados pelo
 * id do passo. Textos curtos das cenas (rotulos, subs, etiquetas, metricas) se
 * repetem muito entre passos e licoes, entao moram num dicionario de termos
 * indexado pelo proprio texto em portugues, como as mensagens do gettext: se
 * o portugues muda, a traducao antiga deixa de casar e o teste aponta.
 */
export interface TraducaoDeLicao {
  titulo: string;
  resumo: string;
  /** Na mesma ordem dos objetivos da licao original. */
  objetivos: string[];
  passos: Record<string, { titulo: string; narracao: string; nota?: string }>;
  /** Nota de cada fonte, pela URL. O titulo da fonte e o do material, nao se traduz. */
  fontes: Record<string, string>;
  /** Termos que, so nesta licao, traduzem diferente do dicionario comum. */
  termos?: Record<string, string>;
}

export interface PacoteDeIdioma {
  /** Textos curtos das cenas, comuns a todas as licoes, pelo texto em portugues. */
  termos: Record<string, string>;
  /** Ajuste de um texto que dispensa traducao, como a virgula decimal: '0,4 s' -> '0.4 s'. */
  ajustar?: (texto: string) => string;
}

export interface ResultadoDaTraducao {
  licao: Licao;
  /** O que falta na traducao: passos, notas, objetivos ou fontes sem texto. */
  pendencias: string[];
  /** Termos que nao estavam em nenhum dicionario e foram mantidos como no original. */
  semTraducao: string[];
}

export function traduzirLicao(original: Licao, traducao: TraducaoDeLicao, pacote: PacoteDeIdioma): ResultadoDaTraducao {
  const pendencias: string[] = [];
  const semTraducao = new Set<string>();

  const termo = (texto: string): string => {
    const traduzido = traducao.termos?.[texto] ?? pacote.termos[texto];
    if (traduzido !== undefined) return traduzido;
    semTraducao.add(texto);
    return pacote.ajustar ? pacote.ajustar(texto) : texto;
  };

  if (traducao.objetivos.length !== original.objetivos.length) {
    pendencias.push(`objetivos: ${traducao.objetivos.length} traduzidos de ${original.objetivos.length}`);
  }
  for (const id of Object.keys(traducao.passos)) {
    if (!original.passos.some((p) => p.id === id)) pendencias.push(`passo que nao existe no original: ${id}`);
  }

  const passos = original.passos.map((passo) => {
    const texto = traducao.passos[passo.id];
    if (!texto) pendencias.push(`passo sem traducao: ${passo.id}`);
    if (passo.cena.nota && !texto?.nota) pendencias.push(`nota sem traducao: ${passo.id}`);
    const nota = passo.cena.nota ? (texto?.nota ?? passo.cena.nota) : undefined;
    return {
      ...passo,
      titulo: texto?.titulo ?? passo.titulo,
      narracao: texto?.narracao ?? passo.narracao,
      cena: traduzirCena(passo.cena, termo, nota),
    };
  });

  const fontes = original.fontes.map((fonte) => {
    const nota = traducao.fontes[fonte.url];
    if (fonte.nota && nota === undefined) pendencias.push(`fonte sem nota traduzida: ${fonte.url}`);
    return { ...fonte, origem: termo(fonte.origem), nota: fonte.nota ? (nota ?? fonte.nota) : undefined };
  });
  for (const url of Object.keys(traducao.fontes)) {
    if (!original.fontes.some((f) => f.url === url)) pendencias.push(`fonte que nao existe no original: ${url}`);
  }

  const licao: Licao = {
    ...original,
    titulo: traducao.titulo,
    resumo: traducao.resumo,
    objetivos: original.objetivos.map((o, i) => ({ ...o, texto: traducao.objetivos[i] ?? o.texto })),
    passos,
    fontes,
  };
  return { licao, pendencias, semTraducao: [...semTraducao] };
}

function traduzirCena(cena: Cena, termo: (texto: string) => string, nota: string | undefined): Cena {
  return {
    ...cena,
    foco: termo(cena.foco),
    nota,
    entidades: Object.fromEntries(
      Object.entries(cena.entidades).map(([id, e]) => [
        id,
        {
          ...e,
          rotulo: termo(e.rotulo),
          sub: e.sub === undefined ? undefined : termo(e.sub),
          etiquetas: e.etiquetas.map((etiqueta) => ({ ...etiqueta, texto: termo(etiqueta.texto) })),
        },
      ]),
    ),
    ligacoes: Object.fromEntries(
      Object.entries(cena.ligacoes).map(([id, l]) => [id, { ...l, rotulo: l.rotulo === undefined ? undefined : termo(l.rotulo) }]),
    ),
    metricas: cena.metricas.map((m) => ({ ...m, rotulo: termo(m.rotulo), valor: termo(m.valor) })),
  };
}

/**
 * Heuristica para o teste: um termo mantido como no original parece portugues?
 * Acento ou palavra funcional do portugues denunciam; nomes tecnicos ("DOM",
 * "useState", "16 ms") passam.
 */
export function parecePortugues(texto: string): boolean {
  if (/[áàâãéêíóôõúç]/i.test(texto)) return true;
  return /\b(de|da|do|das|dos|em|na|no|nas|nos|com|sem|para|por|pelo|pela|um|uma|que|ainda|tudo|nada|cada|aqui|antes|depois|mais|menos|muito|muitos|poucos|alguns|nunca|sim|ou)\b/i.test(texto) || /\se\s/.test(texto);
}
