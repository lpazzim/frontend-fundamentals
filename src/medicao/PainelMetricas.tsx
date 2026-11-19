import { useTextos } from '../i18n/interface';
import { ESTAGIOS_DE_CUSTO, estagiosReexecutados } from './custo';
import type { Medicao } from './medicao';

function formatarMs(ms: number): string {
  return `${ms.toFixed(2)} ms`;
}

/**
 * O painel tem SEMPRE a mesma altura: uma interacao nao pode empurrar nada,
 * ou o proprio painel causaria o layout-shift que o teste de performance
 * procura. Por isso toda celula existe desde o inicio, com "—" no lugar do valor.
 *
 * Compacto: uma grade de celulas (rotulo em cima, valor embaixo), para caber
 * ao lado do laboratorio sem roubar altura do palco.
 *
 * Honestidade: o browser nao diz "layout rodou". "Reexecutou" e INFERIDO da
 * tabela de custo por propriedade; as celulas marcadas "medido" vem do
 * PerformanceObserver e da leitura de geometria.
 */
export function PainelMetricas({
  ativo,
  medicao,
  comInteracao,
}: {
  /** O que esta em foco no passo (o foco da cena). */
  ativo: string;
  medicao: Medicao | null;
  comInteracao: boolean;
}) {
  const t = useTextos();
  const reexecutados = medicao ? estagiosReexecutados(medicao.estagio) : [];
  return (
    <aside
      className="painel"
      aria-label={t.painel.rotulo}
      data-testid="painel-metricas"
      data-medicao={medicao ? medicao.estagio : 'ocioso'}
    >
      <h3 className="painel__titulo">{t.painel.titulo}</h3>
      <dl className="painel__grade">
        {comInteracao ? (
          <>
            <div className="painel__celula">
              <dt>{t.painel.mudou}</dt>
              <dd data-testid="metrica-acao">{medicao ? medicao.propriedades.join(' + ') : '—'}</dd>
            </div>
            <div className="painel__celula">
              <dt>
                {t.painel.reexecutou} <span className="painel__fonte">{t.painel.inferido}</span>
              </dt>
              <dd className="painel__chips" data-testid="metrica-estagios">
                {ESTAGIOS_DE_CUSTO.map((estagio) => (
                  <span key={estagio} className="painel__chip" data-ligado={reexecutados.includes(estagio)}>
                    {t.estagios[estagio]}
                  </span>
                ))}
              </dd>
            </div>
            <div className="painel__celula">
              <dt>
                {t.painel.layoutShifts} <span className="painel__fonte">{t.painel.medido}</span>
              </dt>
              <dd data-testid="metrica-shifts">
                {medicao?.layoutShifts == null
                  ? '—'
                  : t.painel.shifts(medicao.layoutShifts, (medicao.valorShift ?? 0).toFixed(4))}
              </dd>
            </div>
            <div className="painel__celula">
              <dt>
                {t.painel.geometriaMudou} <span className="painel__fonte">{t.painel.medido}</span>
              </dt>
              <dd data-testid="metrica-geometria">{medicao ? (medicao.geometriaMudou ? t.painel.sim : t.painel.nao) : '—'}</dd>
            </div>
            <div className="painel__celula">
              <dt>
                {t.painel.layoutForcado} <span className="painel__fonte">{t.painel.medido}</span>
              </dt>
              <dd data-testid="metrica-ms">{medicao ? formatarMs(medicao.msLayoutForcado) : '—'}</dd>
            </div>
          </>
        ) : null}
        <div className="painel__celula">
          <dt>{t.painel.emFoco}</dt>
          <dd data-testid="metrica-estagio">{ativo}</dd>
        </div>
      </dl>
      {comInteracao ? (
        <p className="painel__nota">{t.painel.nota}</p>
      ) : null}
    </aside>
  );
}
