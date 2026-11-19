# Render Lab

Lições interativas sobre fundamentos de frontend. Cada lição é uma cena que avança passo a passo,
e o passo atual mora na URL.

O plano completo do projeto (currículo, decisões, roadmap) está no documento
[Render Lab · projeto de estudo de fundamentos de frontend](https://claude.ai/artifact/BNYpfE33Yqx3yTz4SAX84c).

## Rodando

```bash
npm install
npm run dev          # http://localhost:5173
```

Para os testes de ponta a ponta, baixe o browser uma vez:

```bash
npx playwright install chromium
npm run e2e
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Dev server do Vite |
| `npm run build` | Typecheck e build de produção |
| `npm run typecheck` | Só o typecheck |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:watch` | Vitest em watch |
| `npm run e2e` | Testes de ponta a ponta (Playwright) |
| `npm run catalogo` | Regenera `src/licoes/catalogo.gerado.ts` depois de mudar uma lição ou tradução |

## Como o projeto está organizado

```
src/
  schema/       LicaoSchema (Zod) e os tipos derivados dele
  i18n/         idiomas (escolha do leitor) e dicionários da interface (pt-BR, en)
  licoes/
    pt-BR/      o conteúdo em português, um arquivo por lição: texto e cena
    en/         a tradução em inglês: só texto, um arquivo por lição + termos.ts
    traducao.ts aplica uma tradução sobre a lição em português
    carregar.ts carrega cada lição sob demanda (um chunk por lição e idioma)
    catalogo.gerado.ts  títulos e resumos de todas as lições, no bundle inicial
    index.ts    o conteúdo completo, para testes e para gerar o catálogo
  palco/        a cena isométrica desenhada a partir do estado do passo
  passos/       navegação entre passos, funções puras
  paginas/      as telas
  router.tsx    as rotas do TanStack Router
e2e/            testes de ponta a ponta
```

## Currículo

19 lições em seis módulos. Cada uma termina com um cartão **Para estudar**, com as fontes de
referência (documentação oficial, especificações e artigos dos autores das ferramentas).

| Módulo | Lições |
| --- | --- |
| 01. Renderização | Como o browser monta a página · Reflow, repaint e composite |
| 02. Execução | O event loop · Virtual DOM e reatividade fina · CSR, SSR, SSG e ISR · Hidratação · Ilhas, resumabilidade e Server Components |
| 03. Entrega | Core Web Vitals · Prioridade de recursos e imagens · Code splitting |
| 04. Arquitetura | Server, client e URL state · Cache no cliente · Componentes profundos · Padrões de composição |
| 05. Ferramentas | Bundlers e o salto para ESM · Tree-shaking e o tamanho do bundle · Micro-frontends e Module Federation |
| 06. Qualidade | Estratégia de testes no frontend · Acessibilidade e semântica |

## Português e inglês

O seletor **PT · EN** no topo troca a interface e o conteúdo na hora, sem recarregar e sem mudar a
URL. A escolha fica salva no navegador; sem escolha, o app segue o idioma do navegador
(`navigator.languages`) e, se não falar nenhum deles, abre em português. O `<html lang>` acompanha.

- **Interface**: `src/i18n/interface/pt-BR.ts` é o dicionário de referência e `en.ts` a versão em
  inglês. O tipo `TextosDaInterface` sai do português, então um dicionário sem alguma chave não
  compila. Frases com número são funções (`passoDe(3, 6)`), para cada idioma decidir ordem e plural.
- **Conteúdo**: a lição é escrita em português (`src/licoes/pt-BR/`), com texto e cena. A tradução
  (`src/licoes/en/<slug>.ts`) traz só texto: título, resumo, objetivos, narração e nota de cada
  passo pelo id, notas das fontes pela URL. Os textos curtos das cenas (rótulos, etiquetas,
  métricas) moram em `en/termos.ts`, indexados pelo texto em português, como as mensagens do
  gettext: se o português muda, a tradução antiga para de casar e o teste aponta.
- **Garantias** (`src/licoes/traducoes.test.ts`): toda lição tem tradução, nenhuma está pela metade
  (passo, nota, objetivo ou fonte faltando), nenhum texto curto em português escapa sem tradução e a
  cena traduzida é a mesma cena. O teste de legibilidade roda nas cenas dos dois idiomas, porque um
  rótulo traduzido mais comprido também precisa caber.
- **Fontes**: cada fonte diz o idioma do material (`idioma: 'en'`) e o cartão mostra um selo.

Para adicionar um terceiro idioma:

1. Acrescente o código em `IDIOMAS` (`src/i18n/idiomas.ts`). O TypeScript passa a apontar o que falta.
2. Crie o dicionário da interface em `src/i18n/interface/` e registre em `DICIONARIOS`.
3. Crie `src/licoes/<idioma>/` como `en/` (uma tradução por lição + `termos.ts`) e registre em
   `TRADUCOES` (`src/licoes/index.ts`). O carregador sob demanda acha os arquivos sozinho.
4. Rode `npm run catalogo` para o catálogo leve ganhar os títulos no idioma novo.

## Carregamento sob demanda

O bundle inicial leva o app, as bibliotecas e um catálogo leve (`catalogo.gerado.ts`: título,
resumo e títulos dos passos de cada lição nos dois idiomas), o bastante para o menu, a busca, o
início e o progresso. A página de lição (palco, motor e laboratório) é um chunk; cada lição, e
cada tradução, é outro, de 3 a 8 kB. O loader da rota baixa a lição antes de trocar de página e,
com `defaultPreload: 'intent'`, já começa quando o ponteiro passa sobre o link.

O catálogo é gerado a partir das lições por um teste com `toMatchFileSnapshot`: se uma lição muda
e o catálogo não, o teste falha no CI. Para atualizar, `npm run catalogo`.

### A ideia central: a lição é dado

Uma lição não é código — é um objeto que descreve seus passos, validado por Zod antes de chegar
na UI. A cena é um componente que desenha esse objeto. Não existe `if (passo === 3)` espalhado
pelo JSX.

```ts
export const renderingPath = {
  slug: 'rendering-path',
  passos: [{ id: 'dom', titulo: '...', narracao: '...', cena: { estagio: 'dom' } }, ...],
} satisfies LicaoFonte;
```

Conteúdo quebrado estoura em `src/licoes/licoes.test.ts`, que roda o schema contra todas as lições
publicadas. Falha no CI, nunca na tela do leitor.

### O passo mora na URL

A rota é `/licao/$slug/$passo`. O botão voltar do browser, o deep link e o teste do Playwright usam
o mesmo mecanismo, porque não existe um segundo estado para sincronizar. `/licao/rendering-path`
sem passo redireciona para o passo 1; um passo fora da faixa cai no mais próximo válido.

### A animação respeita a própria lição

A cena só anima `transform` e `opacity` (veja `src/estilos.css`). A lição 2 do currículo vai ensinar
por que isso importa — seria incoerente se a ferramenta que ensina o conceito o violasse. Há também
um bloco `prefers-reduced-motion` desligando as transições.

### A janela escala inteira, como a referência

O visual segue o [designed-to-scale](https://designed-to-scale.vercel.app/): curso na barra lateral,
palco e trilho no meio, guia e "Você vai aprender" à direita. No desktop a interface é desenhada em
1672×920 e, numa tela menor, encolhe inteira com CSS `zoom` (`src/janela.ts`): tudo cabe sem rolar e
as proporções são as mesmas em qualquer monitor. Abaixo de 1200px a barra lateral vira gaveta; numa
tela estreita, tudo empilha. O tema claro/escuro segue o sistema até o leitor escolher no botão do
topo, e os dois são escritos no `<html>` antes do primeiro render.

### `data-atalhos` e a janela morta

`LicaoPagina` expõe `data-atalhos="ativo"` quando o listener de teclado entra no ar. Entre o HTML
aparecer na tela e o efeito rodar existe uma janela real em que a página parece pronta e não
responde — a mesma janela que a lição sobre hidratação vai ensinar. O teste de teclado espera esse
atributo em vez de usar um sleep.

## Estado atual

19 lições cobrindo os oito temas do roteiro de estudo (renderização, modelos de renderização,
performance, estado, componentes, build, testes e acessibilidade), cada uma com fontes para estudo.
Interface e conteúdo em português e inglês, com cada lição carregada sob demanda. Testes unitários
(Vitest) cobrem schema, fontes, legibilidade das cenas nos dois idiomas, completude das traduções,
catálogo gerado e dicionários; os de ponta a ponta (Playwright) percorrem todas as lições, trocam
o idioma e conferem que uma lição só é baixada quando aberta.
