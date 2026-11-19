import { useEffect, useRef, useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  lazyRouteComponent,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { InicioPagina } from './paginas/InicioPagina';
import { Menu } from './paginas/Menu';
import { alternarTema, useDisposicao, useTema } from './janela';
import { assinarIdioma, definirIdioma, idiomaAtivo, IDIOMAS, useIdioma } from './i18n/idiomas';
import { textos, useTextos } from './i18n/interface';
import { useCatalogo } from './licoes/catalogo';
import { carregarLicao } from './licoes/carregar';
import { licaoConcluida, useProgresso } from './progresso/progresso';
import { Icone, Logo } from './ui/Icone';

const SLUG_DO_LABORATORIO = 'reflow-repaint-composite';

/**
 * Seletor de idioma do topo: um botao por idioma, o ativo marcado com
 * aria-pressed. Cada opcao se apresenta no proprio idioma ("English",
 * "Português") e leva o lang dele, para o leitor de tela pronunciar certo.
 */
function SeletorDeIdioma() {
  const t = useTextos();
  const ativo = useIdioma();
  return (
    <div className="idioma" role="group" aria-label={t.idioma.seletor}>
      <Icone nome="globo" />
      {IDIOMAS.map((idioma) => {
        const dele = textos(idioma).idioma;
        return (
          <button
            key={idioma}
            type="button"
            className="idioma__opcao"
            lang={idioma}
            aria-pressed={idioma === ativo}
            title={idioma === ativo ? dele.endonimo : t.idioma.trocarPara(dele.endonimo)}
            onClick={() => definirIdioma(idioma)}
            data-testid={`idioma-${idioma}`}
          >
            {dele.sigla}
            <span className="visualmente-oculto"> ({dele.endonimo})</span>
          </button>
        );
      })}
    </div>
  );
}

/** "Aprender" leva para a primeira licao que o leitor ainda nao concluiu. */
function useLicaoParaContinuar(): string {
  const licoes = useCatalogo();
  const progresso = useProgresso();
  const pendente = licoes.find((l) => !licaoConcluida(progresso, l.slug, l.passos.length));
  return (pendente ?? licoes[0]!).slug;
}

function Topo({
  menuAberto,
  aoAlternarMenu,
  termo,
  aoBuscar,
  buscaRef,
}: {
  menuAberto: boolean;
  aoAlternarMenu: () => void;
  termo: string;
  aoBuscar: (termo: string) => void;
  buscaRef: React.RefObject<HTMLInputElement | null>;
}) {
  const t = useTextos();
  const tema = useTema();
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const continuar = useLicaoParaContinuar();
  const naLicao = caminho.startsWith('/licao/');
  const noLaboratorio = caminho.startsWith(`/licao/${SLUG_DO_LABORATORIO}`);
  const ehMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="topo">
      <button
        type="button"
        className="menu-botao"
        aria-expanded={menuAberto}
        aria-controls="menu-licoes"
        aria-label={t.topo.abrirCurso}
        onClick={aoAlternarMenu}
        data-testid="abrir-menu"
      >
        <Icone nome="menu" tamanho={18} />
      </button>
      <Link to="/" className="marca" aria-label={t.topo.marca}>
        <Logo />
        <span className="marca__nome">
          Render <span>Lab</span>
        </span>
      </Link>

      <nav className="navegacao" aria-label={t.topo.secoes}>
        <Link
          to="/licao/$slug"
          params={{ slug: continuar }}
          className={`navegacao__item${naLicao && !noLaboratorio ? ' is-ativo' : ''}`}
        >
          <Icone nome="livro" />
          <span>{t.topo.aprender}</span>
        </Link>
        <button type="button" className="navegacao__item" aria-disabled="true" title={t.topo.emBreve}>
          <Icone nome="alvo" />
          <span>{t.topo.pratica}</span>
        </button>
        <Link
          to="/licao/$slug/$passo"
          params={{ slug: SLUG_DO_LABORATORIO, passo: '1' }}
          className={`navegacao__item${noLaboratorio ? ' is-ativo' : ''}`}
        >
          <Icone nome="frasco" />
          <span>{t.topo.laboratorio}</span>
        </Link>
        <Link to="/" className={`navegacao__item${caminho === '/' ? ' is-ativo' : ''}`}>
          <Icone nome="grade" />
          <span>{t.topo.resumos}</span>
        </Link>
      </nav>

      <label className="busca">
        <Icone nome="busca" />
        <input
          ref={buscaRef}
          type="search"
          placeholder={t.topo.buscarPlaceholder}
          aria-label={t.topo.buscarRotulo}
          value={termo}
          onChange={(e) => aoBuscar(e.target.value)}
          data-testid="busca"
        />
        <kbd>{ehMac ? '⌘ K' : 'Ctrl K'}</kbd>
      </label>

      <SeletorDeIdioma />
      <button
        type="button"
        className="botao-tema"
        onClick={alternarTema}
        aria-label={tema === 'escuro' ? t.topo.paraTemaClaro : t.topo.paraTemaEscuro}
        title={tema === 'escuro' ? t.topo.temaClaro : t.topo.temaEscuro}
        data-testid="alternar-tema"
      >
        <Icone nome={tema === 'escuro' ? 'sol' : 'lua'} />
      </button>
      <a className="credito" href="https://designed-to-scale.vercel.app/" target="_blank" rel="noreferrer">
        <span className="credito__x">
          <Icone nome="externo" tamanho={15} traco={2.2} />
        </span>
        <span className="credito__texto">
          <small>{t.topo.inspiradoEm}</small>
          <b>
            <span>designed-to-scale</span>
          </b>
        </span>
      </a>
    </header>
  );
}

