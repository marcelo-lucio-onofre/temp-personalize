// In-memory implementations. Each repository owns its own module-level
// array/object as "storage" — data survives navigation within the session
// (React state re-renders read through these) and resets on full reload,
// which is the persistence model asked for in a navigable prototype.
import type {
  AllowanceGroup,
  Ambiente,
  Brand,
  CadastroEmpreendimentoInput,
  Categoria,
  EmpreendimentoCadastrado,
  Fornecedor,
  Item,
  Marca,
  MaterialCatalogItem,
  Planta,
  Solicitacao,
  StatusSolicitacao,
  UnidadeAssociada,
} from "../../domain/types";
import { plantaKey } from "../../domain/calculations";
import {
  allowanceGroupsPorPlanta,
  ambientesPorPlanta,
  categoriasIniciais,
  dashboardData,
  empreendimento,
  empreendimentoAllianceBoulevard501,
  empreendimentoAllianceBoulevard1502,
  empreendimentoAllianceJardins,
  empreendimentoVistaVerde,
  fornecedoresIniciais,
  initialBrand,
  marcasIniciais,
  materialCatalogInicial,
  plantasPorEmpreendimento,
  solicitacoesIniciais,
  vinculos,
} from "../mockData";
import type {
  IBrandRepository,
  ICatalogoRepository,
  ICategoriaRepository,
  IDashboardRepository,
  IEmpreendimentoCadastroRepository,
  IFornecedorRepository,
  IMarcaRepository,
  IMaterialCatalogoRepository,
  ISolicitacaoRepository,
  IUnidadeRepository,
  IVinculoRepository,
  NovaSolicitacaoInput,
} from "./types";

/** Fábrica de CRUD in-memory idêntico pra Categoria/Marca/Fornecedor/
 * Material — mesma forma (list/create/update/remove por construtoraId),
 * evita três classes copiadas. */
function makeCrudRepo<T extends { id: string; construtoraId: string }>(seed: T[], idPrefix: string) {
  let items: T[] = seed.map((i) => ({ ...i }));
  return {
    list(construtoraId: string): T[] {
      return items.filter((i) => i.construtoraId === construtoraId);
    },
    create(input: Omit<T, "id">): T {
      const created = { ...input, id: `${idPrefix}-${Date.now()}-${Math.round(Math.random() * 1000)}` } as T;
      items.push(created);
      return created;
    },
    update(id: string, patch: Partial<Omit<T, "id" | "construtoraId">>): T | undefined {
      const found = items.find((i) => i.id === id);
      if (!found) return undefined;
      Object.assign(found, patch);
      return { ...found };
    },
    remove(id: string) {
      items = items.filter((i) => i.id !== id);
    },
  };
}

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
  // Empreendimentos registered via registrarEmpreendimento (fresh Cadastro,
  // no vínculo/client yet) — merged into listEmpreendimentosByConstrutora
  // alongside the vínculo-derived (demo) ones.
  private cadastrados: { empreendimentoId: string; construtoraId: string; nome: string }[] = [];

  getEmpreendimento(vinculoId: string) {
    return empreendimentoPorVinculo[vinculoId];
  }
  getAmbientes(vinculoId: string) {
    const v = vinculos.find((v) => v.id === vinculoId);
    return v ? (ambientesPorPlanta[plantaKey(v.empreendimentoId, v.plantaId)] ?? []) : [];
  }
  getAllowanceGroups(vinculoId: string) {
    const v = vinculos.find((v) => v.id === vinculoId);
    return v ? (allowanceGroupsPorPlanta[plantaKey(v.empreendimentoId, v.plantaId)] ?? []) : [];
  }
  listEmpreendimentosByConstrutora(construtoraId: string) {
    const seen = new Map<string, string>();
    for (const v of vinculos) {
      if (v.construtoraId === construtoraId && !seen.has(v.empreendimentoId)) {
        seen.set(v.empreendimentoId, v.empreendimentoNome);
      }
    }
    for (const c of this.cadastrados) {
      if (c.construtoraId === construtoraId && !seen.has(c.empreendimentoId)) {
        seen.set(c.empreendimentoId, c.nome);
      }
    }
    return [...seen.entries()].map(([empreendimentoId, nome]) => ({ empreendimentoId, nome }));
  }
  listTodosItensDoEmpreendimento(empreendimentoId: string): Item[] {
    const plantas = plantasPorEmpreendimento[empreendimentoId] ?? [];
    const itens: Item[] = [];
    for (const p of plantas) {
      const ambientes = ambientesPorPlanta[plantaKey(empreendimentoId, p.id)] ?? [];
      for (const a of ambientes) itens.push(...a.itens);
    }
    return itens;
  }
  listPlantas(empreendimentoId: string) {
    return plantasPorEmpreendimento[empreendimentoId] ?? [];
  }
  upsertPlanta(empreendimentoId: string, planta: Planta) {
    const lista = plantasPorEmpreendimento[empreendimentoId] ?? (plantasPorEmpreendimento[empreendimentoId] = []);
    const i = lista.findIndex((p) => p.id === planta.id);
    if (i >= 0) lista[i] = planta;
    else lista.push(planta);
    const key = plantaKey(empreendimentoId, planta.id);
    if (!ambientesPorPlanta[key]) ambientesPorPlanta[key] = [];
    if (!allowanceGroupsPorPlanta[key]) allowanceGroupsPorPlanta[key] = [];
  }
  removePlanta(empreendimentoId: string, plantaId: string) {
    const lista = plantasPorEmpreendimento[empreendimentoId];
    if (lista) plantasPorEmpreendimento[empreendimentoId] = lista.filter((p) => p.id !== plantaId);
    const key = plantaKey(empreendimentoId, plantaId);
    delete ambientesPorPlanta[key];
    delete allowanceGroupsPorPlanta[key];
  }
  getAmbientesByPlanta(empreendimentoId: string, plantaId: string) {
    return ambientesPorPlanta[plantaKey(empreendimentoId, plantaId)] ?? [];
  }
  getAllowanceGroupsByPlanta(empreendimentoId: string, plantaId: string) {
    return allowanceGroupsPorPlanta[plantaKey(empreendimentoId, plantaId)] ?? [];
  }
  replaceAmbientes(empreendimentoId: string, plantaId: string, ambientesNovos: Ambiente[]) {
    ambientesPorPlanta[plantaKey(empreendimentoId, plantaId)] = ambientesNovos;
  }
  replaceAllowanceGroups(empreendimentoId: string, plantaId: string, groups: AllowanceGroup[]) {
    allowanceGroupsPorPlanta[plantaKey(empreendimentoId, plantaId)] = groups;
  }
  registrarEmpreendimento(empreendimentoId: string, construtoraId: string, nome: string) {
    this.cadastrados.push({ empreendimentoId, construtoraId, nome });
    plantasPorEmpreendimento[empreendimentoId] = [];
  }
}

