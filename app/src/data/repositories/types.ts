// Repository interfaces — the state layer depends on these, never on the
// concrete in-memory classes (Dependency Inversion). Swapping to a real API
// later means writing a new class that satisfies the same interface.
import type {
  AllowanceGroup,
  Ambiente,
  Brand,
  CadastroEmpreendimentoInput,
  DashboardData,
  Empreendimento,
  EmpreendimentoCadastrado,
  Item,
  MaterialCatalogItem,
  Planta,
  Solicitacao,
  StatusSolicitacao,
  Vinculo,
} from "../../domain/types";

export interface ICatalogoRepository {
  getEmpreendimento(vinculoId: string): Empreendimento | undefined;
  /** Resolves the vínculo's own Planta internally — a unit's catalog is
   * whichever Planta it's on, not shared flat across the empreendimento. */
  getAmbientes(vinculoId: string): Ambiente[];
  getAllowanceGroups(vinculoId: string): AllowanceGroup[];

  /** Authoring side — construtora manages a catalog directly by
   * empreendimentoId, since it isn't browsing through a vínculo. Includes
   * both empreendimentos with real vínculos (the demo units) and ones
   * registered via registrarEmpreendimento (freshly cadastrados, no
   * client/vínculo yet — still need somewhere to build their catalog). */
  listEmpreendimentosByConstrutora(construtoraId: string): { empreendimentoId: string; nome: string }[];
  /** Todos os itens de todas as plantas do empreendimento — usado só pra
   * derivar a janela de personalização (calcularJanelaPersonalizacao), não
   * pra navegação normal (essa continua sempre por planta). */
  listTodosItensDoEmpreendimento(empreendimentoId: string): Item[];
  listPlantas(empreendimentoId: string): Planta[];
  upsertPlanta(empreendimentoId: string, planta: Planta): void;
  removePlanta(empreendimentoId: string, plantaId: string): void;
  getAmbientesByPlanta(empreendimentoId: string, plantaId: string): Ambiente[];
  getAllowanceGroupsByPlanta(empreendimentoId: string, plantaId: string): AllowanceGroup[];
  replaceAmbientes(empreendimentoId: string, plantaId: string, ambientes: Ambiente[]): void;
  replaceAllowanceGroups(empreendimentoId: string, plantaId: string, groups: AllowanceGroup[]): void;
  /** Makes a freshly cadastrado empreendimento (no vínculo yet) show up in
   * listEmpreendimentosByConstrutora / show up in Catálogo, ready to build
   * on — otherwise a Cadastro just vanishes into a list nothing else reads. */
  registrarEmpreendimento(empreendimentoId: string, construtoraId: string, nome: string): void;
}

export interface IMaterialCatalogoRepository {
  list(construtoraId: string): MaterialCatalogItem[];
  create(input: Omit<MaterialCatalogItem, "id">): MaterialCatalogItem;
  update(id: string, patch: Partial<Omit<MaterialCatalogItem, "id" | "construtoraId">>): MaterialCatalogItem | undefined;
  remove(id: string): void;
}

export interface IVinculoRepository {
  /** The logged-in client's own units, across every construtora they bought from. */
  listForCliente(): Vinculo[];
  getById(id: string): Vinculo | undefined;
}

export interface IBrandRepository {
  /** null when that construtora hasn't opted into white-label yet — the
   * client portal falls back to plantta's own brand in that case. */
  getBrand(construtoraId: string): Brand | null;
  saveBrand(construtoraId: string, brand: Brand): Brand;
}

export interface NovaSolicitacaoInput {
  vinculoId: string;
  construtoraId: string;
  itemId: string;
  item: string;
  unidade: string;
  torre: string;
  cliente: string;
  de: string;
  para: string;
  diferenca: number | null;
  nivel: Solicitacao["nivel"];
}

export interface ISolicitacaoRepository {
  list(): Solicitacao[];
  listByVinculoIds(vinculoIds: string[]): Solicitacao[];
  getById(id: string): Solicitacao | undefined;
  create(input: NovaSolicitacaoInput): Solicitacao;
  updateStatus(id: string, status: StatusSolicitacao, responsavel?: string | null): Solicitacao | undefined;
}

export interface IEmpreendimentoCadastroRepository {
  list(): EmpreendimentoCadastrado[];
  create(input: CadastroEmpreendimentoInput): EmpreendimentoCadastrado;
  /** Attaches files to an already-created cadastro — the wizard creates
   * the record right after step 1 (so Plantas/Catálogo have a real id to
   * work against) and only fills arquivos in at the files step. */
  updateArquivos(id: string, arquivos: CadastroEmpreendimentoInput["arquivos"]): EmpreendimentoCadastrado | undefined;
}

export interface IDashboardRepository {
  getDashboard(): DashboardData;
}
