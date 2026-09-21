// Domain model — pure types, no framework or data-layer dependencies.
// Kept separate from `data/` (Dependency Inversion: state and UI depend on
// these shapes, never on how mock data is stored).

export type Role = "cliente" | "construtora" | null;

export type NivelAprovacao = 1 | 2 | 3;

export interface Brand {
  nome: string;
  color: string;
  logo: string | null;
}

export interface Opcao {
  id: string;
  nome: string;
  preco: number;
  padrao?: boolean;
  remocao?: boolean;
  /** Construtora's raw cost for this option — never shown to the client. */
  custoConstrutora?: number;
  /** Links back to the reusable MaterialCatalogItem this was attached from.
   * `nome`/`preco` above are a snapshot at attach time, same as any line
   * item in a real e-commerce order — editing the catalog later doesn't
   * retroactively change options already attached to items. */
  materialCatalogItemId?: string;
}

export interface CustoPorUnidade {
  total: number;
  [componente: string]: number;
}

export interface Item {
  id: string;
  nome: string;
  nivel: NivelAprovacao;
  padrao: string;
  /** Preço base / verba inclusa — o que já está contemplado no contrato. */
  valorPadrao: number;
  /** Janela em que o cliente pode decidir — ambos null significa sem prazo
   * definido. Ver domain/calculations.statusPrazo (aberto/nao_iniciado/
   * encerrado/sem_prazo). */
  prazoInicio: string | null;
  prazoFim: string | null;
  opcoes: Opcao[];
  parametrico?: boolean;
  qtdPadrao?: number;
  custoPorUnidade?: CustoPorUnidade;
  motivoBloqueio?: string;
  /** Construtora's raw cost for the padrão spec — never shown to the client. */
  custoConstrutora?: number;
  /** Days the chosen material takes to arrive after approval. */
  leadTimeDias?: number;
  /** Date the material needs to be on site (ISO), independent of the
   * client's decision deadline (`prazoFim`). */
  necessarioEmObra?: string;
  /** When set, this item's cost is drawn from a shared AllowanceGroup
   * instead of judged purely against its own valorPadrao. */
  allowanceGroupId?: string;
}

export interface Ambiente {
  id: string;
  nome: string;
  itens: Item[];
}

/**
 * Reusable material — one row a construtora maintains once and attaches to
 * as many item options as it wants, instead of re-typing brand/SKU/price
 * per item. Scoped to a construtora (shared across all its empreendimentos).
 */
export interface MaterialCatalogItem {
  id: string;
  construtoraId: string;
  categoria: string;
  marca: string;
  modelo: string;
  sku: string;
  fornecedor: string;
  precoCliente: number;
  custoConstrutora: number;
  leadTimeDias: number;
  imagemUrl: string | null;
}

/**
 * Verba compartilhada entre vários itens de um mesmo ambiente (ex.: verba
 * do banheiro dividida entre piso/revestimento/cuba/louças) — gastar mais
 * num item reduz o saldo visível nos itens irmãos do grupo.
 */
export interface AllowanceGroup {
  id: string;
  nome: string;
  ambienteId: string;
  valorTotal: number;
  itemIds: string[];
}

/**
 * Uma tipologia/planta de unidade dentro de um empreendimento — um prédio
 * de centenas de unidades quase nunca tem uma única planta (dezenas de
 * m², quartos e layouts diferentes convivem no mesmo empreendimento). O
 * catálogo (ambientes/itens/opções) pertence à Planta, não diretamente ao
 * empreendimento, porque a Sala da Planta A pode ter um padrão totalmente
 * diferente da Sala da Planta B. Unidades reais se associam a uma Planta
 * (ver Vinculo.plantaId).
 */
export interface Planta {
  id: string;
  nome: string;
  descricao?: string;
  areaM2?: number;
  quartos?: number;
  /** Faixas/números de unidade cadastrados nesta planta, só pra exibição —
   * ex.: "101-110, 201-210". Não é usado pra resolver vínculo algum. */
  unidadesLabel?: string;
}

export interface Empreendimento {
  nome: string;
  construtora: string;
  unidade: string;
  torre: string;
  comprador: string;
  cpf: string;
  totalUnidades: number;
  valorImovel: number;
}

