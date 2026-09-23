import { Navigate, Route, Routes } from "react-router-dom";
import { ClientPortalLayout } from "./components/ClientPortalLayout";
import { ConstrutoraPortalLayout } from "./components/ConstrutoraPortalLayout";
import { AprovacaoPage } from "./pages/AprovacaoPage";
import { CadastroPage } from "./pages/CadastroPage";
import { CalculadoraPage } from "./pages/CalculadoraPage";
import { CarrinhoPage } from "./pages/CarrinhoPage";
import { CategoriasPage } from "./pages/CategoriasPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmpreendimentosPage } from "./pages/EmpreendimentosPage";
import { FornecedoresPage } from "./pages/FornecedoresPage";
import { FornecedorFormPage } from "./pages/FornecedorFormPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginClientePage } from "./pages/LoginClientePage";
import { LoginConstrutoraPage } from "./pages/LoginConstrutoraPage";
import { MarcaPage } from "./pages/MarcaPage";
import { ContatosConstrutoraPage } from "./pages/ContatosConstrutoraPage";
import { MarcasPage } from "./pages/MarcasPage";
import { MateriaisPage } from "./pages/MateriaisPage";
import { MinhaUnidadePage } from "./pages/MinhaUnidadePage";
import { PessoasPage } from "./pages/PessoasPage";
import { PessoaFormPage } from "./pages/PessoaFormPage";
import { NovaPersonalizacaoPage } from "./pages/NovaPersonalizacaoPage";
import { PainelPage } from "./pages/PainelPage";
import { PersonalizacaoDetalhePage } from "./pages/PersonalizacaoDetalhePage";
import { PersonalizacoesPage } from "./pages/PersonalizacoesPage";
import { PortalPage } from "./pages/PortalPage";
import { SelecaoPage } from "./pages/SelecaoPage";
import { SimpleLoginClientePage } from "./pages/SimpleLoginClientePage";
import { TermoPage } from "./pages/TermoPage";

export default function App() {
  return (
    <Routes>
      {/* Public — no app nav here on purpose: marketing/login pages don't
          expose internal product navigation. */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/cliente" element={<SimpleLoginClientePage />} />
      <Route path="/login/cliente/marca" element={<LoginClientePage />} />
      <Route path="/login/construtora" element={<LoginConstrutoraPage />} />
      {/* Reachable from both portals (cliente's "Minha unidade" and
          construtora's Aprovação) — lives outside either layout, with its
          own role check, since it's a standalone document, not nav-bound
          to one portal. */}
      <Route path="/termo/:vinculoId" element={<TermoPage />} />

      {/* Client portal — brand-themed (plantta or construtora, see
          ClientPortalLayout / effectiveBrand). "Minhas personalizações" is
          the landing page and the only standing sidebar destination; the
          unit picker lives inside the wizard (step 1), not as its own menu
          item. Portal/Carrinho/Calculadora/Seleção stay reachable (mainly
          from "Editar escolha" on a personalização's detail) but aren't
          advertised in the sidebar anymore. */}
      <Route element={<ClientPortalLayout />}>
        <Route path="/minha-unidade" element={<MinhaUnidadePage />} />
        <Route path="/personalizacoes" element={<PersonalizacoesPage />} />
        <Route path="/personalizacoes/nova" element={<NovaPersonalizacaoPage />} />
        <Route path="/personalizacoes/:id" element={<PersonalizacaoDetalhePage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/selecao/:itemId" element={<SelecaoPage />} />
        <Route path="/carrinho" element={<CarrinhoPage />} />
        <Route path="/calculadora" element={<CalculadoraPage />} />
      </Route>

      {/* Construtora back-office — always plantta-branded. */}
      <Route element={<ConstrutoraPortalLayout />}>
        <Route path="/catalogo/materiais" element={<MateriaisPage />} />
        <Route path="/catalogo/categorias" element={<CategoriasPage />} />
        <Route path="/catalogo/marcas" element={<MarcasPage />} />
        <Route path="/catalogo/fornecedores" element={<FornecedoresPage />} />
        <Route path="/catalogo/fornecedores/novo" element={<FornecedorFormPage />} />
        <Route path="/catalogo/fornecedores/:id" element={<FornecedorFormPage />} />
        <Route path="/cadastro" element={<EmpreendimentosPage />} />
        <Route path="/cadastro/novo" element={<CadastroPage />} />
        <Route path="/cadastro/:id" element={<CadastroPage />} />
        <Route path="/pessoas" element={<PessoasPage />} />
        <Route path="/pessoas/novo" element={<PessoaFormPage />} />
        <Route path="/pessoas/:id" element={<PessoaFormPage />} />
        <Route path="/marca" element={<MarcaPage />} />
        <Route path="/contatos" element={<ContatosConstrutoraPage />} />
        <Route path="/painel" element={<PainelPage />} />
        <Route path="/aprovacao/:id" element={<AprovacaoPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
