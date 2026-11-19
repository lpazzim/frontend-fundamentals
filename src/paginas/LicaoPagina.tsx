import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { Suspense, use, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useIdioma } from '../i18n/idiomas';
import { useTextos } from '../i18n/interface';
import { useCatalogo } from '../licoes/catalogo';
import { carregarLicao, licaoCarregada } from '../licoes/carregar';
import { Laboratorio, reacaoDoPalco } from '../laboratorio/Laboratorio';
import { Palco, type AlcaDoPalco } from '../palco/Palco';
import type { Medicao } from '../medicao/medicao';
import { PainelMetricas } from '../medicao/PainelMetricas';
import { registrarVisita, useProgresso } from '../progresso/progresso';
import { numeroDoModulo } from './Menu';
import type { Fonte, Licao } from '../schema/licao';
import { ehPrimeiro, ehUltimo, normalizarPasso, passoAnterior, proximoPasso } from '../passos/passo';
import { Icone } from '../ui/Icone';

/**
 * A rota carrega a licao antes de abrir a pagina (loader), entao no caminho
 * normal ela ja esta pronta e nada suspende entre um passo e outro. So na troca
 * de idioma a licao no idioma novo pode ainda estar a caminho: ai o Suspense
 * segura o aviso de carregamento por um instante.
 */
export function LicaoPagina() {
  const t = useTextos();
  return (
    <Suspense
      fallback={
        <main className="folha folha--larga pagina" aria-busy="true">
          <p className="pagina__aviso">{t.licao.carregando}</p>
        </main>
      }
    >
      <LicaoDoIdioma />
    </Suspense>
  );
}

function LicaoDoIdioma() {
  const t = useTextos();
  const idioma = useIdioma();
  const { slug, passo } = useParams({ from: '/licao/$slug/$passo' });
  const pronta = licaoCarregada(slug, idioma);
  const licao = pronta === undefined ? use(carregarLicao(slug, idioma)) : pronta;

  if (!licao) {
    return (
      <main className="folha folha--larga pagina">
        <h1>{t.naoEncontrada.licao}</h1>
        <p>
          {t.naoEncontrada.semSlug} <code>{slug}</code>.
        </p>
        <Link to="/">{t.naoEncontrada.voltarAoInicio}</Link>
      </main>
    );
  }

  // key: trocar de licao zera a ultima medicao em vez de herda-la.
  return <LicaoCarregada key={licao.slug} licao={licao} passoBruto={passo} />;
}

/**
 * Trilho apertado: com muitos passos numa coluna estreita, so o rotulo do
 * passo atual aparece (os outros ficam no title). Mede a largura real.
 */
function useTrilhoApertado(total: number) {
  const ref = useRef<HTMLOListElement>(null);
  const [apertado, setApertado] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => setApertado(el.clientWidth / total < 74);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [total]);
  return { ref, apertado };
}

