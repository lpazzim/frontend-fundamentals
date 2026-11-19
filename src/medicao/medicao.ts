import type { EstagioDeCusto } from './custo';
import type { Evidencia } from './observador';

export type AcaoLab = 'layout' | 'paint' | 'composite';

/** Uma interacao do leitor com o laboratorio: o que foi inferido + o que foi medido. */
export interface Medicao extends Evidencia {
  acao: AcaoLab;
  propriedades: string[];
  /** Inferido pela tabela de custo, nao medido. */
  estagio: EstagioDeCusto;
}
