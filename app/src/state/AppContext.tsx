import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { repositories } from "../data/repositories/inMemory";
import { planttaBrand } from "../data/mockData";
import type { NovaSolicitacaoInput } from "../data/repositories/types";
import type {
  AllowanceGroup,
  Ambiente,
  Brand,
  CadastroEmpreendimentoInput,
  Categoria,
  ContatoConstrutora,
  EmpreendimentoCadastrado,
  Fornecedor,
  Marca,
  MaterialCatalogItem,
  Pessoa,
  Planta,
  Role,
  Solicitacao,
  SolicitacaoMaterialProprio,
  UnidadeAssociada,
  Vinculo,
} from "../domain/types";

const EMPTY_RECORD: Record<string, never> = {};

// Session (who's logged in, as who) survives a page refresh via
// sessionStorage — F5 shouldn't bounce someone back to the login screen.
// It's per-tab and clears when the tab closes, unlike localStorage, which
// matches "still logged in if I reload" without pretending this prototype
// has real persistent auth. The mock data itself (choices, solicitações
// created in this session) stays in-memory-only, as documented in design.md.
const SESSION_KEY = "plantta:session";

interface PersistedSession {
  role: Role;
  activeVinculoId: string | null;
  loginScopeConstrutoraId: string | null;
  construtoraLogadaId: string | null;
}

function loadSession(): PersistedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: PersistedSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (private mode, etc.) — session just won't
    // survive a refresh; nothing else in the app depends on it.
  }
}

interface AppState {
  role: Role;
  vinculos: Vinculo[];
  activeVinculoId: string | null;
  /** Set only when the client logged in through a specific construtora's
   * own (white-label) login — mimics that login being scoped by an auth
   * token tied to that construtora. Null for the generic plantta login,
   * which sees every construtora the client holds a unit with. */
  loginScopeConstrutoraId: string | null;
  /** Which construtora a construtora-side session logged in as — Painel,
   * Marca and Catálogo all scope to this, never to every construtora at
   * once. Set at LOGIN_CONSTRUTORA time, from the login screen's picker. */
  construtoraLogadaId: string | null;
  /** Personalization choices, namespaced by vínculo so two units never
   * bleed into each other even when they share item ids. */
  choices: Record<string, Record<string, string>>;
  parametrico: Record<string, Record<string, number>>;
  customSubmissions: Record<string, SolicitacaoMaterialProprio>;
  /** Termo de não personalização assinado, por vínculo → ISO datetime da
   * assinatura. Ausente = cliente não abriu mão (ou revogou). */
  naoPersonalizacao: Record<string, string>;
  solicitacoes: Solicitacao[];
  cadastros: EmpreendimentoCadastrado[];
  /** Bumped whenever data that lives outside the reducer (catalog, brand)
   * is edited, so anything reading it live in the same session re-renders
   * — mirrors the REFRESH_SOLICITACOES pattern below. */
  dadosVersion: number;
}

type Action =
  | { type: "LOGIN_CLIENTE"; vinculoId: string | null }
  | { type: "LOGIN_CONSTRUTORA"; construtoraId: string }
  | { type: "LOGOUT" }
  | { type: "SELECIONAR_VINCULO"; vinculoId: string }
  | { type: "CHOOSE_OPTION"; vinculoId: string; itemId: string; opcaoId: string }
  | { type: "SET_PARAMETRICO"; vinculoId: string; itemId: string; qtd: number }
  | { type: "SUBMIT_CUSTOM_MATERIAL"; submission: SolicitacaoMaterialProprio }
  | { type: "ASSINAR_NAO_PERSONALIZACAO"; vinculoId: string; assinadoEm: string }
  | { type: "REVOGAR_NAO_PERSONALIZACAO"; vinculoId: string }
  | { type: "APROVAR_SOLICITACAO"; id: string }
  | { type: "RECUSAR_SOLICITACAO"; id: string }
  | { type: "REFRESH_SOLICITACOES" }
  | { type: "REFRESH_CADASTROS" }
  | { type: "DADOS_ATUALIZADOS" };