export function makeMaterialCatalogoRepository(): IMaterialCatalogoRepository {
  return makeCrudRepo<MaterialCatalogItem>(materialCatalogInicial, "mc");
}
export function makeCategoriaRepository(): ICategoriaRepository {
  return makeCrudRepo<Categoria>(categoriasIniciais, "cat");
}
export function makeMarcaRepository(): IMarcaRepository {
  return makeCrudRepo<Marca>(marcasIniciais, "marca");
}
export function makeFornecedorRepository(): IFornecedorRepository {
  return makeCrudRepo<Fornecedor>(fornecedoresIniciais, "forn");
}

export class InMemoryUnidadeRepository implements IUnidadeRepository {
  private items: UnidadeAssociada[] = [];

  listByEmpreendimento(empreendimentoId: string) {
    return this.items.filter((u) => u.empreendimentoId === empreendimentoId);
  }

  upsert(unidade: UnidadeAssociada) {
    const i = this.items.findIndex((u) => u.empreendimentoId === unidade.empreendimentoId && u.numero === unidade.numero);
    if (i >= 0) this.items[i] = unidade;
    else this.items.push(unidade);
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
  // Only Alliance ("00003") starts opted into white-label — matches the
  // Alliance vínculos' own seed brand. Prado/Horizonte start unset (null),
  // same as their vínculos' brand: null.
  private brands: Record<string, Brand> = { "00003": { ...initialBrand } };
  getBrand(construtoraId: string) {
    return this.brands[construtoraId] ?? null;
  }
  saveBrand(construtoraId: string, brand: Brand) {
    this.brands[construtoraId] = brand;
    return brand;
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
  updateArquivos(id: string, arquivos: CadastroEmpreendimentoInput["arquivos"]) {
    const found = this.items.find((i) => i.id === id);
    if (!found) return undefined;
    found.arquivos = arquivos;
    return { ...found };
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
  materiais: makeMaterialCatalogoRepository(),
  categorias: makeCategoriaRepository(),
  marcas: makeMarcaRepository(),
  fornecedores: makeFornecedorRepository(),
  unidades: new InMemoryUnidadeRepository(),
  vinculos: new InMemoryVinculoRepository(),
  brand: new InMemoryBrandRepository(),
  solicitacoes: new InMemorySolicitacaoRepository(),
  cadastros: new InMemoryEmpreendimentoCadastroRepository(),
  dashboard: new InMemoryDashboardRepository(),
};