function LicaoCarregada({ licao, passoBruto }: { licao: Licao; passoBruto: string }) {
  const t = useTextos();
  const licoes = useCatalogo();
  const total = licao.passos.length;
  const atual = normalizarPasso(total, passoBruto);
  const passo = licao.passos[atual - 1]!;
  const anterior = passoAnterior(atual);
  const proximo = proximoPasso(total, atual);

  // Direcao da navegacao: o texto do guia entra pelo lado de onde o leitor veio.
  const [passoVisto, setPassoVisto] = useState(atual);
  const [direcao, setDirecao] = useState<1 | -1>(1);
  if (passoVisto !== atual) {
    setDirecao(atual > passoVisto ? 1 : -1);
    setPassoVisto(atual);
  }

  // A medicao mora aqui (e nao no Laboratorio) porque o painel e irmao dele e
  // sobrevive a troca de passo: o leitor compara a interacao com cada narracao.
  const [medicao, setMedicao] = useState<Medicao | null>(null);
  const palco = useRef<AlcaDoPalco>(null);
  // Os chips existem em todos os passos se existirem em algum: trocar de passo nao mexe no palco.
  const temMetricas = licao.passos.some((p) => p.cena.metricas.length > 0);

  function aoMedir(nova: Medicao) {
    setMedicao(nova);
    // O palco mostra o que o painel mede: um pacote a partir do estagio que a mudanca reabre.
    const reacao = reacaoDoPalco(nova.estagio);
    palco.current?.pulsar(reacao.pulsar);
    if (reacao.rota.length > 0) palco.current?.disparar(reacao.rota, reacao.tipo);
  }

  // Ver um passo e registrar progresso. Roda na URL, entao deep link tambem conta.
  useEffect(() => {
    registrarVisita(licao.slug, atual);
  }, [licao.slug, atual]);

  const atalhosAtivos = useAtalhosDeTeclado({ slug: licao.slug, anterior, proximo, atual });
  const trilho = useTrilhoApertado(total);

  const progresso = useProgresso();
  const vistos = new Set(progresso[licao.slug]?.vistos ?? []);
  const comLaboratorio = Boolean(licao.laboratorio);
  const doModulo = licoes.filter((l) => l.modulo === licao.modulo);
  const posicaoNoModulo = doModulo.findIndex((l) => l.slug === licao.slug) + 1;
  const destaque = Object.values(passo.cena.entidades).find((e) => e.destaque);
  const fidelidade = t.licao.fidelidade[licao.fidelidade];
  const medido = licao.fidelidade === 'medido';
  const textoDoProximo = ehUltimo(total, atual) ? t.licao.fim : t.licao.proximo(licao.passos[proximo - 1]!.titulo);

  return (
    <>
      <main
        className="folha licao"
        data-com-laboratorio={comLaboratorio}
        data-atalhos={atalhosAtivos ? 'ativo' : 'inativo'}
      >
        <header className="licao-cabeca entra">
          <p className="trilha">
            {numeroDoModulo(licao.modulo)}. {t.modulos[licao.modulo]}
            <span aria-hidden="true">/</span>
            {t.licao.licaoDe(posicaoNoModulo, doModulo.length)}
          </p>
          <div className="licao-cabeca__linha">
            <h1 className="titulo" title={licao.titulo}>
              {licao.titulo}
            </h1>
            <ul className="selos">
              <li className="selo selo--areia">
                <Icone nome="relogio" tamanho={14} />
                {t.licao.minutos(licao.minutos)}
              </li>
              <li className="selo selo--menta">
                <Icone nome="barras" tamanho={14} />
                {t.dificuldades[licao.dificuldade]}
              </li>
              <li className="selo selo--violeta">
                <Icone nome="lista" tamanho={14} />
                {t.licao.passos(total)}
              </li>
              <li
                className="selo selo--azul"
                data-testid="selo-fidelidade"
                data-fidelidade={licao.fidelidade}
                title={fidelidade.titulo}
              >
                <Icone nome={medido ? 'frasco' : 'filme'} tamanho={14} />
                {fidelidade.rotulo}
              </li>
            </ul>
          </div>
          <p className="subtitulo" title={licao.resumo}>
            {licao.resumo}
          </p>
        </header>

        <Palco cena={passo.cena} semente={`${licao.slug}:${atual}`} reservarMetricas={temMetricas} alca={palco} />

        {comLaboratorio ? (
          <div className="licao__instrumentos">
            <Laboratorio onMedicao={aoMedir} />
            <PainelMetricas ativo={passo.cena.foco} medicao={medicao} comInteracao />
          </div>
        ) : null}

        <nav className="card trilho entra" aria-label={t.licao.passosDaLicao} data-apertado={trilho.apertado}>
          <div className="trilho__cabeca">
            <span className="eyebrow">{t.licao.nestaLicao}</span>
            <span className="trilho__contagem">{t.licao.passoDe(atual, total)}</span>
          </div>
          <div className="trilho__pista" style={{ '--n': total } as CSSProperties}>
            <div className="trilho__linha" aria-hidden="true">
              <span style={{ transform: `scaleX(${total > 1 ? (atual - 1) / (total - 1) : 1})` }} />
            </div>
            <ol ref={trilho.ref}>
              {licao.passos.map((p, i) => {
                const numero = i + 1;
                return (
                  <li key={p.id}>
                    <Link
                      to="/licao/$slug/$passo"
                      params={{ slug: licao.slug, passo: String(numero) }}
                      className="trilho__item"
                      aria-current={numero === atual ? 'step' : undefined}
                      data-ativo={numero === atual}
                      data-visto={vistos.has(numero) || numero < atual}
                      title={p.titulo}
                    >
                      <span className="trilho__numero">{numero}</span>
                      <span className="trilho__rotulo">{p.titulo}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
          <p key={atual} className="trilho__atual" aria-hidden="true">
            {passo.titulo}
          </p>
        </nav>
      </main>

      <aside className="coluna">
        <section className="card guia" aria-live="polite">
          <div className="guia__meta">
            <span className="eyebrow">{t.licao.passoCurto(atual, total)}</span>
            <span key={`${atual}-${passo.cena.foco}`} className="capitulo" data-cor={destaque?.cor ?? 'neutro'}>
              {passo.cena.foco}
            </span>
          </div>

          <div
            key={atual}
            className="guia__conteudo"
            data-testid="guia"
            style={{ '--deslize': `${direcao * 14}px` } as CSSProperties}
          >
            <h2 className="guia__titulo" data-testid="titulo-passo">
              {passo.titulo}
            </h2>
            <div className="guia__corpo">
              <p data-testid="narracao-passo">{passo.narracao}</p>
            </div>
            {passo.cena.nota ? (
              <div className="aviso aviso--ideia">
                <span className="aviso__icone">
                  <Icone nome="brilho" tamanho={15} />
                </span>
                <div>
                  <p className="aviso__titulo">{t.licao.naCena}</p>
                  <p>{passo.cena.nota}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="guia__nav">
            <Link
              to="/licao/$slug/$passo"
              params={{ slug: licao.slug, passo: String(anterior) }}
              className="botao-fantasma"
              aria-disabled={ehPrimeiro(atual)}
              data-testid="voltar"
            >
              <Icone nome="setaEsquerda" />
              {t.licao.voltar}
            </Link>
            <Link
              to="/licao/$slug/$passo"
              params={{ slug: licao.slug, passo: String(proximo) }}
              className="botao-pop botao-proximo"
              aria-disabled={ehUltimo(total, atual)}
              data-testid="avancar"
              title={textoDoProximo}
            >
              <span className="botao-proximo__rotulo">{textoDoProximo}</span>
              <Icone nome="setaDireita" />
            </Link>
          </div>
          <p className="guia__dica">
            <Icone nome="teclado" tamanho={14} />
            <span>
              <kbd>←</kbd> <kbd>→</kbd> {t.licao.atalhos.passo} · <kbd>R</kbd> {t.licao.atalhos.repetir} ·{' '}
              <kbd>{t.licao.atalhos.espaco}</kbd> {t.licao.atalhos.pausar}
            </span>
          </p>
        </section>

        {licao.objetivos.length > 0 ? (
          <section className="card objetivos entra" aria-label={t.licao.vaiAprender}>
            <h2 className="eyebrow">{t.licao.vaiAprender}</h2>
            <ul>
              {licao.objetivos.map((objetivo) => {
                const alcancado = atual >= objetivo.passo;
                return (
                  <li key={objetivo.texto} data-alcancado={alcancado}>
                    <span className="caixa-check" data-estado={alcancado ? 'on' : 'off'}>
                      <Icone nome="check" tamanho={11} traco={3} />
                    </span>
                    {objetivo.texto}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {licao.fontes.length > 0 ? <FontesDaLicao fontes={licao.fontes} /> : null}
      </aside>
    </>
  );
}

/**
 * "Para estudar": as referencias da licao, fechadas por padrao para nao
 * roubar altura do guia. Fica montado entre passos, entao aberto continua aberto.
 * O titulo de cada fonte leva o lang do material: um leitor de tela pronuncia
 * um titulo em ingles como ingles.
 */
function FontesDaLicao({ fontes }: { fontes: Fonte[] }) {
  const t = useTextos();
  const [aberto, setAberto] = useState(false);
  const idDaLista = useId();

  return (
    <section className="card fontes" data-aberto={aberto} aria-label={t.fontes.rotulo} data-testid="fontes">
      <button
        type="button"
        className="fontes__cabeca"
        aria-expanded={aberto}
        aria-controls={idDaLista}
        onClick={() => setAberto(!aberto)}
        data-testid="fontes-alternar"
      >
        <Icone nome="livro" tamanho={15} />
        <span className="eyebrow">{t.fontes.titulo}</span>
        <span className="fontes__total">{t.fontes.total(fontes.length)}</span>
        <Icone nome="chevronDireita" tamanho={14} traco={2.2} className="fontes__chevron" />
      </button>
      <ul id={idDaLista} className="fontes__lista" hidden={!aberto}>
        {fontes.map((fonte) => (
          <li key={fonte.url}>
            <a className="fonte" href={fonte.url} target="_blank" rel="noreferrer" data-testid="fonte">
              <span className="fonte__titulo" lang={fonte.idioma}>
                {fonte.titulo}
              </span>
              <span className="visualmente-oculto"> {t.fontes.novaAba}</span>
              <span className="fonte__meta">
                <span>{fonte.origem}</span>
                <span aria-hidden="true">·</span>
                <span>{t.fontes.tipos[fonte.tipo]}</span>
                <abbr className="fonte__idioma" title={t.fontes.idiomaDoMaterial(fonte.idioma)}>
                  {fonte.idioma.split('-')[0]!.toUpperCase()}
                </abbr>
              </span>
              {fonte.nota ? <span className="fonte__nota">{fonte.nota}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Setas do teclado navegam entre passos. Como o passo mora na URL, isto e so
 * uma navegacao: nao ha um segundo estado para sincronizar.
 *
 * Devolve se o listener ja esta no ar. Entre o HTML aparecer na tela e este
 * efeito rodar existe uma janela em que a pagina parece pronta e nao responde
 * ao teclado -- a mesma janela que a licao sobre hidratacao vai ensinar. O
 * atributo data-atalhos expoe esse estado para o teste nao precisar de sleep.
 */
function useAtalhosDeTeclado({
  slug,
  anterior,
  proximo,
  atual,
}: {
  slug: string;
  anterior: number;
  proximo: number;
  atual: number;
}): boolean {
  const navegar = useNavigate();
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    function aoPressionar(evento: KeyboardEvent) {
      if (evento.defaultPrevented || evento.metaKey || evento.ctrlKey || evento.altKey) return;
      const alvo = evento.target;
      if (alvo instanceof HTMLElement && (alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName))) {
        return; // setas dentro da busca movem o cursor, nao o passo
      }
      const destino =
        evento.key === 'ArrowRight' ? proximo : evento.key === 'ArrowLeft' ? anterior : null;
      if (destino === null || destino === atual) return;
      evento.preventDefault();
      void navegar({ to: '/licao/$slug/$passo', params: { slug, passo: String(destino) } });
    }

    window.addEventListener('keydown', aoPressionar);
    setAtivo(true);
    return () => window.removeEventListener('keydown', aoPressionar);
  }, [slug, anterior, proximo, atual, navegar]);

  return ativo;
}
