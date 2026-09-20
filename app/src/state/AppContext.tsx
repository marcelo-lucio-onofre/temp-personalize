import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { repositories } from "../data/repositories/inMemory";
import { planttaBrand } from "../data/mockData";
import type { NovaSolicitacaoInput } from "../data/repositories/types";
import type {
  AllowanceGroup,
  Ambiente,
  Brand,
  CadastroEmpreendimentoInput,
  EmpreendimentoCadastrado,
  MaterialCatalogItem,
  Role,
  Solicitacao,
  SolicitacaoMaterialProprio,
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
  brand: Brand;
  vinculos: Vinculo[];
  activeVinculoId: string | null;
  /** Set only when the client logged in through a specific construtora's
   * own (white-label) login — mimics that login being scoped by an auth
   * token tied to that construtora. Null for the generic plantta login,
   * which sees every construtora the client holds a unit with. */
  loginScopeConstrutoraId: string | null;
  /** Personalization choices, namespaced by vínculo so two units never
   * bleed into each other even when they share item ids. */
  choices: Record<string, Record<string, string>>;
  parametrico: Record<string, Record<string, number>>;
  customSubmissions: Record<string, SolicitacaoMaterialProprio>;
  solicitacoes: Solicitacao[];
  cadastros: EmpreendimentoCadastrado[];
  /** Bumped whenever the catalog (ambientes/allowance/materiais) is edited,
   * so anything reading it live in the same session re-renders — mirrors
   * the REFRESH_SOLICITACOES pattern below. */
  catalogoVersion: number;
}

type Action =
  | { type: "LOGIN_CLIENTE"; vinculoId: string | null }
  | { type: "LOGIN_CONSTRUTORA" }
  | { type: "LOGOUT" }
  | { type: "SELECIONAR_VINCULO"; vinculoId: string }
  | { type: "SAVE_BRAND"; brand: Brand }
  | { type: "CHOOSE_OPTION"; vinculoId: string; itemId: string; opcaoId: string }
  | { type: "SET_PARAMETRICO"; vinculoId: string; itemId: string; qtd: number }
  | { type: "SUBMIT_CUSTOM_MATERIAL"; submission: SolicitacaoMaterialProprio }
  | { type: "APROVAR_SOLICITACAO"; id: string }
  | { type: "RECUSAR_SOLICITACAO"; id: string }
  | { type: "REFRESH_SOLICITACOES" }
  | { type: "CADASTRAR_EMPREENDIMENTO"; input: CadastroEmpreendimentoInput }
  | { type: "CATALOGO_ATUALIZADO" };

