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
  MaterialCatalogItem,
  Solicitacao,
  StatusSolicitacao,
  Vinculo,
} from "../../domain/types";

export interface ICatalogoRepository {
  getEmpreendimento(vinculoId: string): Empreendimento | undefined;
  getAmbientes(vinculoId: string): Ambiente[];
  getAllowanceGroups(vinculoId: string): AllowanceGroup[];

  /** Authoring side — construtora manages a catalog directly by
   * empreendimentoId, since it isn't browsing through a vínculo. */
  listEmpreendimentosByConstrutora(construtoraId: string): { empreendimentoId: string; nome: string }[];
  getAmbientesByEmpreendimentoId(empreendimentoId: string): Ambiente[];
  getAllowanceGroupsByEmpreendimentoId(empreendimentoId: string): AllowanceGroup[];
  replaceAmbientes(empreendimentoId: string, ambientes: Ambiente[]): void;
  replaceAllowanceGroups(empreendimentoId: string, groups: AllowanceGroup[]): void;
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
  getBrand(): Brand;
  saveBrand(brand: Brand): Brand;
}

export interface NovaSolicitacaoInput {
  vinculoId: string;
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
}

export interface IDashboardRepository {
  getDashboard(): DashboardData;
}
