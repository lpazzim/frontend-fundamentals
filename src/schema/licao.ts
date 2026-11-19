import { z } from 'zod';

/**
 * Os seis estagios do critical rendering path, na ordem em que o browser
 * os executa. Vocabulario compartilhado: licoes, tabela de custo e painel.
 */
export const ESTAGIOS = [
  'dom',
  'cssom',
  'render-tree',
  'layout',
  'paint',
  'composite',
] as const;

export type Estagio = (typeof ESTAGIOS)[number];

/**
 * Os modulos do curriculo, na ordem em que aparecem. Os nomes exibidos moram
 * no dicionario de cada idioma (src/i18n/interface), nao aqui.
 */
export const MODULOS = ['renderizacao', 'execucao', 'entrega', 'arquitetura', 'ferramentas', 'qualidade'] as const;
export type Modulo = (typeof MODULOS)[number];

export const DIFICULDADES = ['iniciante', 'intermediario', 'avancado'] as const;
export type Dificuldade = (typeof DIFICULDADES)[number];

// ---------------------------------------------------------------------------
// Palco: a cena de cada passo. Entidades num chao isometrico, ligacoes entre
// elas e fluxos de pacotes viajando pelas ligacoes. O motor (src/palco)
// compara a cena de um passo com a do anterior e coreografa a diferenca:
// quem sai, quem se move, quem entra, que ligacao aparece.
// ---------------------------------------------------------------------------

export const CORES = ['laranja', 'verde', 'azul', 'amarelo', 'roxo', 'neutro'] as const;
export const ICONES = [
  'arquivo',
  'arvore',
  'pincel',
  'camadas',
  'cpu',
  'servidor',
  'banco',
  'globo',
  'tela',
  'caixa',
  'relogio',
  'raio',
  'usuario',
  'regua',
] as const;

export type Cor = (typeof CORES)[number];
export type Icone = (typeof ICONES)[number];

export const EtiquetaSchema = z.object({
  texto: z.string().min(1),
  tom: z.enum(['neutro', 'bom', 'alerta', 'ruim']).default('neutro'),
});

export const EntidadeSchema = z.object({
  /** bloco: prisma com rotulo no topo. placa: laje baixa com rotulo embaixo. cartao: peca pequena. */
  tipo: z.enum(['bloco', 'placa', 'cartao']).default('bloco'),
  /**
   * [coluna, linha] ou [coluna, linha, altura]. Coluna anda na horizontal da
   * tela, linha na vertical; altura (px) levanta a peca, para cartoes em cima
   * de placas. A mesma entidade com outra pos entre passos SE MOVE.
   */
  pos: z.union([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number(), z.number()])]),
  rotulo: z.string().min(1),
  sub: z.string().optional(),
  icone: z.enum(ICONES).optional(),
  cor: z.enum(CORES).default('neutro'),
  /** Base em celulas: [largura, profundidade]. Cada tipo tem um padrao. */
  tamanho: z.tuple([z.number().positive(), z.number().positive()]).optional(),
  /** O que o passo esta mostrando agora: ganha um halo que pulsa. */
  destaque: z.boolean().default(false),
  /** Fora do assunto do passo: fica esmaecida. */
  apagado: z.boolean().default(false),
  etiquetas: z.array(EtiquetaSchema).max(2).default([]),
});

export const LigacaoSchema = z.object({
  de: z.string().min(1),
  para: z.string().min(1),
  estilo: z.enum(['solida', 'tracejada', 'desligada', 'erro']).default('solida'),
  setas: z.enum(['fim', 'ambas', 'nenhuma']).default('fim'),
  rotulo: z.string().optional(),
});

export const TIPOS_DE_PACOTE = ['requisicao', 'sinal', 'pesado', 'lento'] as const;

export const FluxoSchema = z.object({
  /** Ids de ligacoes em sequencia: o fim de uma e o comeco da proxima. */
  rota: z.array(z.string().min(1)).min(1),
  tipo: z.enum(TIPOS_DE_PACOTE).default('requisicao'),
  /** Pacotes por segundo. */
  taxa: z.number().positive().max(4).default(0.8),
  /** Ao chegar, volta pela mesma rota como resposta. */
  volta: z.boolean().default(false),
  /** Segundos que o pacote fica retido no destino antes de voltar. */
  segura: z.number().nonnegative().max(3).default(0),
  /** Chance (0 a 1) de o pacote falhar ao chegar. Sorteio com semente: deterministico. */
  falha: z.number().min(0).max(1).default(0),
});

export const MetricaSchema = z.object({
  rotulo: z.string().min(1),
  valor: z.string().min(1),
  nivel: z.enum(['neutro', 'bom', 'alerta', 'ruim']).default('neutro'),
});