function buildInitialState(): AppState {
  const session = loadSession();
  return {
    role: session?.role ?? null,
    brand: repositories.brand.getBrand(),
    vinculos: repositories.vinculos.listForCliente(),
    activeVinculoId: session?.activeVinculoId ?? null,
    loginScopeConstrutoraId: session?.loginScopeConstrutoraId ?? null,
    choices: {},
    parametrico: {},
    customSubmissions: {},
    solicitacoes: repositories.solicitacoes.list(),
    cadastros: repositories.cadastros.list(),
    catalogoVersion: 0,
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
      return { ...state, role: "construtora" };
    case "LOGOUT":
      return { ...state, role: null, activeVinculoId: null, loginScopeConstrutoraId: null };
    case "SELECIONAR_VINCULO":
      return { ...state, activeVinculoId: action.vinculoId };
    case "SAVE_BRAND": {
      const brand = repositories.brand.saveBrand(action.brand);
      return { ...state, brand };
    }
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
    case "CADASTRAR_EMPREENDIMENTO": {
      repositories.cadastros.create(action.input);
      return { ...state, cadastros: [...repositories.cadastros.list()] };
    }
    case "CATALOGO_ATUALIZADO":
      return { ...state, catalogoVersion: state.catalogoVersion + 1 };
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
  loginConstrutora: () => void;
  logout: () => void;
  selecionarVinculo: (vinculoId: string) => void;
  saveBrand: (brand: Brand) => void;
  chooseOption: (itemId: string, opcaoId: string) => void;
  setParametrico: (itemId: string, qtd: number) => void;
  submitCustomMaterial: (submission: SolicitacaoMaterialProprio) => void;
  aprovarSolicitacao: (id: string) => void;
  recusarSolicitacao: (id: string) => void;
  criarSolicitacao: (input: NovaSolicitacaoInput) => Solicitacao;
  cadastrarEmpreendimento: (input: CadastroEmpreendimentoInput) => void;
  salvarCatalogo: (empreendimentoId: string, ambientes: Ambiente[], allowanceGroups: AllowanceGroup[]) => void;
  criarMaterial: (input: Omit<MaterialCatalogItem, "id">) => MaterialCatalogItem;
  atualizarMaterial: (id: string, patch: Partial<Omit<MaterialCatalogItem, "id" | "construtoraId">>) => void;
  removerMaterial: (id: string) => void;
  catalogo: typeof repositories.catalogo;
  catalogoMateriais: typeof repositories.materiais;
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
    });
  }, [state.role, state.activeVinculoId, state.loginScopeConstrutoraId]);

  const loginCliente = useCallback((vinculoId?: string) => dispatch({ type: "LOGIN_CLIENTE", vinculoId: vinculoId ?? null }), []);
  const loginConstrutora = useCallback(() => dispatch({ type: "LOGIN_CONSTRUTORA" }), []);
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);
  const selecionarVinculo = useCallback((vinculoId: string) => dispatch({ type: "SELECIONAR_VINCULO", vinculoId }), []);
  const saveBrand = useCallback((brand: Brand) => dispatch({ type: "SAVE_BRAND", brand }), []);

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
  const aprovarSolicitacao = useCallback((id: string) => dispatch({ type: "APROVAR_SOLICITACAO", id }), []);
  const recusarSolicitacao = useCallback((id: string) => dispatch({ type: "RECUSAR_SOLICITACAO", id }), []);
  const criarSolicitacao = useCallback((input: NovaSolicitacaoInput) => {
    const created = repositories.solicitacoes.create(input);
    dispatch({ type: "REFRESH_SOLICITACOES" });
    return created;
  }, []);
  const cadastrarEmpreendimento = useCallback(
    (input: CadastroEmpreendimentoInput) => dispatch({ type: "CADASTRAR_EMPREENDIMENTO", input }),
    [],
  );
  const salvarCatalogo = useCallback((empreendimentoId: string, ambientesNovos: Ambiente[], allowanceGroups: AllowanceGroup[]) => {
    repositories.catalogo.replaceAmbientes(empreendimentoId, ambientesNovos);
    repositories.catalogo.replaceAllowanceGroups(empreendimentoId, allowanceGroups);
    dispatch({ type: "CATALOGO_ATUALIZADO" });
  }, []);
  const criarMaterial = useCallback((input: Omit<MaterialCatalogItem, "id">) => {
    const created = repositories.materiais.create(input);
    dispatch({ type: "CATALOGO_ATUALIZADO" });
    return created;
  }, []);
  const atualizarMaterial = useCallback((id: string, patch: Partial<Omit<MaterialCatalogItem, "id" | "construtoraId">>) => {
    repositories.materiais.update(id, patch);
    dispatch({ type: "CATALOGO_ATUALIZADO" });
  }, []);
  const removerMaterial = useCallback((id: string) => {
    repositories.materiais.remove(id);
    dispatch({ type: "CATALOGO_ATUALIZADO" });
  }, []);

  const activeVinculo = state.vinculos.find((v) => v.id === state.activeVinculoId);
  // Brand comes from how the session logged in (loginScopeConstrutoraId),
  // never from whichever vínculo is momentarily "active" — picking a unit
  // in the wizard, or the "Editar escolha" link, must not repaint the
  // whole portal in another construtora's colors mid-session.
  const loginVinculo = state.loginScopeConstrutoraId
    ? state.vinculos.find((v) => v.construtoraId === state.loginScopeConstrutoraId)
    : undefined;
  const effectiveBrand = loginVinculo?.brand ?? planttaBrand;
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
      chooseOption,
      setParametrico,
      submitCustomMaterial,
      aprovarSolicitacao,
      recusarSolicitacao,
      criarSolicitacao,
      cadastrarEmpreendimento,
      salvarCatalogo,
      criarMaterial,
      atualizarMaterial,
      removerMaterial,
      catalogo: repositories.catalogo,
      catalogoMateriais: repositories.materiais,
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
      chooseOption,
      setParametrico,
      submitCustomMaterial,
      aprovarSolicitacao,
      recusarSolicitacao,
      criarSolicitacao,
      cadastrarEmpreendimento,
      salvarCatalogo,
      criarMaterial,
      atualizarMaterial,
      removerMaterial,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
