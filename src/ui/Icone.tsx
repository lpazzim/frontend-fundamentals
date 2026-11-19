import type { Licao } from '../schema/licao';

/**
 * Icones de traco da interface (24x24, stroke: currentColor), desenhados para
 * este projeto. A cor vem do CSS, entao funcionam no tema claro e no escuro.
 */
const CAMINHOS = {
  livro: '<path d="M2.5 4.5h6a3.5 3.5 0 0 1 3.5 3.5v12a2.8 2.8 0 0 0-2.8-2.8H2.5z"/><path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12a2.8 2.8 0 0 1 2.8-2.8h6.7z"/>',
  alvo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  frasco: '<path d="M9 3h6M10 3v6.2L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3"/><path d="M7.4 15h9.2"/>',
  grade: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.3"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.8 5.5 3.8 9s-1.2 6.5-3.8 9M12 3c-2.6 2.5-3.8 5.5-3.8 9s1.2 6.5 3.8 9"/>',
  lua: '<path d="M20 14.6A8.3 8.3 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  externo: '<path d="M7 17L17 7M8.5 7H17v8.5"/>',
  chevronDireita: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
  chevronBaixo: '<path d="M5.5 9l6.5 6.5L18.5 9"/>',
  arquivo: '<path d="M6 21.5a1.8 1.8 0 0 1-1.8-1.8V4.3A1.8 1.8 0 0 1 6 2.5h8l5.8 5.8v11.4a1.8 1.8 0 0 1-1.8 1.8z"/><path d="M14 2.5v5.8h5.8"/>',
  circulo: '<circle cx="12" cy="12" r="8.5"/>',
  circuloFeito: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.4l2.6 2.6 5-5.4"/>',
  relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  barras: '<path d="M5 19v-3M10 19v-7M15 19V8M20 19V4"/>',
  lista: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M4 5.5l1.5-1v4M4 11h2.5L4 13.5h2.5M4 16h2.5L5 17.5l1.5 1.5H4"/>',
  repetir: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  pausar: '<path d="M8.5 5v14M15.5 5v14"/>',
  tocar: '<path d="M7.5 4.8v14.4L19 12z"/>',
  setaEsquerda: '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
  setaDireita: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  teclado: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9"/>',
  brilho: '<path d="M11 3.5l1.9 4.9 4.9 1.9-4.9 1.9-1.9 4.9-1.9-4.9-4.9-1.9 4.9-1.9z"/><path d="M18.5 14.5v5M16 17h5"/>',
  lampada: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  filme: '<circle cx="12" cy="12" r="8.5"/><path d="M10.2 8.6v6.8l5.6-3.4z"/>',
} as const;

export type NomeDoIcone = keyof typeof CAMINHOS;

export function Icone({
  nome,
  tamanho = 16,
  traco = 1.8,
  className,
}: {
  nome: NomeDoIcone;
  tamanho?: number;
  traco?: number;
  className?: string;
}) {
  return (
    <svg
      className={className ? `icone ${className}` : 'icone'}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: CAMINHOS[nome] }}
    />
  );
}

/** Logo: um bloco isometrico do proprio palco, com o topo verde. */
export function Logo() {
  return (
    <svg className="logo" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <path className="logo__lado" d="M3.5 9.2 15 15.4v11.9L3.5 21.1z" />
      <path className="logo__frente" d="M26.5 9.2 15 15.4v11.9l11.5-6.2z" />
      <path className="logo__topo" d="M15 2.7 26.5 9.2 15 15.4 3.5 9.2z" />
      <path className="logo__linha" d="M9.3 6 20.8 12.3" />
    </svg>
  );
}

/** Pasta colorida da arvore do curso, uma cor por modulo. */
export function Pasta({ cor }: { cor: string }) {
  return (
    <svg className={`pasta pasta--${cor}`} width="19" height="16" viewBox="0 0 19 16" aria-hidden="true">
      <path d="M1.6 3.1c0-.9.7-1.6 1.6-1.6h3.9l1.8 2h6.9c.9 0 1.6.7 1.6 1.6v8.3c0 .9-.7 1.6-1.6 1.6H3.2c-.9 0-1.6-.7-1.6-1.6z" />
      <path className="pasta__aba" d="M1.6 6.2h16.2" />
    </svg>
  );
}

export const COR_DO_MODULO: Record<Licao['modulo'], string> = {
  renderizacao: 'areia',
  execucao: 'verde',
  entrega: 'violeta',
  arquitetura: 'azul',
  ferramentas: 'laranja',
  qualidade: 'rosa',
};
