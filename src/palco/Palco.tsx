import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from 'react';
import type { Cena, Metrica, TipoDePacote } from '../schema/licao';
import { criarMotor, type Motor } from './motor';
import { useTextos } from '../i18n/interface';
import { Icone } from '../ui/Icone';

export interface AlcaDoPalco {
  disparar(rota: string[], tipo?: TipoDePacote): void;
  pulsar(id: string): void;
}

function prefereMenosMovimento(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Atalhos do palco nao disparam enquanto alguem digita ou esta num controle que usa a tecla. */
function teclaEhDeOutroControle(alvo: EventTarget | null, tecla: string): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  if (alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName)) return true;
  return tecla === ' ' && ['BUTTON', 'A'].includes(alvo.tagName);
}

type ItemDaLegenda = TipoDePacote | 'resposta' | 'falha';

function legendaDa(cena: Cena): ItemDaLegenda[] {
  const itens = new Set<ItemDaLegenda>();
  for (const fluxo of cena.fluxos) {
    itens.add(fluxo.tipo);
    if (fluxo.volta) itens.add('resposta');
    if (fluxo.falha > 0) itens.add('falha');
  }
  return [...itens];
}

/**
 * Chips com os numeros do passo. A chave do valor muda quando o numero muda:
 * o React remonta o span e a animacao de entrada (transform + opacity) roda de
 * novo. O "flash" do chip e uma camada por cima que so muda de opacidade.
 */
function MetricasDoPasso({ metricas }: { metricas: Metrica[] }) {
  return (
    <ul className="palco__metricas" data-testid="palco-metricas">
      {metricas.map((m) => (
        <li key={m.rotulo} className="palco__metrica" data-nivel={m.nivel}>
          <span key={m.valor} className="palco__metrica-flash" aria-hidden="true" />
          <span className="palco__metrica-rotulo">{m.rotulo}</span>
          <span key={`v-${m.valor}`} className="palco__metrica-valor">
            {m.valor}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Palco({
  cena,
  semente,
  reservarMetricas,
  alca,
}: {
  cena: Cena;
  /** Semente do sorteio de falhas: o mesmo passo sempre falha igual. */
  semente: string;
  /** A licao tem metricas em algum passo: reserva a linha em todos, para nada pular. */
  reservarMetricas: boolean;
  alca?: Ref<AlcaDoPalco>;
}) {
  const raizRef = useRef<HTMLDivElement>(null);
  const motorRef = useRef<Motor | null>(null);
  const [pausado, setPausado] = useState(false);

  useLayoutEffect(() => {
    const motor = criarMotor(raizRef.current!, { reduzirMovimento: prefereMenosMovimento });
    motorRef.current = motor;
    return () => {
      motor.destruir();
      motorRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    motorRef.current?.irPara(cena, { semente });
    pausadoRef.current = false;
    setPausado(false);
  }, [cena, semente]);

  useImperativeHandle(
    alca,
    () => ({
      disparar: (rota, tipo) => motorRef.current?.disparar(rota, tipo),
      pulsar: (id) => motorRef.current?.pulsar(id),
    }),
    [],
  );

  // Espelho do estado para os atalhos (registrados uma vez so) lerem o valor atual.
  const pausadoRef = useRef(false);

  function alternarPausa() {
    const motor = motorRef.current;
    if (!motor) return;
    const pausar = !pausadoRef.current;
    if (pausar) motor.pausar();
    else motor.retomar();
    pausadoRef.current = pausar;
    setPausado(pausar);
  }

  function repetir() {
    motorRef.current?.repetir();
    pausadoRef.current = false;
    setPausado(false);
  }

  // R repete, Espaco pausa: os atalhos do designed-to-scale.
  useEffect(() => {
    function aoPressionar(evento: KeyboardEvent) {
      if (evento.defaultPrevented || evento.metaKey || evento.ctrlKey || evento.altKey) return;
      if (teclaEhDeOutroControle(evento.target, evento.key)) return;
      if (evento.key === 'r' || evento.key === 'R') {
        evento.preventDefault();
        repetir();
      } else if (evento.key === ' ') {
        evento.preventDefault();
        alternarPausa();
      }
    }
    window.addEventListener('keydown', aoPressionar);
    return () => window.removeEventListener('keydown', aoPressionar);
  }, []);

  const legenda = legendaDa(cena);
  const t = useTextos();

  return (
    <section className="card palco-quadro" aria-label={t.palco.rotulo}>
      {reservarMetricas ? <MetricasDoPasso metricas={cena.metricas} /> : null}
      <div className="palco__ferramentas">
        <button
          type="button"
          className="ferramenta"
          onClick={repetir}
          title={t.palco.repetirTitulo}
          aria-label={t.palco.repetirRotulo}
          data-testid="palco-repetir"
        >
          <Icone nome="repetir" tamanho={15} traco={2} />
          <span>{t.palco.repetir}</span>
        </button>
        <button
          type="button"
          className="ferramenta"
          onClick={alternarPausa}
          title={pausado ? t.palco.continuarTitulo : t.palco.pausarTitulo}
          aria-label={pausado ? t.palco.continuarRotulo : t.palco.pausarRotulo}
          aria-pressed={pausado}
          data-testid="palco-pausar"
        >
          <Icone nome={pausado ? 'tocar' : 'pausar'} tamanho={15} traco={2} />
          <span>{pausado ? t.palco.continuar : t.palco.pausar}</span>
        </button>
      </div>
      {/* O motor e dono de tudo dentro desta div: o React nunca renderiza filhos aqui. */}
      <div ref={raizRef} className="palco" role="img" aria-label={t.palco.cena(cena.foco)} data-testid="cena" />
      <ul className="palco__legenda" aria-label={t.palco.legenda}>
        {legenda.map((item) => (
          <li key={item} data-item={item}>
            <span className="palco__legenda-ponto" aria-hidden="true" />
            {t.palco.pacotes[item]}
          </li>
        ))}
      </ul>
    </section>
  );
}
