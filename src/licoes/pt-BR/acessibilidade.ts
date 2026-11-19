import type { EntidadeFonte, LicaoFonte } from '../../schema/licao';
import { sobre } from '../autoria';

/**
 * Acessibilidade como mais uma arvore do browser. Os limites de contraste sao
 * os das WCAG 2.2 (criterios 1.4.3 e 1.4.11, nivel AA).
 */
const dom: EntidadeFonte = { pos: [-4.6, 0], rotulo: 'DOM', sub: 'nós', icone: 'arvore', cor: 'azul' };
const arvore: EntidadeFonte = { pos: [0, 0], rotulo: 'Árvore a11y', sub: 'papel e nome', icone: 'arvore', cor: 'verde' };
const leitor: EntidadeFonte = { pos: [4.6, 0], rotulo: 'Leitor', sub: 'de tela', icone: 'usuario', cor: 'neutro' };

const botao: EntidadeFonte = { pos: [-4.6, -2.6], rotulo: '<button>', sub: 'nativo', icone: 'arquivo', cor: 'verde' };
const div: EntidadeFonte = { pos: [-4.6, 2.6], rotulo: '<div onClick>', sub: 'genérico', icone: 'arquivo', cor: 'laranja' };
const aba: EntidadeFonte = { pos: [-4.6, 0], rotulo: 'role="tab"', sub: 'aria-*', icone: 'arquivo', cor: 'roxo' };

const pagina: EntidadeFonte = { tipo: 'placa', pos: [0, 0.6], rotulo: 'Página', icone: 'tela', cor: 'amarelo', tamanho: [6, 2.4] };
const POSICAO = [-1.9, 0, 1.9] as const;
const focavel = (i: 0 | 1 | 2, rotulo: string, sub: string): EntidadeFonte => ({
  tipo: 'cartao',
  pos: sobre(pagina.pos, POSICAO[i], 0),
  rotulo,
  sub,
  cor: 'neutro',
  tamanho: [1.6, 1.6],
});
const teclado: EntidadeFonte = { pos: [-5.4, -1.2], rotulo: 'Teclado', icone: 'usuario', cor: 'neutro' };

const regiao: EntidadeFonte = { tipo: 'placa', pos: [0, 0.6], rotulo: 'aria-live', sub: 'polite', icone: 'raio', cor: 'roxo', tamanho: [3.6, 2.4] };
const acao: EntidadeFonte = { pos: [-5, -1.4], rotulo: 'Salvar', sub: 'clique', icone: 'usuario', cor: 'amarelo' };

type Nivel = 'neutro' | 'bom' | 'alerta' | 'ruim';
const m = (rotulo: string, valor: string, nivel: Nivel = 'neutro') => ({ rotulo, valor, nivel });

