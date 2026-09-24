import { NavLink, Navigate, Outlet } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { SidebarShell } from "./SidebarShell";
import { useApp } from "../state/AppContext";

/**
 * Client portal shell, built on the shared SidebarShell template. One
 * standing destination — "Minhas personalizações", which unifies the old
 * "Minha unidade" (running total) and the request list into a single
 * Construtora → Empreendimento → Unidade → Ambiente → Item tree, with a
 * term at every level. "Nova personalização" is NOT a menu
 * item on purpose: it already has its own button on that page, and
 * duplicating it in the sidebar just repeats the same action twice. The old
 * Construtora → Empreendimento → Unidade tree is gone too — picking a unit
 * happens as step 1 of the wizard.
 */
export function ClientPortalLayout() {
  const { role, vinculos, activeVinculo, effectiveBrand, catalogo, logout } = useApp();

  if (role !== "cliente") return <Navigate to="/login/cliente" replace />;

  const referencia = activeVinculo ?? vinculos[0];
  const compradorNome = referencia ? catalogo.getEmpreendimento(referencia.id)?.comprador : undefined;

  const navContent = (
    <div className="stack gap-sm">
      <NavLink to="/personalizacoes" className={({ isActive }) => "sidebar-nav-btn" + (isActive ? " active" : "")}>
        <ClipboardList className="sidebar-nav-icon" /> Minhas personalizações
      </NavLink>
    </div>
  );

  return (
    <SidebarShell
      brandName={effectiveBrand.nome}
      brandColor={effectiveBrand.color}
      brandLogo={effectiveBrand.logo}
      brandTag="Portal do cliente"
      sections={[{ label: "Personalização", content: navContent }]}
      userName={compradorNome}
      userRole="Cliente"
      onLogout={logout}
    >
      <Outlet />
    </SidebarShell>
  );
}
