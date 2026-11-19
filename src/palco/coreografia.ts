import { mesmaPosicao, mesmoConteudo, type PlanoDaCena } from './plano';

/**
 * Coreografia de uma troca de passo, em fases, como no designed-to-scale:
 * primeiro sai quem saiu, depois se move quem mudou de lugar, depois entra
 * quem e novo (uma peca por vez, escalonadas), e so entao as ligacoes
 * aparecem entre pecas que ja estao no lugar. Funcao pura: devolve atrasos e
 * duracoes; quem anima e o motor.
 */
export const TEMPOS = {
  saida: 420,
  movimento: 820,
  entrada: 680,
  escalonamento: 130,
  desenho: 560,
  saidaDaLigacao: 300,
  pulso: 380,
} as const;

/** Curvas em cubic-bezier: o motor passa direto para a Web Animations API. */
export const CURVAS = {
  /** Acelera e freia: movimentos e camera. */
  entraESai: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Comeca rapido e assenta: opacidade de entrada. */
  assenta: 'cubic-bezier(0.33, 1, 0.68, 1)',
  /** Passa um pouco do ponto e volta: a peca que cai no lugar. */
  quica: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export interface Tempo {
  id: string;
  atraso: number;
  duracao: number;
}

export interface Transicao {
  saem: Tempo[];
  movem: Tempo[];
  entram: Tempo[];
  /** Mesma posicao, conteudo diferente (rotulo, etiqueta, cor): troca e pulsa. */
  mudam: Tempo[];
  ligacoesSaem: Tempo[];
  ligacoesEntram: Tempo[];
  camera: { atraso: number; duracao: number };
  /** Quando a cena assenta: a partir daqui os fluxos comecam. */
  total: number;
}

function mesmaLigacao(a: PlanoDaCena, b: PlanoDaCena, id: string): boolean {
  const x = a.ligacoes.get(id);
  const y = b.ligacoes.get(id);
  if (!x || !y || x.assinatura !== y.assinatura) return false;
  return x.pontos.every((p, i) => Math.abs(p.x - y.pontos[i]!.x) < 0.01 && Math.abs(p.y - y.pontos[i]!.y) < 0.01);
}

export function planejarTransicao(anterior: PlanoDaCena | null, proximo: PlanoDaCena): Transicao {
  const antes = anterior ?? { pecas: new Map(), ligacoes: new Map(), caixa: proximo.caixa };

  const saemIds = [...antes.pecas.keys()].filter((id) => !proximo.pecas.has(id));
  const movemIds: string[] = [];
  const mudamIds: string[] = [];
  for (const [id, peca] of proximo.pecas) {
    const velha = antes.pecas.get(id);
    if (!velha) continue;
    if (!mesmaPosicao(velha, peca)) movemIds.push(id);
    else if (!mesmoConteudo(velha.entidade, peca.entidade)) mudamIds.push(id);
  }
  // De tras para a frente, de cima para baixo: a cena se monta como se fosse empilhada.
  const entramIds = [...proximo.pecas.values()]
    .filter((p) => !antes.pecas.has(p.id))
    .sort((a, b) => a.posicao.y - b.posicao.y || a.posicao.x - b.posicao.x)
    .map((p) => p.id);

  const inicioDoMovimento = saemIds.length ? TEMPOS.saida * 0.55 : 0;
  const inicioDaEntrada = movemIds.length
    ? inicioDoMovimento + TEMPOS.movimento * 0.75
    : saemIds.length
      ? TEMPOS.saida * 0.7
      : 0;

  /** Quando cada peca da proxima cena esta no lugar (para as ligacoes esperarem por ela). */
  const pronta = new Map<string, number>();
  for (const id of proximo.pecas.keys()) pronta.set(id, 0);

  const saem = saemIds.map((id) => ({ id, atraso: 0, duracao: TEMPOS.saida }));
  const movem = movemIds.map((id) => {
    pronta.set(id, inicioDoMovimento + TEMPOS.movimento);
    return { id, atraso: inicioDoMovimento, duracao: TEMPOS.movimento };
  });
  const mudam = mudamIds.map((id) => ({ id, atraso: inicioDoMovimento, duracao: TEMPOS.pulso }));
  const entram = entramIds.map((id, i) => {
    const atraso = inicioDaEntrada + i * TEMPOS.escalonamento;
    pronta.set(id, atraso + TEMPOS.entrada * 0.8);
    return { id, atraso, duracao: TEMPOS.entrada };
  });

  const ligacoesSaem: Tempo[] = [];
  for (const id of antes.ligacoes.keys()) {
    if (!mesmaLigacao(antes, proximo, id)) ligacoesSaem.push({ id, atraso: 0, duracao: TEMPOS.saidaDaLigacao });
  }
  const ligacoesEntram: Tempo[] = [];
  for (const [id, ligacao] of proximo.ligacoes) {
    if (mesmaLigacao(antes, proximo, id)) continue;
    const atraso = Math.max(
      pronta.get(ligacao.de) ?? 0,
      pronta.get(ligacao.para) ?? 0,
      saemIds.length ? TEMPOS.saida * 0.5 : 0,
    );
    ligacoesEntram.push({ id, atraso, duracao: TEMPOS.desenho });
  }

  const algoMudou =
    saem.length + movem.length + entram.length + mudam.length + ligacoesSaem.length + ligacoesEntram.length > 0;
  const camera = { atraso: 0, duracao: algoMudou && anterior ? TEMPOS.movimento : 0 };

  const fins = [...saem, ...movem, ...entram, ...mudam, ...ligacoesSaem, ...ligacoesEntram].map(
    (t) => t.atraso + t.duracao,
  );
  const total = Math.max(0, camera.atraso + camera.duracao, ...fins);

  return { saem, movem, entram, mudam, ligacoesSaem, ligacoesEntram, camera, total };
}
