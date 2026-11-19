/**
 * Quanto custa cada propriedade CSS: ate que estagio do pipeline o browser
 * precisa voltar quando ela muda. Mesma ideia do csstriggers, restrita ao que
 * o laboratorio usa.
 *
 * Isto e uma TABELA, nao uma medicao: o browser nao expoe "o layout rodou".
 * O painel mostra esta inferencia separada das evidencias medidas de verdade.
 */
export const ESTAGIOS_DE_CUSTO = ['layout', 'paint', 'composite'] as const;
export type EstagioDeCusto = (typeof ESTAGIOS_DE_CUSTO)[number];

export const ESTAGIO_POR_PROPRIEDADE: Record<string, EstagioDeCusto> = {
  width: 'layout',
  height: 'layout',
  top: 'layout',
  left: 'layout',
  margin: 'layout',
  'font-size': 'layout',
  color: 'paint',
  'background-color': 'paint',
  'box-shadow': 'paint',
  transform: 'composite',
  opacity: 'composite',
};

/** O estagio mais caro entre as propriedades alteradas. Propriedade desconhecida estoura: melhor que chutar. */
export function estagioMaisCaro(propriedades: string[]): EstagioDeCusto {
  if (propriedades.length === 0) throw new Error('nenhuma propriedade alterada');
  let pior = ESTAGIOS_DE_CUSTO.length - 1;
  for (const propriedade of propriedades) {
    const estagio = ESTAGIO_POR_PROPRIEDADE[propriedade];
    if (!estagio) throw new Error(`propriedade sem classificacao de custo: ${propriedade}`);
    pior = Math.min(pior, ESTAGIOS_DE_CUSTO.indexOf(estagio));
  }
  return ESTAGIOS_DE_CUSTO[pior]!;
}

/** Voltar a um estagio re-executa ele e todos os seguintes. */
export function estagiosReexecutados(estagio: EstagioDeCusto): EstagioDeCusto[] {
  return ESTAGIOS_DE_CUSTO.slice(ESTAGIOS_DE_CUSTO.indexOf(estagio));
}