/**
 * One client↔unit relationship. A client can hold several of these across
 * different construtoras — this is what the portal's left sidebar switches
 * between. `brand` is this construtora's own identity, or `null` when it
 * hasn't opted into white-label (portal falls back to plantta's brand).
 */
export interface Vinculo {
  id: string;
  /** Numeric code, zero-padded to 5 digits ("00001") — the canonical form.
   * Display strips the leading zeros (see formatSolicitacaoRef). */
  construtoraId: string;
  construtoraNome: string;
  /** Same numeric-code convention as construtoraId. */
  empreendimentoId: string;
  empreendimentoNome: string;
  /** Qual Planta esta unidade segue — decide qual catálogo (ambientes/
   * itens/opções) o cliente vê. */
  plantaId: string;
  plantaNome: string;
  unidadeLabel: string;
  torre: string;
  brand: Brand | null;
}

export type StatusSolicitacao = "pendente" | "em_analise" | "aprovado" | "recusado";

export type TipoEventoTimeline =
  | "criacao"
  | "roteamento"
  | "assumido"
  | "parecer"
  | "aprovacao"
  | "recusa"
  | "info";

export interface TimelineEvent {
  id: string;
  data: string; // ISO datetime
  autor: string;
  papel: string;
  texto: string;
  tipo: TipoEventoTimeline;
}

export interface Solicitacao {
  id: string;
  vinculoId: string;
  /** Denormalized on purpose — Painel needs to scope by construtora even
   * for demo rows whose vinculoId has no matching Vinculo record. */
  construtoraId: string;
  /** The catalog Item.id this request is about — powers the "edit" deep
   * link (Seleção for fixed-option items, Calculadora for parametric ones). */
  itemId: string;
  unidade: string;
  torre: string;
  cliente: string;
  item: string;
  de: string;
  para: string;
  diferenca: number | null;
  status: StatusSolicitacao;
  nivel: NivelAprovacao;
  data: string;
  /** ISO datetime the request was opened — powers "tempo em aberto". */
  abertoEm: string;
  /** ISO datetime it left an open state (aprovado/recusado), if it has. */
  encerradoEm?: string;
  responsavel: string | null;
  timeline: TimelineEvent[];
}

export type TipoLancamento = "credito" | "debito";

export interface LancamentoLedger {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
}

export interface SelecaoCarrinho {
  id: string;
  item: string;
  ambiente: string;
  de: string;
  para: string;
  nivel: NivelAprovacao;
  credito: number;
  custo: number;
}

export interface TopUpgrade {
  nome: string;
  pct: number;
  receita: number;
}

export interface ReceitaMes {
  mes: string;
  valor: number;
  sol: number;
}

export interface DashboardData {
  unidadesTotal: number;
  unidadesPersonalizando: number;
  receitaUpgrade: number;
  ticketMedioUpgrade: number;
  taxaAdesao: number;
  tempoMedioAprovacao: number;
  solicitacoesMes: number;
  creditoGerado: number;
  creditoUtilizado: number;
  topUpgrades: TopUpgrade[];
  porMes: ReceitaMes[];
  porNivel: { simples: number; tecnico: number; proibido: number };
}

export type CategoriaArquivo = "imagens" | "dwg" | "plantas" | "memorial";

export interface ArquivoCadastro {
  id: string;
  name: string;
  size: number;
}

export interface CadastroEmpreendimentoInput {
  nome: string;
  /** Locked to the logged-in construtora — never free text (see LoginConstrutoraPage). */
  construtoraId: string;
  construtora: string;
  torres: number;
  unidades: number;
  arquivos: Record<CategoriaArquivo, ArquivoCadastro[]>;
}

export interface EmpreendimentoCadastrado extends CadastroEmpreendimentoInput {
  id: string;
  criadoEm: string;
}

export interface MaterialPropostaFornecedor {
  fornecedor: string;
  valor: string;
}

export interface SolicitacaoMaterialProprio {
  itemId: string;
  materialNome: string;
  referencia: string;
  propostas: MaterialPropostaFornecedor[];
  status: "enviado_para_analise";
  /** Cliente marcou a ciência do aviso de risco de atraso/multa antes de
   * enviar — registrado pra auditoria, não é uma validação de que a
   * cláusula de multa é juridicamente aplicável (isso exige análise
   * jurídica real, fora do escopo deste protótipo). */
  avisoRiscoAceito: boolean;
}
