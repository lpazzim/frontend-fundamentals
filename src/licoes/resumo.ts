import type { Idioma } from '../i18n/idiomas';
import type { Licao } from '../schema/licao';

/**
 * O que o app precisa saber de uma licao SEM carrega-la: menu, inicio, busca,
 * progresso e o "Licao X de Y". Os titulos dos passos entram porque a busca os
 * usa e porque passos.length e o total de passos que o progresso conta.
 */
export interface ResumoDeLicao {
  slug: string;
  modulo: Licao['modulo'];
  titulo: string;
  resumo: string;
  dificuldade: Licao['dificuldade'];
  minutos: number;
  fidelidade: Licao['fidelidade'];
  laboratorio?: NonNullable<Licao['laboratorio']>;
  passos: string[];
}

export type Catalogo = Record<Idioma, ResumoDeLicao[]>;

export function resumirLicao(licao: Licao): ResumoDeLicao {
  return {
    slug: licao.slug,
    modulo: licao.modulo,
    titulo: licao.titulo,
    resumo: licao.resumo,
    dificuldade: licao.dificuldade,
    minutos: licao.minutos,
    fidelidade: licao.fidelidade,
    ...(licao.laboratorio ? { laboratorio: licao.laboratorio } : {}),
    passos: licao.passos.map((p) => p.titulo),
  };
}

/** O codigo-fonte do arquivo gerado. Fica aqui para o teste e a geracao usarem o mesmo formato. */
export function fonteDoCatalogo(catalogo: Catalogo): string {
  return [
    '// Gerado por src/licoes/catalogo.test.ts a partir das licoes. Nao edite a mao:',
    '// depois de mudar uma licao ou uma traducao, rode `npm run catalogo`.',
    "import type { Catalogo } from './resumo';",
    '',
    `export const CATALOGO: Catalogo = ${JSON.stringify(catalogo, null, 2)};`,
    '',
  ].join('\n');
}
