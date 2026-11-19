import { Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useTextos } from '../i18n/interface';
import { useCatalogo } from '../licoes/catalogo';
import { resumoDeProgresso, useProgresso } from '../progresso/progresso';
import { COR_DO_MODULO, Icone, Pasta } from '../ui/Icone';
import { ORDEM_MODULOS, numeroDoModulo } from './Menu';

/** "Resumos": o catalogo inteiro, uma secao por modulo, um cartao por licao. */
export function InicioPagina() {
  const t = useTextos();
  const licoes = useCatalogo();
  const progresso = useProgresso();
  let ordem = 0;

  return (
    <main className="folha folha--larga inicio">
      <header className="inicio__cabecalho entra">
        <p className="trilha">{t.app.nome}</p>
        <h1>{t.inicio.titulo}</h1>
        <p className="inicio__pitch">{t.inicio.pitch}</p>
      </header>

      {ORDEM_MODULOS.map((modulo) => {
        const doModulo = licoes.filter((l) => l.modulo === modulo);
        if (doModulo.length === 0) return null;
        return (
          <section key={modulo} className="inicio__modulo" aria-label={t.modulos[modulo]}>
            <h2 className="inicio__modulo-titulo">
              <Pasta cor={COR_DO_MODULO[modulo]} />
              {numeroDoModulo(modulo)}. {t.modulos[modulo]}
            </h2>
            <ul className="inicio__licoes">
              {doModulo.map((licao, i) => {
                const atraso = { animationDelay: `${ordem++ * 45}ms` } as CSSProperties;
                const feito = resumoDeProgresso(progresso, licao.slug, licao.passos.length);
                return (
                  <li key={licao.slug}>
                    <Link
                      to="/licao/$slug/$passo"
                      params={{ slug: licao.slug, passo: '1' }}
                      className="cartao"
                      style={atraso}
                    >
                      <span className="cartao__modulo">{t.licao.licaoDe(i + 1, doModulo.length)}</span>
                      <span className="cartao__titulo">{licao.titulo}</span>
                      <span className="cartao__resumo">{licao.resumo}</span>
                      <span className="cartao__rodape">
                        <span className="selo selo--areia">
                          <Icone nome="relogio" tamanho={14} />
                          {t.licao.minutos(licao.minutos)}
                        </span>
                        <span className="selo selo--menta">
                          <Icone nome="barras" tamanho={14} />
                          {t.dificuldades[licao.dificuldade]}
                        </span>
                        <span className="selo selo--violeta">
                          <Icone nome="lista" tamanho={14} />
                          {t.licao.passos(licao.passos.length)}
                        </span>
                        {feito ? <span className="cartao__progresso">{feito}</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
