import type { LicaoFonte } from '../../schema/licao';
import { acessibilidade } from './acessibilidade';
import { bundlers } from './bundlers';
import { cacheCliente } from './cache-cliente';
import { carregamentoDeRecursos } from './carregamento-de-recursos';
import { codeSplitting } from './code-splitting';
import { coreWebVitals } from './core-web-vitals';
import { designDeComponentes } from './design-de-componentes';
import { estrategiaDeTestes } from './estrategia-de-testes';
import { eventLoop } from './event-loop';
import { hidratacao } from './hidratacao';
import { ilhasEResumabilidade } from './ilhas-e-resumabilidade';
import { microFrontends } from './micro-frontends';
import { modelosDeRenderizacao } from './modelos-de-renderizacao';
import { padroesDeComposicao } from './padroes-de-composicao';
import { reflowRepaintComposite } from './reflow-repaint-composite';
import { renderingPath } from './rendering-path';
import { tiposDeEstado } from './tipos-de-estado';
import { treeShaking } from './tree-shaking';
import { vdomReatividade } from './vdom-reatividade';

/**
 * As licoes em portugues do Brasil, na ordem do curriculo. Como o pt-BR e o
 * idioma padrao, esta lista define o curriculo para todos os idiomas.
 * Dentro de cada modulo, a ordem daqui e a ordem do menu.
 */
export const licoesPtBR: LicaoFonte[] = [
  // 01. Renderizacao: o que o browser faz com HTML e CSS
  renderingPath,
  reflowRepaintComposite,
  // 02. Execucao: onde e quando o codigo roda
  eventLoop,
  vdomReatividade,
  modelosDeRenderizacao,
  hidratacao,
  ilhasEResumabilidade,
  // 03. Entrega: o que chega ao leitor, e quando
  coreWebVitals,
  carregamentoDeRecursos,
  codeSplitting,
  // 04. Arquitetura: estado e componentes
  tiposDeEstado,
  cacheCliente,
  designDeComponentes,
  padroesDeComposicao,
  // 05. Ferramentas: build e modulos
  bundlers,
  treeShaking,
  microFrontends,
  // 06. Qualidade: testes e acessibilidade
  estrategiaDeTestes,
  acessibilidade,
];