function buildInitialState(): AppState {
  const session = loadSession();
  return {
    role: session?.role ?? null,
    vinculos: repositories.vinculos.listForCliente(),
    activeVinculoId: session?.activeVinculoId ?? null,
    loginScopeConstrutoraId: session?.loginScopeConstrutoraId ?? null,
    construtoraLogadaId: session?.construtoraLogadaId ?? null,
    choices: {},
    parametrico: {},
    customSubmissions: {},
    naoPersonalizacao: {},
    solicitacoes: repositories.solicitacoes.list(),
    cadastros: repositories.cadastros.list(),
    dadosVersion: 0,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN_CLIENTE": {
      const scopeVinculo = action.vinculoId ? state.vinculos.find((v) => v.id === action.vinculoId) : undefined;
      return {
        ...state,
        role: "cliente",
        activeVinculoId: action.vinculoId,
        loginScopeConstrutoraId: scopeVinculo?.construtoraId ?? null,
      };
    }
    case "LOGIN_CONSTRUTORA":
      return { ...state, role: "construtora", construtoraLogadaId: action.construtoraId };
    case "LOGOUT":
      return { ...state, role: null, activeVinculoId: null, loginScopeConstrutoraId: null, construtoraLogadaId: null };
    case "SELECIONAR_VINCULO":
      return { ...state, activeVinculoId: action.vinculoId };
    case "CHOOSE_OPTION":
      return {
        ...state,
        choices: {
          ...state.choices,
          [action.vinculoId]: { ...state.choices[action.vinculoId], [action.itemId]: action.opcaoId },
        },
      };
    case "SET_PARAMETRICO":
      return {
        ...state,
        parametrico: {
          ...state.parametrico,
          [action.vinculoId]: { ...state.parametrico[action.vinculoId], [action.itemId]: action.qtd },
        },
      };
    case "SUBMIT_CUSTOM_MATERIAL":
      return {
        ...state,
        customSubmissions: { ...state.customSubmissions, [action.submission.itemId]: action.submission },
      };
    case "ASSINAR_NAO_PERSONALIZACAO":
      return { ...state, naoPersonalizacao: { ...state.naoPersonalizacao, [action.vinculoId]: action.assinadoEm } };
    case "REVOGAR_NAO_PERSONALIZACAO": {
      const naoPersonalizacao = { ...state.naoPersonalizacao };
      delete naoPersonalizacao[action.vinculoId];
      return { ...state, naoPersonalizacao };
    }
    case "APROVAR_SOLICITACAO": {
      repositories.solicitacoes.updateStatus(action.id, "aprovado");
      return { ...state, solicitacoes: [...repositories.solicitacoes.list()] };
    }
    case "RECUSAR_SOLICITACAO": {
      repositories.solicitacoes.updateStatus(action.id, "recusado");
      return { ...state, solicitacoes: [...repositories.solicitacoes.list()] };
    }
    case "REFRESH_SOLICITACOES":
      return { ...state, solicitacoes: [...repositories.solicitacoes.list()] };
    case "REFRESH_CADASTROS":
      return { ...state, cadastros: [...repositories.cadastros.list()] };
    case "DADOS_ATUALIZADOS":
      return { ...state, dadosVersion: state.dadosVersion + 1 };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  activeVinculo: Vinculo | undefined;
  /** The brand THIS vínculo's portal should render with — the construtora's
   * own brand if it opted into white-label, plantta's otherwise. */
  effectiveBrand: Brand;
  vinculoChoices: Record<string, string>;
  vinculoParametrico: Record<string, number>;
  loginCliente: (vinculoId?: string) => void;
  loginConstrutora: (construtoraId: string) => void;
  logout: () => void;
  selecionarVinculo: (vinculoId: string) => void;
  saveBrand: (construtoraId: string, brand: Brand) => void;
  saveContatoConstrutora: (construtoraId: string, contato: ContatoConstrutora) => void;
  chooseOption: (itemId: string, opcaoId: string) => void;
  setParametrico: (itemId: string, qtd: number) => void;
  submitCustomMaterial: (submission: SolicitacaoMaterialProprio) => void;
  assinarNaoPersonalizacao: (vinculoId: string) => void;
  revogarNaoPersonalizacao: (vinculoId: string) => void;
  aprovarSolicitacao: (id: string) => void;
  recusarSolicitacao: (id: string) => void;
  criarSolicitacao: (input: NovaSolicitacaoInput) => Solicitacao;
  cadastrarEmpreendimento: (input: CadastroEmpreendimentoInput) => EmpreendimentoCadastrado;
  atualizarArquivosCadastro: (id: string, arquivos: CadastroEmpreendimentoInput["arquivos"]) => void;
  salvarCatalogo: (empreendimentoId: string, plantaId: string, ambientes: Ambiente[], allowanceGroups: AllowanceGroup[]) => void;
  salvarPlanta: (empreendimentoId: string, planta: Planta) => void;
  removerPlanta: (empreendimentoId: string, plantaId: string) => void;
  criarMaterial: (input: Omit<MaterialCatalogItem, "id">) => MaterialCatalogItem;
  atualizarMaterial: (id: string, patch: Partial<Omit<MaterialCatalogItem, "id" | "construtoraId">>) => void;
  removerMaterial: (id: string) => void;
  criarCategoria: (input: Omit<Categoria, "id">) => Categoria;
  atualizarCategoria: (id: string, patch: Partial<Omit<Categoria, "id" | "construtoraId">>) => void;
  removerCategoria: (id: string) => void;
  criarMarca: (input: Omit<Marca, "id">) => Marca;
  atualizarMarca: (id: string, patch: Partial<Omit<Marca, "id" | "construtoraId">>) => void;
  removerMarca: (id: string) => void;
  criarFornecedor: (input: Omit<Fornecedor, "id">) => Fornecedor;
  atualizarFornecedor: (id: string, patch: Partial<Omit<Fornecedor, "id" | "construtoraId">>) => void;
  removerFornecedor: (id: string) => void;
  salvarUnidade: (unidade: UnidadeAssociada) => void;
  criarPessoa: (input: Omit<Pessoa, "id">) => Pessoa;
  atualizarPessoa: (id: string, patch: Partial<Omit<Pessoa, "id" | "construtoraId">>) => void;
  removerPessoa: (id: string) => void;
  catalogo: typeof repositories.catalogo;
  catalogoMateriais: typeof repositories.materiais;
  catalogoCategorias: typeof repositories.categorias;
  catalogoMarcas: typeof repositories.marcas;
  unidadesRepo: typeof repositories.unidades;
  pessoasRepo: typeof repositories.pessoas;
  catalogoFornecedores: typeof repositories.fornecedores;
  brandRepo: typeof repositories.brand;
  contatoConstrutoraRepo: typeof repositories.contatoConstrutora;
  dashboard: typeof repositories.dashboard;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  useEffect(() => {
    saveSession({
      role: state.role,
      activeVinculoId: state.activeVinculoId,
      loginScopeConstrutoraId: state.loginScopeConstrutoraId,
      construtoraLogadaId: state.construtoraLogadaId,
    });
  }, [state.role, state.activeVinculoId, state.loginScopeConstrutoraId, state.construtoraLogadaId]);

  const loginCliente = useCallback((vinculoId?: string) => dispatch({ type: "LOGIN_CLIENTE", vinculoId: vinculoId ?? null }), []);
  const loginConstrutora = useCallback((construtoraId: string) => dispatch({ type: "LOGIN_CONSTRUTORA", construtoraId }), []);
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);
  const selecionarVinculo = useCallback((vinculoId: string) => dispatch({ type: "SELECIONAR_VINCULO", vinculoId }), []);
  const saveBrand = useCallback((construtoraId: string, brand: Brand) => {
    repositories.brand.saveBrand(construtoraId, brand);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const saveContatoConstrutora = useCallback((construtoraId: string, contato: ContatoConstrutora) => {
    repositories.contatoConstrutora.saveContato(construtoraId, contato);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);

  const activeVinculoId = state.activeVinculoId;
  const chooseOption = useCallback(
    (itemId: string, opcaoId: string) => {
      if (!activeVinculoId) return;
      dispatch({ type: "CHOOSE_OPTION", vinculoId: activeVinculoId, itemId, opcaoId });
    },
    [activeVinculoId],
  );
  const setParametrico = useCallback(
    (itemId: string, qtd: number) => {
      if (!activeVinculoId) return;
      dispatch({ type: "SET_PARAMETRICO", vinculoId: activeVinculoId, itemId, qtd });
    },
    [activeVinculoId],
  );
  const submitCustomMaterial = useCallback(
    (submission: SolicitacaoMaterialProprio) => dispatch({ type: "SUBMIT_CUSTOM_MATERIAL", submission }),
    [],
  );
  const assinarNaoPersonalizacao = useCallback(
    (vinculoId: string) => dispatch({ type: "ASSINAR_NAO_PERSONALIZACAO", vinculoId, assinadoEm: new Date().toISOString() }),
    [],
  );
  const revogarNaoPersonalizacao = useCallback((vinculoId: string) => dispatch({ type: "REVOGAR_NAO_PERSONALIZACAO", vinculoId }), []);
  const aprovarSolicitacao = useCallback((id: string) => dispatch({ type: "APROVAR_SOLICITACAO", id }), []);
  const recusarSolicitacao = useCallback((id: string) => dispatch({ type: "RECUSAR_SOLICITACAO", id }), []);
  const criarSolicitacao = useCallback((input: NovaSolicitacaoInput) => {
    const created = repositories.solicitacoes.create(input);
    dispatch({ type: "REFRESH_SOLICITACOES" });
    return created;
  }, []);
  const cadastrarEmpreendimento = useCallback((input: CadastroEmpreendimentoInput) => {
    const created = repositories.cadastros.create(input);
    repositories.catalogo.registrarEmpreendimento(created.id, input.construtoraId, input.nome);
    dispatch({ type: "REFRESH_CADASTROS" });
    return created;
  }, []);
  const atualizarArquivosCadastro = useCallback((id: string, arquivos: CadastroEmpreendimentoInput["arquivos"]) => {
    repositories.cadastros.updateArquivos(id, arquivos);
    dispatch({ type: "REFRESH_CADASTROS" });
  }, []);
  const salvarCatalogo = useCallback((empreendimentoId: string, plantaId: string, ambientesNovos: Ambiente[], allowanceGroups: AllowanceGroup[]) => {
    repositories.catalogo.replaceAmbientes(empreendimentoId, plantaId, ambientesNovos);
    repositories.catalogo.replaceAllowanceGroups(empreendimentoId, plantaId, allowanceGroups);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const salvarPlanta = useCallback((empreendimentoId: string, planta: Planta) => {
    repositories.catalogo.upsertPlanta(empreendimentoId, planta);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const removerPlanta = useCallback((empreendimentoId: string, plantaId: string) => {
    repositories.catalogo.removePlanta(empreendimentoId, plantaId);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const criarMaterial = useCallback((input: Omit<MaterialCatalogItem, "id">) => {
    const created = repositories.materiais.create(input);
    dispatch({ type: "DADOS_ATUALIZADOS" });
    return created;
  }, []);
  const atualizarMaterial = useCallback((id: string, patch: Partial<Omit<MaterialCatalogItem, "id" | "construtoraId">>) => {
    repositories.materiais.update(id, patch);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const removerMaterial = useCallback((id: string) => {
    repositories.materiais.remove(id);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const criarCategoria = useCallback((input: Omit<Categoria, "id">) => {
    const created = repositories.categorias.create(input);
    dispatch({ type: "DADOS_ATUALIZADOS" });
    return created;
  }, []);
  const atualizarCategoria = useCallback((id: string, patch: Partial<Omit<Categoria, "id" | "construtoraId">>) => {
    repositories.categorias.update(id, patch);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const removerCategoria = useCallback((id: string) => {
    repositories.categorias.remove(id);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const criarMarca = useCallback((input: Omit<Marca, "id">) => {
    const created = repositories.marcas.create(input);
    dispatch({ type: "DADOS_ATUALIZADOS" });
    return created;
  }, []);
  const atualizarMarca = useCallback((id: string, patch: Partial<Omit<Marca, "id" | "construtoraId">>) => {
    repositories.marcas.update(id, patch);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const removerMarca = useCallback((id: string) => {
    repositories.marcas.remove(id);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const criarFornecedor = useCallback((input: Omit<Fornecedor, "id">) => {
    const created = repositories.fornecedores.create(input);
    dispatch({ type: "DADOS_ATUALIZADOS" });
    return created;
  }, []);
  const atualizarFornecedor = useCallback((id: string, patch: Partial<Omit<Fornecedor, "id" | "construtoraId">>) => {
    repositories.fornecedores.update(id, patch);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const removerFornecedor = useCallback((id: string) => {
    repositories.fornecedores.remove(id);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const salvarUnidade = useCallback((unidade: UnidadeAssociada) => {
    repositories.unidades.upsert(unidade);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const criarPessoa = useCallback((input: Omit<Pessoa, "id">) => {
    const created = repositories.pessoas.create(input);
    dispatch({ type: "DADOS_ATUALIZADOS" });
    return created;
  }, []);
  const atualizarPessoa = useCallback((id: string, patch: Partial<Omit<Pessoa, "id" | "construtoraId">>) => {
    repositories.pessoas.update(id, patch);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);
  const removerPessoa = useCallback((id: string) => {
    repositories.pessoas.remove(id);
    dispatch({ type: "DADOS_ATUALIZADOS" });
  }, []);

  const activeVinculo = state.vinculos.find((v) => v.id === state.activeVinculoId);
  // Brand comes from how the session logged in (loginScopeConstrutoraId),
  // never from whichever vínculo is momentarily "active" — picking a unit
  // in the wizard, or the "Editar escolha" link, must not repaint the
  // whole portal in another construtora's colors mid-session. Read live
  // from the brand repository (what MarcaPage actually edits), not from
  // the vínculo's own `brand` field, which is only a seed snapshot.
  const effectiveBrand = (state.loginScopeConstrutoraId && repositories.brand.getBrand(state.loginScopeConstrutoraId)) || planttaBrand;
  const vinculoChoices = (activeVinculoId && state.choices[activeVinculoId]) || EMPTY_RECORD;
  const vinculoParametrico = (activeVinculoId && state.parametrico[activeVinculoId]) || EMPTY_RECORD;

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      activeVinculo,
      effectiveBrand,
      vinculoChoices,
      vinculoParametrico,
      loginCliente,
      loginConstrutora,
      logout,
      selecionarVinculo,
      saveBrand,
      saveContatoConstrutora,
      chooseOption,
      setParametrico,
      submitCustomMaterial,
      assinarNaoPersonalizacao,
      revogarNaoPersonalizacao,
      aprovarSolicitacao,
      recusarSolicitacao,
      criarSolicitacao,
      cadastrarEmpreendimento,
      atualizarArquivosCadastro,
      salvarCatalogo,
      salvarPlanta,
      removerPlanta,
      criarMaterial,
      atualizarMaterial,
      removerMaterial,
      criarCategoria,
      atualizarCategoria,
      removerCategoria,
      criarMarca,
      atualizarMarca,
      removerMarca,
      criarFornecedor,
      atualizarFornecedor,
      removerFornecedor,
      salvarUnidade,
      criarPessoa,
      atualizarPessoa,
      removerPessoa,
      catalogo: repositories.catalogo,
      catalogoMateriais: repositories.materiais,
      catalogoCategorias: repositories.categorias,
      catalogoMarcas: repositories.marcas,
      catalogoFornecedores: repositories.fornecedores,
      unidadesRepo: repositories.unidades,
      pessoasRepo: repositories.pessoas,
      brandRepo: repositories.brand,
      contatoConstrutoraRepo: repositories.contatoConstrutora,
      dashboard: repositories.dashboard,
    }),
    [
      state,
      activeVinculo,
      effectiveBrand,
      vinculoChoices,
      vinculoParametrico,
      loginCliente,
      loginConstrutora,
      logout,
      selecionarVinculo,
      saveBrand,
      saveContatoConstrutora,
      chooseOption,
      setParametrico,
      submitCustomMaterial,
      assinarNaoPersonalizacao,
      revogarNaoPersonalizacao,
      aprovarSolicitacao,
      recusarSolicitacao,
      criarSolicitacao,
      cadastrarEmpreendimento,
      atualizarArquivosCadastro,
      salvarCatalogo,
      salvarPlanta,
      removerPlanta,
      criarMaterial,
      atualizarMaterial,
      removerMaterial,
      criarCategoria,
      atualizarCategoria,
      removerCategoria,
      criarMarca,
      atualizarMarca,
      removerMarca,
      criarFornecedor,
      atualizarFornecedor,
      removerFornecedor,
      salvarUnidade,
      criarPessoa,
      atualizarPessoa,
      removerPessoa,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
