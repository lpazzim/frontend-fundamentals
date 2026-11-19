import { Link, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { buscarLicoes } from '../busca/busca';
import { useTextos } from '../i18n/interface';
import { useCatalogo } from '../licoes/catalogo';
import { licaoConcluida, passosVistos, resumoDeProgresso, useProgresso } from '../progresso/progresso';
import { MODULOS, type Modulo } from '../schema/licao';
import { COR_DO_MODULO, Icone, Pasta } from '../ui/Icone';

/** A ordem dos modulos no menu e no inicio: a mesma do schema. */
export const ORDEM_MODULOS: readonly Modulo[] = MODULOS;

export function numeroDoModulo(modulo: Modulo): string {
  return String(ORDEM_MODULOS.indexOf(modulo) + 1).padStart(2, '0');
}

function slugDaRota(caminho: string): string | undefined {
  const [, raiz, slug] = caminho.split('/');
  return raiz === 'licao' ? slug : undefined;
}

/**
 * A barra lateral do curso: modulos como pastas, licoes como uma arvore e o
 * progresso no rodape. No desktop fica sempre a vista; em telas menores e uma
 * gaveta, e fechada fica fora da tela e inerte (fora do foco e do leitor de tela).
 */
export function Menu({
  id,
  gaveta,
  aberto,
  termo,
  aoFechar,
}: {
  id: string;
  gaveta: boolean;
  aberto: boolean;
  termo: string;
  aoFechar: () => void;
}) {
  const t = useTextos();
  const licoes = useCatalogo();
  const progresso = useProgresso();
  const slugAtual = useRouterState({ select: (s) => slugDaRota(s.location.pathname) });
  const moduloAtual = licoes.find((l) => l.slug === slugAtual)?.modulo;
  const achadas = buscarLicoes(licoes, termo);
  const buscando = termo.trim() !== '';

  // Comeca com o modulo da licao aberta; abrir outra licao abre o modulo dela.
  const [abertos, setAbertos] = useState<Set<Modulo>>(() => new Set([moduloAtual ?? ORDEM_MODULOS[0]!]));
  const [ultimoModulo, setUltimoModulo] = useState(moduloAtual);
  if (moduloAtual !== ultimoModulo) {
    setUltimoModulo(moduloAtual);
    if (moduloAtual && !abertos.has(moduloAtual)) setAbertos(new Set(abertos).add(moduloAtual));
  }

  function alternar(modulo: Modulo) {
    const proximo = new Set(abertos);
    if (proximo.has(modulo)) proximo.delete(modulo);
    else proximo.add(modulo);
    setAbertos(proximo);
  }

  const visivel = !gaveta || aberto;

  return (
    <aside
      id={id}
      className="lateral"
      aria-label={t.menu.licoes}
      data-gaveta={gaveta}
      data-aberto={aberto}
      inert={!visivel}
    >
      <div className="arvore-raiz">
        <svg className="arvore-raiz__pasta" width="20" height="17" viewBox="0 0 19 16" aria-hidden="true">
          <path d="M1.6 3.1c0-.9.7-1.6 1.6-1.6h3.9l1.8 2h6.9c.9 0 1.6.7 1.6 1.6v8.3c0 .9-.7 1.6-1.6 1.6H3.2c-.9 0-1.6-.7-1.6-1.6z" />
        </svg>
        <span>{t.menu.curso}</span>
        <span className="arvore-raiz__meta">{t.menu.totalDeLicoes(licoes.length)}</span>
        {gaveta ? (
          <button type="button" className="gaveta-fechar" onClick={aoFechar} aria-label={t.menu.fecharCurso}>
            <Icone nome="fechar" tamanho={15} />
          </button>
        ) : null}
      </div>

      <nav className="curso" aria-label={t.menu.curso}>
        {achadas.length === 0 ? (
          <p className="curso__vazio" data-testid="busca-vazia">
            {t.menu.nenhumaLicao(termo)}
          </p>
        ) : null}
        {ORDEM_MODULOS.map((modulo) => {
          const todas = licoes.filter((l) => l.modulo === modulo);
          const doModulo = achadas.filter((l) => l.modulo === modulo);
          if (doModulo.length === 0) return null;
          const expandido = buscando || abertos.has(modulo);
          const concluidas = todas.filter((l) => licaoConcluida(progresso, l.slug, l.passos.length)).length;
          return (
            <section key={modulo} className="modulo" data-aberto={expandido}>
              <button
                type="button"
                className="modulo__cabeca"
                aria-expanded={expandido}
                onClick={() => alternar(modulo)}
              >
                <Icone nome="chevronDireita" tamanho={13} traco={2.2} className="modulo__chevron" />
                <Pasta cor={COR_DO_MODULO[modulo]} />
                <span className="modulo__titulo">
                  {numeroDoModulo(modulo)}. {t.modulos[modulo]}
                </span>
                <span className="modulo__contagem">
                  {concluidas}/{todas.length}
                </span>
              </button>
              <ol className="modulo__licoes" hidden={!expandido}>
                {doModulo.map((licao) => {
                  const atual = licao.slug === slugAtual;
                  const feita = licaoConcluida(progresso, licao.slug, licao.passos.length);
                  const comecada = passosVistos(progresso, licao.slug, licao.passos.length) > 0;
                  return (
                    <li key={licao.slug} className="licao-item" data-atual={atual} data-feita={feita}>
                      <Link
                        to="/licao/$slug/$passo"
                        params={{ slug: licao.slug, passo: '1' }}
                        className="licao-item__link"
                        aria-current={atual ? 'page' : undefined}
                        data-testid={`menu-${licao.slug}`}
                        onClick={aoFechar}
                      >
                        <Icone
                          nome={atual ? 'arquivo' : feita ? 'circuloFeito' : 'circulo'}
                          tamanho={15}
                          traco={1.5}
                          className="licao-item__marca"
                        />
                        <span className="licao-item__titulo" title={licao.titulo}>
                          {licao.titulo}
                        </span>
                        <span
                          className="licao-item__progresso"
                          data-comecada={comecada}
                          data-testid={`menu-progresso-${licao.slug}`}
                        >
                          {resumoDeProgresso(progresso, licao.slug, licao.passos.length)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </nav>

      <Progresso />
    </aside>
  );
}

/** Rodape da barra lateral: quantas licoes o leitor concluiu, por modulo. */
function Progresso() {
  const t = useTextos();
  const licoes = useCatalogo();
  const progresso = useProgresso();
  const [aberto, setAberto] = useState(false);
  const concluidas = licoes.filter((l) => licaoConcluida(progresso, l.slug, l.passos.length)).length;

  return (
    <section className="card progresso" data-aberto={aberto}>
      <button type="button" className="progresso__cabeca" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        <span className="eyebrow">{t.menu.progresso}</span>
        <span className="progresso__total" data-testid="progresso-total">
          {concluidas} / {licoes.length}
        </span>
        <Icone nome="chevronDireita" tamanho={14} traco={2.2} className="progresso__chevron" />
      </button>
      <div className="progresso__corpo" hidden={!aberto}>
        <div className="barra" aria-hidden="true">
          <span style={{ transform: `scaleX(${concluidas / Math.max(1, licoes.length)})` }} />
        </div>
        <ul className="progresso__lista">
          {ORDEM_MODULOS.map((modulo) => {
            const todas = licoes.filter((l) => l.modulo === modulo);
            const feitas = todas.filter((l) => licaoConcluida(progresso, l.slug, l.passos.length)).length;
            const estado = feitas === todas.length ? 'on' : feitas > 0 ? 'parcial' : 'off';
            return (
              <li key={modulo}>
                <span className="caixa-check" data-estado={estado}>
                  <Icone nome="check" tamanho={11} traco={3} />
                </span>
                <span>{t.modulos[modulo]}</span>
                <span className="progresso__contagem">
                  {feitas}/{todas.length}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
