// In-memory implementations. Each repository owns its own module-level
// array/object as "storage" — data survives navigation within the session
// (React state re-renders read through these) and resets on full reload,
// which is the persistence model asked for in a navigable prototype.
import type {
  AllowanceGroup,
  Ambiente,
  CadastroEmpreendimentoInput,
  EmpreendimentoCadastrado,
  MaterialCatalogItem,
  Solicitacao,
  StatusSolicitacao,
} from "../../domain/types";
import {
  allowanceGroupsPorEmpreendimento,
  ambientesPorEmpreendimento,
  dashboardData,
  empreendimento,
  empreendimentoAllianceBoulevard501,
  empreendimentoAllianceBoulevard1502,
  empreendimentoAllianceJardins,
  empreendimentoVistaVerde,
  initialBrand,
  materialCatalogInicial,
  solicitacoesIniciais,
  vinculos,
} from "../mockData";
import type {
  IBrandRepository,
  ICatalogoRepository,
  IDashboardRepository,
  IEmpreendimentoCadastroRepository,
  IMaterialCatalogoRepository,
  ISolicitacaoRepository,
  IVinculoRepository,
  NovaSolicitacaoInput,
} from "./types";

// Unit-specific denormalized view (unidade/torre/comprador differ even
// within the same empreendimento) — kept keyed by vínculo, as before.
const empreendimentoPorVinculo: Record<string, typeof empreendimento> = {
  "v-aurora-1204": empreendimento,
  "v-vistaverde-2201": empreendimentoVistaVerde,
  "v-boulevard-501": empreendimentoAllianceBoulevard501,
  "v-boulevard-1502": empreendimentoAllianceBoulevard1502,
  "v-jardins-302": empreendimentoAllianceJardins,
};

export class InMemoryCatalogoRepository implements ICatalogoRepository {
  getEmpreendimento(vinculoId: string) {
    return empreendimentoPorVinculo[vinculoId];
  }
  getAmbientes(vinculoId: string) {
    const empreendimentoId = vinculos.find((v) => v.id === vinculoId)?.empreendimentoId;
    return empreendimentoId ? (ambientesPorEmpreendimento[empreendimentoId] ?? []) : [];
  }
  getAllowanceGroups(vinculoId: string) {
    const empreendimentoId = vinculos.find((v) => v.id === vinculoId)?.empreendimentoId;
    return empreendimentoId ? (allowanceGroupsPorEmpreendimento[empreendimentoId] ?? []) : [];
  }
  listEmpreendimentosByConstrutora(construtoraId: string) {
    const seen = new Map<string, string>();
    for (const v of vinculos) {
      if (v.construtoraId === construtoraId && !seen.has(v.empreendimentoId)) {
        seen.set(v.empreendimentoId, v.empreendimentoNome);
      }
    }
    return [...seen.entries()].map(([empreendimentoId, nome]) => ({ empreendimentoId, nome }));
  }
  getAmbientesByEmpreendimentoId(empreendimentoId: string) {
    return ambientesPorEmpreendimento[empreendimentoId] ?? [];
  }
  getAllowanceGroupsByEmpreendimentoId(empreendimentoId: string) {
    return allowanceGroupsPorEmpreendimento[empreendimentoId] ?? [];
  }
  replaceAmbientes(empreendimentoId: string, ambientesNovos: Ambiente[]) {
    ambientesPorEmpreendimento[empreendimentoId] = ambientesNovos;
  }
  replaceAllowanceGroups(empreendimentoId: string, groups: AllowanceGroup[]) {
    allowanceGroupsPorEmpreendimento[empreendimentoId] = groups;
  }
}

export class InMemoryMaterialCatalogoRepository implements IMaterialCatalogoRepository {
  private items: MaterialCatalogItem[] = materialCatalogInicial.map((m) => ({ ...m }));

  list(construtoraId: string) {
    return this.items.filter((m) => m.construtoraId === construtoraId);
  }

  create(input: Omit<MaterialCatalogItem, "id">): MaterialCatalogItem {
    const created: MaterialCatalogItem = { ...input, id: `mc-${Date.now()}-${Math.round(Math.random() * 1000)}` };
    this.items.push(created);
    return created;
  }

