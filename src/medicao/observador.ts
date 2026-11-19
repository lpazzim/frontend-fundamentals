/** O que o browser nos deixa observar de verdade sobre uma mudanca de estilo. */
export interface Evidencia {
  /** Entradas "layout-shift" do PerformanceObserver geradas pela mudanca. null = browser sem suporte. */
  layoutShifts: number | null;
  /** Soma do campo value dessas entradas. */
  valorShift: number | null;
  /** O offsetLeft/Top/Width/Height do alvo mudou (a caixa de layout, sem contar transform). */
  geometriaMudou: boolean;
  /** Tempo do style+layout forcado logo apos a mudanca (leitura de offsetWidth). */
  msLayoutForcado: number;
}

function geometria(alvo: HTMLElement): string {
  // offset* le a caixa de layout e ignora transform: e o que separa layout de composite.
  return [alvo.offsetLeft, alvo.offsetTop, alvo.offsetWidth, alvo.offsetHeight].join(',');
}

function suportaLayoutShift(): boolean {
  return (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('layout-shift') === true
  );
}

function proximoFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Aplica uma mudanca de forma SINCRONA (o chamador faz o commit do DOM) e mede
 * o que o browser admite sobre ela. Espera dois frames: o layout-shift e
 * registrado no ciclo de renderizacao, depois da mudanca.
 */
export async function medirMudanca(alvo: HTMLElement, aplicar: () => void): Promise<Evidencia> {
  const coletadas: PerformanceEntry[] = [];
  let observador: PerformanceObserver | null = null;
  if (suportaLayoutShift()) {
    observador = new PerformanceObserver((lista) => coletadas.push(...lista.getEntries()));
    observador.observe({ type: 'layout-shift' });
  }

  const antes = geometria(alvo);
  aplicar();
  const inicio = performance.now();
  const depois = geometria(alvo); // forca style + layout agora, e mede quanto custou
  const msLayoutForcado = performance.now() - inicio;

  await proximoFrame();
  await proximoFrame();

  let layoutShifts: number | null = null;
  let valorShift: number | null = null;
  if (observador) {
    // takeRecords pega o que o callback ainda nao entregou; coletadas, o que ja entregou.
    const entradas = [...coletadas, ...observador.takeRecords()] as Array<
      PerformanceEntry & { value: number }
    >;
    observador.disconnect();
    layoutShifts = entradas.length;
    valorShift = entradas.reduce((soma, e) => soma + e.value, 0);
  }

  return { layoutShifts, valorShift, geometriaMudou: antes !== depois, msLayoutForcado };
}
