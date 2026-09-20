import { Navigate, Route, Routes } from "react-router-dom";
import { ClientPortalLayout } from "./components/ClientPortalLayout";
import { ConstrutoraPortalLayout } from "./components/ConstrutoraPortalLayout";
import { AprovacaoPage } from "./pages/AprovacaoPage";
import { CadastroPage } from "./pages/CadastroPage";
import { CalculadoraPage } from "./pages/CalculadoraPage";
import { CarrinhoPage } from "./pages/CarrinhoPage";
import { CatalogoPage } from "./pages/CatalogoPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginClientePage } from "./pages/LoginClientePage";
import { LoginConstrutoraPage } from "./pages/LoginConstrutoraPage";
import { MarcaPage } from "./pages/MarcaPage";
import { MinhaUnidadePage } from "./pages/MinhaUnidadePage";
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
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/marca" element={<MarcaPage />} />
        <Route path="/painel" element={<PainelPage />} />
        <Route path="/aprovacao/:id" element={<AprovacaoPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