export const acessibilidade: LicaoFonte = {
  slug: 'acessibilidade',
  modulo: 'qualidade',
  titulo: 'Acessibilidade e semântica',
  resumo:
    'HTML semântico como base gratuita, a árvore de acessibilidade, foco pelo teclado, contraste e aria-live para conteúdo que muda sozinho.',
  dificuldade: 'intermediario',
  minutos: 10,
  objetivos: [
    { texto: 'O que é a árvore de acessibilidade', passo: 1 },
    { texto: 'Por que HTML semântico vem antes do ARIA', passo: 2 },
    { texto: 'O que o ARIA faz e o que não faz', passo: 3 },
    { texto: 'Foco e navegação pelo teclado', passo: 4 },
    { texto: 'Contraste mínimo das WCAG', passo: 5 },
    { texto: 'Anunciar mudanças com aria-live', passo: 6 },
  ],
  passos: [
    {
      id: 'arvore',
      titulo: 'O browser monta mais uma árvore',
      narracao:
        'Além do DOM e da render tree, o browser monta a árvore de acessibilidade. Para cada elemento relevante ela guarda um papel (botão, link, título), um nome acessível e um estado (marcado, expandido). Leitores de tela, comandos de voz e testes com getByRole leem esta árvore, não os pixels. Se algo não está nela, para essas pessoas não existe.',
      cena: {
        foco: 'Árvore de acessibilidade',
        entidades: { dom, arvore: { ...arvore, destaque: true }, leitor },
        ligacoes: {
          deriva: { de: 'dom', para: 'arvore', rotulo: 'deriva' },
          anuncia: { de: 'arvore', para: 'leitor', rotulo: 'anuncia' },
        },
        fluxos: [{ rota: ['deriva', 'anuncia'], taxa: 0.9 }],
        metricas: [m('Papel', 'button'), m('Nome', '"Salvar"'), m('Estado', 'expandido: não')],
      },
    },
    {
      id: 'semantica',
      titulo: 'HTML semântico é acessibilidade de graça',
      narracao:
        'Um <button> já vem com papel de botão, entra na ordem do Tab, responde a Enter e Espaço e tira o nome do próprio texto. Uma <div onClick> não tem nada disso: some do teclado e o leitor anuncia só um texto solto. <nav>, <main>, <h1> a <h6>, <label> e listas viram pontos de navegação. A primeira regra do ARIA: se existe um elemento nativo com o comportamento, use-o.',
      cena: {
        foco: 'Semântica',
        entidades: {
          botao: { ...botao, destaque: true, etiquetas: [{ texto: 'foco e Enter', tom: 'bom' }] },
          div: { ...div, etiquetas: [{ texto: 'some do Tab', tom: 'ruim' }] },
          arvore,
          leitor,
        },
        ligacoes: {
          nativo: { de: 'botao', para: 'arvore', rotulo: 'button' },
          generico: { de: 'div', para: 'arvore', rotulo: 'texto', estilo: 'erro' },
          anuncia: { de: 'arvore', para: 'leitor', rotulo: 'anuncia' },
        },
        fluxos: [
          { rota: ['nativo', 'anuncia'], taxa: 0.8 },
          { rota: ['generico'], tipo: 'lento', taxa: 0.5, falha: 1 },
        ],
        metricas: [m('<button>', 'tudo pronto', 'bom'), m('<div onClick>', 'nada', 'ruim')],
      },
    },
    {
      id: 'aria',
      titulo: 'ARIA: para o que o HTML não cobre',
      narracao:
        'ARIA acrescenta papel, nome e estado quando não há elemento nativo, como em abas, combobox e árvores: role="tab", aria-selected, aria-expanded, aria-controls. Mas ele muda só o que é anunciado, nunca o comportamento: role="button" não dá foco nem responde a Enter, isso é com você. O WAI-ARIA Authoring Practices descreve o teclado esperado de cada componente. ARIA errado é pior do que nenhum.',
      cena: {
        foco: 'ARIA',
        entidades: {
          aba: { ...aba, destaque: true, etiquetas: [{ texto: 'só anuncia', tom: 'alerta' }] },
          arvore,
          leitor,
        },
        ligacoes: {
          descreve: { de: 'aba', para: 'arvore', rotulo: 'papel + estado' },
          anuncia: { de: 'arvore', para: 'leitor', rotulo: '"aba, 2 de 3"' },
        },
        fluxos: [{ rota: ['descreve', 'anuncia'], taxa: 0.8 }],
        metricas: [m('Muda', 'o anúncio'), m('Não muda', 'foco nem teclado', 'alerta'), m('Guia', 'ARIA APG')],
      },
    },
    {
      id: 'teclado',
      titulo: 'Foco e teclado',
      narracao:
        'Tudo que funciona com o mouse precisa funcionar com o teclado. A ordem do Tab segue a ordem do DOM, então a ordem visual e a do código têm de bater; evite tabindex positivo. O foco precisa ser visível (:focus-visible) e, num modal, entrar nele, ficar preso enquanto ele estiver aberto e voltar ao gatilho ao fechar. Neste projeto, a gaveta do menu fechada fica inert e sai da ordem do Tab.',
      cena: {
        foco: 'Teclado',
        entidades: {
          teclado: { ...teclado, destaque: true },
          pagina,
          menu: { ...focavel(0, 'menu', '1º Tab'), cor: 'verde', destaque: true },
          busca: focavel(1, 'busca', '2º Tab'),
          conteudo: focavel(2, 'conteúdo', '3º Tab'),
        },
        ligacoes: { tab: { de: 'teclado', para: 'menu', rotulo: 'Tab' } },
        fluxos: [{ rota: ['tab'], tipo: 'sinal', taxa: 1 }],
        metricas: [m('Ordem', 'a do DOM'), m('Foco', 'visível', 'bom'), m('Modal', 'prende e devolve')],
        nota: 'o anel de foco mostra onde o teclado está',
      },
    },
    {
      id: 'contraste',
      titulo: 'Contraste e cor',
      narracao:
        'As WCAG pedem contraste de pelo menos 4,5:1 entre texto e fundo, e 3:1 para texto grande e para ícones e bordas de controles. Cor nunca deve ser a única forma de transmitir algo: um campo com erro precisa de texto ou ícone além do vermelho. Respeitar prefers-reduced-motion e aguentar zoom de 200% sem quebrar a página fazem parte do mesmo cuidado.',
      cena: {
        foco: 'Contraste',
        entidades: {
          fraco: { pos: [-3.4, 0], rotulo: 'Aa cinza', sub: '2,8 : 1', cor: 'neutro', apagado: true, etiquetas: [{ texto: 'reprova', tom: 'ruim' }] },
          forte: { pos: [3.4, 0], rotulo: 'Aa escuro', sub: '7 : 1', cor: 'verde', destaque: true, etiquetas: [{ texto: 'passa', tom: 'bom' }] },
        },
        metricas: [m('Texto normal', '≥ 4,5 : 1'), m('Texto grande', '≥ 3 : 1'), m('Ícones e bordas', '≥ 3 : 1')],
      },
    },
    {
      id: 'aria-live',
      titulo: 'aria-live: anunciar o que muda sozinho',
      narracao:
        'Quando o conteúdo muda sem o foco ir até ele (um toast, um contador, o resultado de uma busca), o leitor de tela não percebe. Uma região aria-live="polite" (ou role="status") anuncia a mudança quando a pessoa faz uma pausa; "assertive" (role="alert") interrompe e deve ser rara. A região precisa existir no DOM antes da mudança. O guia desta lição usa aria-live="polite": cada passo novo é lido em voz alta.',
      cena: {
        foco: 'aria-live',
        entidades: {
          acao,
          regiao: { ...regiao, destaque: true },
          aviso: { tipo: 'cartao', pos: sobre(regiao.pos), rotulo: 'Salvo!', cor: 'verde', tamanho: [1.6, 1.6] },
          leitor: { ...leitor, pos: [5, -1.4] },
        },
        ligacoes: {
          atualiza: { de: 'acao', para: 'regiao', rotulo: 'atualiza' },
          anuncia: { de: 'regiao', para: 'leitor', rotulo: 'anuncia' },
        },
        fluxos: [{ rota: ['atualiza', 'anuncia'], tipo: 'sinal', taxa: 0.7 }],
        metricas: [m('polite', 'espera uma pausa', 'bom'), m('assertive', 'interrompe', 'alerta'), m('Região', 'existe antes')],
      },
    },
  ],
  fontes: [
    { titulo: 'Using ARIA: first rule of ARIA use', url: 'https://www.w3.org/TR/using-aria/#rule1', origem: 'W3C', tipo: 'especificacao', idioma: 'en', nota: 'As regras de uso do ARIA, a começar por preferir o HTML nativo.' },
    { titulo: 'ARIA Authoring Practices Guide', url: 'https://www.w3.org/WAI/ARIA/apg/', origem: 'W3C WAI', tipo: 'guia', idioma: 'en', nota: 'Padrões de componentes com o teclado e o ARIA esperados.' },
    { titulo: 'Understanding SC 1.4.3: Contrast (Minimum)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html', origem: 'W3C WAI', tipo: 'especificacao', idioma: 'en', nota: 'Por que 4,5:1 e 3:1, e o que conta como texto grande.' },
    { titulo: 'Understanding SC 1.4.11: Non-text Contrast', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html', origem: 'W3C WAI', tipo: 'especificacao', idioma: 'en', nota: 'Contraste de ícones, bordas e estados de foco.' },
    { titulo: 'ARIA live regions', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions', origem: 'MDN Web Docs', tipo: 'guia', idioma: 'en', nota: 'polite, assertive, role="status" e os cuidados de cada um.' },
    { titulo: 'Learn Accessibility', url: 'https://web.dev/learn/accessibility', origem: 'web.dev', tipo: 'guia', idioma: 'en', nota: 'Curso completo: semântica, foco, cor, movimento e testes.' },
    { titulo: 'Accessibility tree', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree', origem: 'MDN Web Docs', tipo: 'documentacao', idioma: 'en', nota: 'O que a árvore guarda e como inspecioná-la no DevTools.' },
  ],
};
