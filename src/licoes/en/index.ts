import type { TraducaoDeLicao } from '../traducao';
import acessibilidade from './acessibilidade';
import bundlers from './bundlers';
import cacheCliente from './cache-cliente';
import carregamentoDeRecursos from './carregamento-de-recursos';
import codeSplitting from './code-splitting';
import coreWebVitals from './core-web-vitals';
import designDeComponentes from './design-de-componentes';
import estrategiaDeTestes from './estrategia-de-testes';
import eventLoop from './event-loop';
import hidratacao from './hidratacao';
import ilhasEResumabilidade from './ilhas-e-resumabilidade';
import microFrontends from './micro-frontends';
import modelosDeRenderizacao from './modelos-de-renderizacao';
import padroesDeComposicao from './padroes-de-composicao';
import reflowRepaintComposite from './reflow-repaint-composite';
import renderingPath from './rendering-path';
import tiposDeEstado from './tipos-de-estado';
import treeShaking from './tree-shaking';
import vdomReatividade from './vdom-reatividade';

export { pacoteEn } from './termos';

/** As traducoes em ingles, pelo slug. Uma licao sem traducao aparece em portugues. */
export const traducoesEn: Record<string, TraducaoDeLicao> = {
  'acessibilidade': acessibilidade,
  'bundlers': bundlers,
  'cache-cliente': cacheCliente,
  'carregamento-de-recursos': carregamentoDeRecursos,
  'code-splitting': codeSplitting,
  'core-web-vitals': coreWebVitals,
  'design-de-componentes': designDeComponentes,
  'estrategia-de-testes': estrategiaDeTestes,
  'event-loop': eventLoop,
  'hidratacao': hidratacao,
  'ilhas-e-resumabilidade': ilhasEResumabilidade,
  'micro-frontends': microFrontends,
  'modelos-de-renderizacao': modelosDeRenderizacao,
  'padroes-de-composicao': padroesDeComposicao,
  'reflow-repaint-composite': reflowRepaintComposite,
  'rendering-path': renderingPath,
  'tipos-de-estado': tiposDeEstado,
  'tree-shaking': treeShaking,
  'vdom-reatividade': vdomReatividade,
};
