import { useSyncExternalStore } from 'react';
import { z } from 'zod';

/**
 * Progresso do leitor: quais passos de cada licao ele ja viu. Mora em
 * localStorage, sem state manager (decisao do doc do projeto). A parte pura
 * (registrar, concluida, resumo) nao toca em storage e e a que os testes cobrem.
 */
const CHAVE = 'render-lab:progresso:v1';

export const ProgressoSchema = z.record(
  z.string(),
  z.object({ vistos: z.array(z.number().int().positive()) }),
);
export type Progresso = z.infer<typeof ProgressoSchema>;

export function registrarPasso(progresso: Progresso, slug: string, passo: number): Progresso {
  const vistos = progresso[slug]?.vistos ?? [];
  if (vistos.includes(passo)) return progresso;
  return { ...progresso, [slug]: { vistos: [...vistos, passo].sort((a, b) => a - b) } };
}

/** Quantos passos distintos da licao (de 1 ate total) o leitor ja viu. */
export function passosVistos(progresso: Progresso, slug: string, total: number): number {
  return new Set((progresso[slug]?.vistos ?? []).filter((p) => p <= total)).size;
}

export function licaoConcluida(progresso: Progresso, slug: string, total: number): boolean {
  return total > 0 && passosVistos(progresso, slug, total) >= total;
}

/** Texto curto do menu: "✓", "3/6" ou vazio se nunca abriu. */
export function resumoDeProgresso(progresso: Progresso, slug: string, total: number): string {
  const vistos = passosVistos(progresso, slug, total);
  if (vistos === 0) return '';
  return vistos >= total ? '✓' : `${vistos}/${total}`;
}

/** Le e valida. Storage indisponivel, corrompido ou de outra versao vira "sem progresso". */
export function lerProgresso(storage: Pick<Storage, 'getItem'> | undefined): Progresso {
  try {
    const bruto = storage?.getItem(CHAVE);
    if (!bruto) return {};
    const resultado = ProgressoSchema.safeParse(JSON.parse(bruto));
    return resultado.success ? resultado.data : {};
  } catch {
    return {};
  }
}

function storageSeguro(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined; // acesso pode lancar em janela privada ou com dados de site bloqueados
  }
}

// ---- store externo (useSyncExternalStore): um snapshot estavel, trocado a cada escrita ----

let atual: Progresso = lerProgresso(storageSeguro());
const ouvintes = new Set<() => void>();

function notificar() {
  for (const ouvinte of ouvintes) ouvinte();
}

export function registrarVisita(slug: string, passo: number): void {
  const proximo = registrarPasso(atual, slug, passo);
  if (proximo === atual) return;
  atual = proximo;
  try {
    storageSeguro()?.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    // sem persistencia: o progresso segue valendo ate fechar a aba
  }
  notificar();
}

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  const aoMudarEmOutraAba = (evento: StorageEvent) => {
    if (evento.key !== CHAVE) return;
    atual = lerProgresso(storageSeguro());
    ouvinte();
  };
  window.addEventListener('storage', aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener('storage', aoMudarEmOutraAba);
  };
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(assinar, () => atual, () => ({}));
}
