import type { Licao } from '../schema/licao';

/**
 * O que uma traducao NAO pode mudar: tudo o que nao e texto. Ids, posicoes,
 * ligacoes, fluxos, niveis das metricas e a ordem dos objetivos ficam iguais
 * em todos os idiomas, para que a mesma cena (e o mesmo motor de animacao)
 * conte a mesma historia. Fontes ficam de fora: uma traducao pode citar a
 * versao localizada de um material.
 */
export function estruturaDaLicao(licao: Licao) {
  return {
    slug: licao.slug,
    modulo: licao.modulo,
    dificuldade: licao.dificuldade,
    minutos: licao.minutos,
    fidelidade: licao.fidelidade,
    laboratorio: licao.laboratorio,
    objetivos: licao.objetivos.map((o) => o.passo),
    passos: licao.passos.map((passo) => ({
      id: passo.id,
      comNota: Boolean(passo.cena.nota),
      entidades: Object.fromEntries(
        Object.entries(passo.cena.entidades).map(([id, e]) => [
          id,
          {
            tipo: e.tipo,
            pos: e.pos,
            tamanho: e.tamanho,
            icone: e.icone,
            cor: e.cor,
            destaque: e.destaque,
            apagado: e.apagado,
            comSub: Boolean(e.sub),
            etiquetas: e.etiquetas.map((etiqueta) => etiqueta.tom),
          },
        ]),
      ),
      ligacoes: Object.fromEntries(
        Object.entries(passo.cena.ligacoes).map(([id, l]) => [
          id,
          { de: l.de, para: l.para, estilo: l.estilo, setas: l.setas, comRotulo: Boolean(l.rotulo) },
        ]),
      ),
      fluxos: passo.cena.fluxos,
      metricas: passo.cena.metricas.map((m) => m.nivel),
    })),
  };
}