export const CenaSchema = z
  .object({
    /** Rotulo curto do que esta em foco, mostrado no painel de metricas. */
    foco: z.string().min(1),
    entidades: z.record(z.string(), EntidadeSchema),
    ligacoes: z.record(z.string(), LigacaoSchema).default({}),
    fluxos: z.array(FluxoSchema).default([]),
    /** Numeros do passo, em chips acima do palco. Modelo, nao medicao: a licao diz qual e qual. */
    metricas: z.array(MetricaSchema).max(5).default([]),
    nota: z.string().optional(),
  })
  .superRefine((cena, ctx) => {
    if (Object.keys(cena.entidades).length === 0) {
      ctx.addIssue({ code: 'custom', message: 'a cena precisa de ao menos uma entidade' });
    }
    for (const [id, ligacao] of Object.entries(cena.ligacoes)) {
      for (const ponta of [ligacao.de, ligacao.para]) {
        if (!cena.entidades[ponta]) {
          ctx.addIssue({ code: 'custom', message: `ligacao ${id} aponta para entidade inexistente: ${ponta}` });
        }
      }
    }
    for (const fluxo of cena.fluxos) {
      fluxo.rota.forEach((id, i) => {
        const ligacao = cena.ligacoes[id];
        if (!ligacao) {
          ctx.addIssue({ code: 'custom', message: `fluxo usa ligacao inexistente: ${id}` });
          return;
        }
        const seguinte = cena.ligacoes[fluxo.rota[i + 1] ?? ''];
        if (seguinte && seguinte.de !== ligacao.para) {
          ctx.addIssue({
            code: 'custom',
            message: `rota quebrada: ${id} termina em ${ligacao.para}, mas a proxima comeca em ${seguinte.de}`,
          });
        }
      });
    }
  });

export const PassoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  narracao: z.string().min(1),
  cena: CenaSchema,
});

/**
 * O que o leitor leva da licao. Cada objetivo e "alcancado" a partir de um
 * passo: o cartao "Voce vai aprender" marca os que o leitor ja passou.
 */
export const ObjetivoSchema = z.object({
  texto: z.string().min(1),
  passo: z.number().int().positive(),
});

export const TIPOS_DE_FONTE = ['documentacao', 'artigo', 'especificacao', 'livro', 'palestra', 'guia'] as const;
export type TipoDeFonte = (typeof TIPOS_DE_FONTE)[number];

/**
 * Uma referencia para estudar alem da licao. `idioma` e o idioma do material
 * citado (BCP 47: 'en', 'pt-BR'), nao o da licao: a traducao de uma licao pode
 * trocar o link por uma versao localizada da mesma fonte quando ela existir.
 */
export const FonteSchema = z.object({
  titulo: z.string().min(1),
  url: z.url({ protocol: /^https$/ }),
  /** Quem publica: "MDN Web Docs", "web.dev", "W3C"... */
  origem: z.string().min(1),
  tipo: z.enum(TIPOS_DE_FONTE),
  idioma: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'idioma no formato BCP 47, como en ou pt-BR'),
  /** Uma linha dizendo o que o material acrescenta a licao. */
  nota: z.string().min(1).optional(),
});

export const LicaoSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'slug aceita apenas minúsculas, números e hífen'),
    modulo: z.enum(MODULOS),
    titulo: z.string().min(1),
    resumo: z.string().min(1),
    dificuldade: z.enum(DIFICULDADES),
    minutos: z.number().int().positive(),
    /** Quando presente, a pagina monta um laboratorio interativo ao lado da cena. */
    laboratorio: z.enum(['custo-de-renderizacao']).optional(),
    /**
     * O que a licao e honesta em dizer sobre si mesma: 'modelo' anima uma
     * explicacao; 'medido' mede o browser do leitor de verdade.
     */
    fidelidade: z.enum(['modelo', 'medido']).default('modelo'),
    objetivos: z.array(ObjetivoSchema).max(6).default([]),
    passos: z.array(PassoSchema).min(2, 'uma lição precisa de ao menos dois passos'),
    /** Material de estudo: documentacao oficial, especificacoes e artigos de referencia. */
    fontes: z.array(FonteSchema).max(8).default([]),
  })
  .superRefine((licao, ctx) => {
    const urls = licao.fontes.map((f) => f.url);
    if (new Set(urls).size !== urls.length) {
      ctx.addIssue({ code: 'custom', message: `fonte repetida na lição ${licao.slug}` });
    }
    for (const objetivo of licao.objetivos) {
      if (objetivo.passo > licao.passos.length) {
        ctx.addIssue({
          code: 'custom',
          message: `objetivo "${objetivo.texto}" aponta para o passo ${objetivo.passo}, mas a lição tem ${licao.passos.length}`,
        });
      }
    }
  });

/** O tipo que a cena e as paginas consomem: ja validado, sem campos opcionais soltos. */
export type Licao = z.infer<typeof LicaoSchema>;
export type Passo = z.infer<typeof PassoSchema>;
export type Cena = z.infer<typeof CenaSchema>;
export type Entidade = z.infer<typeof EntidadeSchema>;
export type Ligacao = z.infer<typeof LigacaoSchema>;
export type Fluxo = z.infer<typeof FluxoSchema>;
export type FluxoFonte = z.input<typeof FluxoSchema>;
export type Metrica = z.infer<typeof MetricaSchema>;
export type Fonte = z.infer<typeof FonteSchema>;
export type TipoDePacote = (typeof TIPOS_DE_PACOTE)[number];

/** Os tipos que os arquivos de conteudo escrevem: aceitam omitir o que tem default. */
export type LicaoFonte = z.input<typeof LicaoSchema>;
export type CenaFonte = z.input<typeof CenaSchema>;
export type EntidadeFonte = z.input<typeof EntidadeSchema>;
export type LigacaoFonte = z.input<typeof LigacaoSchema>;