/**
 * Layout raiz: topo, barra lateral com o curso e o conteudo da rota. No
 * desktop a barra lateral fica sempre a vista (como no designed-to-scale);
 * em telas menores ela vira uma gaveta aberta pelo botao do topo.
 */
function Raiz() {
  const disposicao = useDisposicao();
  const gaveta = disposicao !== 'desktop';
  const [menuAberto, setMenuAberto] = useState(false);
  const [termo, setTermo] = useState('');
  const buscaRef = useRef<HTMLInputElement>(null);
  const fechar = () => setMenuAberto(false);

  // Virou desktop: nao ha gaveta para ficar aberta.
  if (!gaveta && menuAberto) setMenuAberto(false);

  useEffect(() => {
    const aoPressionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAberto(false);
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
        evento.preventDefault();
        buscaRef.current?.focus();
        buscaRef.current?.select();
      }
    };
    window.addEventListener('keydown', aoPressionar);
    return () => window.removeEventListener('keydown', aoPressionar);
  }, []);

  function buscar(valor: string) {
    setTermo(valor);
    // Na gaveta, o resultado da busca so aparece com ela aberta.
    if (gaveta && valor.trim()) setMenuAberto(true);
  }

  return (
    <div className="janela">
      <Topo
        menuAberto={menuAberto}
        aoAlternarMenu={() => setMenuAberto((aberto) => !aberto)}
        termo={termo}
        aoBuscar={buscar}
        buscaRef={buscaRef}
      />
      <div className="corpo">
        <Menu id="menu-licoes" gaveta={gaveta} aberto={menuAberto} termo={termo} aoFechar={fechar} />
        {gaveta ? <div className="veu" data-aberto={menuAberto} onClick={fechar} aria-hidden="true" /> : null}
        <Outlet />
      </div>
    </div>
  );
}

function NaoEncontrada() {
  const t = useTextos();
  return (
    <main className="folha folha--larga pagina">
      <h1>{t.naoEncontrada.pagina}</h1>
      <Link to="/">{t.naoEncontrada.voltarAoInicio}</Link>
    </main>
  );
}

const rotaRaiz = createRootRoute({
  component: Raiz,
  notFoundComponent: NaoEncontrada,
});

const rotaInicio = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/',
  component: InicioPagina,
});

/** /licao/rendering-path sem passo cai no passo 1. */
const rotaLicaoSemPasso = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/licao/$slug',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/licao/$slug/$passo',
      params: { slug: params.slug, passo: '1' },
      replace: true,
    });
  },
});

function CarregandoLicao() {
  const t = useTextos();
  return (
    <main className="folha folha--larga pagina" aria-busy="true">
      <p className="pagina__aviso">{t.licao.carregando}</p>
    </main>
  );
}

function ErroAoCarregar() {
  const t = useTextos();
  const router = useRouter();
  return (
    <main className="folha folha--larga pagina" role="alert">
      <p className="pagina__aviso">{t.licao.erroAoCarregar}</p>
      <button type="button" className="botao-fantasma" onClick={() => void router.invalidate()}>
        {t.licao.tentarDeNovo}
      </button>
    </main>
  );
}

/**
 * A pagina da licao (palco, motor, laboratorio) e o conteudo de cada licao
 * sao chunks proprios. O loader baixa o conteudo antes de trocar de pagina, e
 * com defaultPreload: 'intent' isso ja comeca quando o ponteiro passa no link.
 */
const rotaLicao = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/licao/$slug/$passo',
  loader: ({ params }) => carregarLicao(params.slug, idiomaAtivo()),
  component: lazyRouteComponent(() => import('./paginas/LicaoPagina'), 'LicaoPagina'),
  pendingComponent: CarregandoLicao,
  errorComponent: ErroAoCarregar,
});

const arvoreDeRotas = rotaRaiz.addChildren([rotaInicio, rotaLicaoSemPasso, rotaLicao]);

export const router = createRouter({ routeTree: arvoreDeRotas, defaultPreload: 'intent' });

// Trocou o idioma: os loaders rodam de novo e buscam a licao aberta no idioma novo.
assinarIdioma(() => void router.invalidate());

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
