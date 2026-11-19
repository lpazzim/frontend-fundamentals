import type { Fluxo, TipoDePacote } from '../schema/licao';
import { comprimento, type Ponto } from './geometria';
import type { LigacaoPlanejada } from './plano';

/** Velocidade de um pacote comum, em px de mundo por segundo (a mesma do designed-to-scale). */
export const VELOCIDADE = 155;

export const FATOR_DE_VELOCIDADE: Record<TipoDePacote, number> = {
  requisicao: 1,
  sinal: 0.85,
  pesado: 0.7,
  lento: 0.32,
};

/** Pausa num no entre dois trechos da rota: o pacote some, "e processado", e segue. */
export const PAUSA_NO_NO = 160;

/**
 * Sorteio com semente (mulberry32). O mesmo passo sempre sorteia as mesmas
 * falhas na mesma ordem: a cena e reproduzivel e o teste nao fica flaky.
 */
export function sorteador(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semente estavel a partir de um texto (ex.: slug + passo). */
export function sementeDe(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface Trecho {
  ligacao: string;
  de: Ponto;
  para: Ponto;
  /** ms */
  duracao: number;
  /** true: o pacote esta voltando como resposta. */
  volta: boolean;
}

export interface Viagem {
  tipo: TipoDePacote;
  trechos: Trecho[];
  /** ms retido no destino antes de voltar (pulsando). */
  segura: number;
  desfecho: 'ok' | 'falha';
  /** Onde a viagem termina: e ali que o anel de chegada (ou o X de falha) aparece. */
  fim: Ponto;
}

export function intervaloEntrePacotes(fluxo: Fluxo): number {
  return 1000 / fluxo.taxa;
}

/**
 * Planeja uma viagem completa: ida pela rota, falha ou chegada, e a volta se
 * o fluxo for de ida e volta. Devolve null se a rota usa uma ligacao que nao
 * esta na cena (o schema recusa isso; aqui so nao derruba).
 */
export function planejarViagem(
  fluxo: Fluxo,
  ligacoes: Map<string, LigacaoPlanejada>,
  sorteio: () => number,
): Viagem | null {
  const velocidade = VELOCIDADE * FATOR_DE_VELOCIDADE[fluxo.tipo];
  const ida: Trecho[] = [];
  for (const id of fluxo.rota) {
    const ligacao = ligacoes.get(id);
    if (!ligacao) return null;
    const [de, para] = ligacao.pontos;
    ida.push({ ligacao: id, de, para, duracao: (comprimento([de, para]) / velocidade) * 1000, volta: false });
  }

  const ultimo = ida[ida.length - 1]!;
  if (fluxo.falha > 0 && sorteio() < fluxo.falha) {
    return { tipo: fluxo.tipo, trechos: ida, segura: 0, desfecho: 'falha', fim: ultimo.para };
  }
  if (!fluxo.volta) {
    return { tipo: fluxo.tipo, trechos: ida, segura: 0, desfecho: 'ok', fim: ultimo.para };
  }
  const volta = [...ida].reverse().map((t) => ({ ...t, de: t.para, para: t.de, volta: true }));
  return {
    tipo: fluxo.tipo,
    trechos: [...ida, ...volta],
    segura: fluxo.segura * 1000,
    desfecho: 'ok',
    fim: ida[0]!.de,
  };
}