  update(id: string, patch: Partial<Omit<MaterialCatalogItem, "id" | "construtoraId">>) {
    const found = this.items.find((m) => m.id === id);
    if (!found) return undefined;
    Object.assign(found, patch);
    return { ...found };
  }

  remove(id: string) {
    this.items = this.items.filter((m) => m.id !== id);
  }
}

export class InMemoryVinculoRepository implements IVinculoRepository {
  listForCliente() {
    return vinculos;
  }
  getById(id: string) {
    return vinculos.find((v) => v.id === id);
  }
}

export class InMemoryBrandRepository implements IBrandRepository {
  private brand = { ...initialBrand };
  getBrand() {
    return this.brand;
  }
  saveBrand(brand: typeof this.brand) {
    this.brand = brand;
    return this.brand;
  }
}

export class InMemorySolicitacaoRepository implements ISolicitacaoRepository {
  private items: Solicitacao[] = solicitacoesIniciais.map((s) => ({ ...s, timeline: [...s.timeline] }));

  list() {
    return this.items;
  }

  listByVinculoIds(vinculoIds: string[]) {
    return this.items.filter((s) => vinculoIds.includes(s.vinculoId));
  }

  getById(id: string) {
    return this.items.find((s) => s.id === id);
  }

  create(input: NovaSolicitacaoInput): Solicitacao {
    const id = `SOL-${String(this.items.length + 1).padStart(3, "0")}`;
    const now = new Date();
    const abertoEm = now.toISOString();
    const created: Solicitacao = {
      ...input,
      id,
      data: now.toLocaleDateString("pt-BR"),
      abertoEm,
      status: "pendente",
      responsavel: null,
      timeline: [
        {
          id: `${id}-t1`,
          data: abertoEm,
          autor: input.cliente,
          papel: "Cliente",
          texto: `Solicitação criada: ${input.item} — ${input.de} → ${input.para}.`,
          tipo: "criacao",
        },
      ],
    };
    this.items.push(created);
    return created;
  }

  updateStatus(id: string, status: StatusSolicitacao, responsavel: string | null = null) {
    const found = this.items.find((s) => s.id === id);
    if (!found) return undefined;
    found.status = status;
    if (responsavel !== null) found.responsavel = responsavel;
    if (status === "aprovado" || status === "recusado") {
      found.encerradoEm = new Date().toISOString();
      found.timeline = [
        ...found.timeline,
        {
          id: `${id}-t${found.timeline.length + 1}`,
          data: found.encerradoEm,
          autor: found.responsavel ?? "Construtora",
          papel: found.responsavel ? "Responsável técnico" : "Construtora",
          texto: status === "aprovado" ? "Solicitação aprovada com assinatura digital." : "Solicitação recusada.",
          tipo: status === "aprovado" ? "aprovacao" : "recusa",
        },
      ];
    }
    return { ...found };
  }
}

export class InMemoryEmpreendimentoCadastroRepository implements IEmpreendimentoCadastroRepository {
  private items: EmpreendimentoCadastrado[] = [];
  list() {
    return this.items;
  }
  create(input: CadastroEmpreendimentoInput): EmpreendimentoCadastrado {
    const created: EmpreendimentoCadastrado = {
      ...input,
      id: `EMP-${String(this.items.length + 1).padStart(3, "0")}`,
      criadoEm: new Date().toISOString(),
    };
    this.items.push(created);
    return created;
  }
}

export class InMemoryDashboardRepository implements IDashboardRepository {
  getDashboard() {
    return dashboardData;
  }
}

// Singleton instances — a prototype has one in-memory "database" per tab,
// shared across the whole app via context (see state/AppProvider.tsx).
export const repositories = {
  catalogo: new InMemoryCatalogoRepository(),
  materiais: new InMemoryMaterialCatalogoRepository(),
  vinculos: new InMemoryVinculoRepository(),
  brand: new InMemoryBrandRepository(),
  solicitacoes: new InMemorySolicitacaoRepository(),
  cadastros: new InMemoryEmpreendimentoCadastroRepository(),
  dashboard: new InMemoryDashboardRepository(),
};
