import { afterEach, describe, expect, it } from 'vitest';
import { CenaSchema, type CenaFonte } from '../schema/licao';
import { animar, criarMotor } from './motor';

/**
 * No jsdom nao existe Web Animations API: o motor tem que funcionar mesmo
 * assim, so saltando de estado. Estes testes cobrem o DOM que ele monta; a
 * animacao de verdade e coberta no Chromium (e2e/palco.spec.ts).
 */
const cena = (fonte: CenaFonte) => CenaSchema.parse(fonte);

const um = cena({
  foco: 'Um',
  entidades: {
    a: { pos: [0, 0], rotulo: 'Alfa', icone: 'cpu', etiquetas: [{ texto: 'ocupada', tom: 'ruim' }] },
    b: { tipo: 'placa', pos: [4, 0], rotulo: 'Beta <b>' },
  },
  ligacoes: { 'a-b': { de: 'a', para: 'b', rotulo: 'pede' } },
  fluxos: [{ rota: ['a-b'] }],
});

const dois = cena({
  foco: 'Dois',
  entidades: {
    b: { tipo: 'placa', pos: [1, 2], rotulo: 'Beta <b>' },
    c: { pos: [5, 0], rotulo: 'Gama' },
  },
  ligacoes: { 'b-c': { de: 'b', para: 'c' } },
});

let raiz: HTMLDivElement;
afterEach(() => raiz?.remove());

function montar() {
  raiz = document.createElement('div');
  document.body.append(raiz);
  return criarMotor(raiz);
}

describe('motor do palco', () => {
  it('monta pecas, ligacoes e rotulos da cena, e marca foco e estado', () => {
    const motor = montar();
    motor.irPara(um);
    expect(raiz.querySelectorAll('[data-entidade]')).toHaveLength(2);
    expect(raiz.querySelector('[data-ligacao="a-b"]')).not.toBeNull();
    expect(raiz.querySelector('.palco__rotulo-ligacao')?.textContent).toBe('pede');
    expect(raiz.querySelector('.palco__etiqueta')?.getAttribute('data-tom')).toBe('ruim');
    expect(raiz.dataset.foco).toBe('Um');
    expect(raiz.dataset.estado).toBe('pronto');
    motor.destruir();
  });

  it('escapa o texto do conteudo (nada de HTML injetado pelo rotulo)', () => {
    const motor = montar();
    motor.irPara(um);
    expect(raiz.querySelector('b')).toBeNull();
    expect(raiz.textContent).toContain('Beta <b>');
    motor.destruir();
  });

  it('cria o pool de pacotes uma vez, e trocar de passo nao cria nem remove pacotes', () => {
    const motor = montar();
    motor.irPara(um);
    const pacotes = [...raiz.querySelectorAll('.palco__pacote')];
    expect(pacotes.length).toBeGreaterThan(10);
    motor.irPara(dois);
    const depois = [...raiz.querySelectorAll('.palco__pacote')];
    expect(depois).toEqual(pacotes);
    motor.destruir();
  });

  it('na troca: quem saiu some, quem ficou e o MESMO elemento na nova posicao, quem entrou aparece', () => {
    const motor = montar();
    motor.irPara(um);
    const beta = raiz.querySelector('[data-entidade="b"]') as HTMLElement;
    const transformAntes = beta.style.transform;

    motor.irPara(dois);
    expect(raiz.querySelector('[data-entidade="a"]')).toBeNull();
    expect(raiz.querySelector('[data-entidade="b"]')).toBe(beta);
    expect(beta.style.transform).not.toBe(transformAntes);
    expect(raiz.querySelector('[data-entidade="c"]')).not.toBeNull();
    expect(raiz.querySelector('[data-ligacao="a-b"]')).toBeNull();
    expect(raiz.querySelector('[data-ligacao="b-c"]')).not.toBeNull();
    expect(raiz.dataset.foco).toBe('Dois');
    motor.destruir();
  });

  it('posiciona tudo por transform, nunca por left/top variaveis', () => {
    const motor = montar();
    motor.irPara(um);
    for (const peca of raiz.querySelectorAll<HTMLElement>('[data-entidade]')) {
      expect(peca.style.transform).toMatch(/^translate\(/);
      expect(peca.style.left).toBe('');
    }
    expect((raiz.querySelector('.palco__mundo') as HTMLElement).style.transform).toMatch(/scale\(/);
    motor.destruir();
  });

  it('repetir sem passo anterior remonta a cena do zero', () => {
    const motor = montar();
    motor.irPara(um);
    const alfa = raiz.querySelector('[data-entidade="a"]');
    motor.repetir();
    expect(raiz.querySelector('[data-entidade="a"]')).not.toBe(alfa);
    expect(raiz.querySelectorAll('[data-entidade]')).toHaveLength(2);
    motor.destruir();
  });

  it('pausar e retomar marcam o estado; destruir limpa a raiz', () => {
    const motor = montar();
    motor.irPara(um);
    motor.pausar();
    expect(raiz.dataset.pausado).toBe('sim');
    motor.retomar();
    expect(raiz.dataset.pausado).toBe('nao');
    motor.destruir();
    expect(raiz.childElementCount).toBe(0);
    expect(raiz.dataset.foco).toBeUndefined();
  });

  it('animar devolve null sem Web Animations, em vez de quebrar', () => {
    expect(animar(document.createElement('div'), [{ opacity: 0 }, { opacity: 1 }], { duration: 10 })).toBeNull();
  });
});
