import { useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { estagioMaisCaro, type EstagioDeCusto } from '../medicao/custo';
import type { TipoDePacote } from '../schema/licao';
import type { AcaoLab, Medicao } from '../medicao/medicao';
import { medirMudanca } from '../medicao/observador';
import { useTextos } from '../i18n/interface';

interface DefinicaoAcao {
  rotulo: string;
  propriedades: string[];
}

export const ACOES: Record<AcaoLab, DefinicaoAcao> = {
  layout: { rotulo: 'width + top', propriedades: ['width', 'top'] },
  paint: { rotulo: 'background-color', propriedades: ['background-color'] },
  composite: { rotulo: 'transform + opacity', propriedades: ['transform', 'opacity'] },
};

/**
 * O que o palco da licao 2 faz depois de uma medicao: a peca do estagio que a
 * mudanca reabre bate, e um pacote percorre as ligacoes dali em diante.
 * As ligacoes l-p e p-c existem em todos os passos da licao 2.
 */
export function reacaoDoPalco(estagio: EstagioDeCusto): { pulsar: string; rota: string[]; tipo: TipoDePacote } {
  if (estagio === 'layout') return { pulsar: 'layout', rota: ['l-p', 'p-c'], tipo: 'pesado' };
  if (estagio === 'paint') return { pulsar: 'paint', rota: ['p-c'], tipo: 'requisicao' };
  return { pulsar: 'composite', rota: [], tipo: 'sinal' };
}

const ORDEM: AcaoLab[] = ['layout', 'paint', 'composite'];

/** Cada acao alterna entre dois estados; o estilo e derivado, nunca acumulado. */
function estiloDoAlvo(alternado: Record<AcaoLab, boolean>): CSSProperties {
  return {
    width: alternado.layout ? 200 : 110,
    top: alternado.layout ? 48 : 10,
    backgroundColor: alternado.paint ? 'var(--acento)' : 'var(--acento-fraco)',
    transform: alternado.composite ? 'translateX(72px)' : 'translateX(0)',
    opacity: alternado.composite ? 0.5 : 1,
  };
}

/**
 * Um elemento e tres botoes. Cada botao muda propriedades de um custo
 * diferente; o resultado medido sobe para o painel via onMedicao.
 * O palco tem altura fixa e overflow hidden: o que se move aqui nao
 * empurra nada fora dele, entao qualquer layout-shift medido e culpa da acao.
 */
export function Laboratorio({ onMedicao }: { onMedicao: (medicao: Medicao) => void }) {
  const t = useTextos();
  const alvoRef = useRef<HTMLDivElement>(null);
  const ocupado = useRef(false);
  const [alternado, setAlternado] = useState<Record<AcaoLab, boolean>>({
    layout: false,
    paint: false,
    composite: false,
  });

  async function disparar(acao: AcaoLab) {
    const alvo = alvoRef.current;
    if (!alvo || ocupado.current) return;
    ocupado.current = true;
    try {
      const { propriedades } = ACOES[acao];
      const evidencia = await medirMudanca(alvo, () =>
        // flushSync: o DOM precisa estar commitado antes de medir, nao no proximo tick.
        flushSync(() => setAlternado((anterior) => ({ ...anterior, [acao]: !anterior[acao] }))),
      );
      onMedicao({ acao, propriedades, estagio: estagioMaisCaro(propriedades), ...evidencia });
    } finally {
      ocupado.current = false;
    }
  }

  return (
    <section className="lab" aria-label={t.laboratorio.rotulo}>
      <div className="lab__palco" data-testid="lab-palco">
        <div ref={alvoRef} className="lab__alvo" style={estiloDoAlvo(alternado)} data-testid="lab-alvo">
          {t.laboratorio.elemento}
        </div>
      </div>
      <div className="lab__acoes">
        <span className="lab__dica" aria-hidden="true">
          {t.laboratorio.mudar}
        </span>
        {ORDEM.map((acao) => (
          <button
            key={acao}
            type="button"
            className="botao"
            data-testid={`acao-${acao}`}
            aria-label={t.laboratorio.mudarRotulo(ACOES[acao].rotulo)}
            onClick={() => void disparar(acao)}
          >
            {ACOES[acao].rotulo}
          </button>
        ))}
      </div>
    </section>
  );
}
