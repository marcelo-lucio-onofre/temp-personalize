import { NavLink, Navigate, Outlet } from "react-router-dom";
import { BarChart3, Building2, Package, Palette, Settings2, LayoutDashboard } from "lucide-react";
import { SidebarShell } from "./SidebarShell";
import { planttaBrand } from "../data/mockData";
import { useApp } from "../state/AppContext";

const operacao = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];
const configuracao = [
  { to: "/catalogo", label: "Catálogo", icon: Package },
  { to: "/cadastro", label: "Cadastro", icon: Building2 },
  { to: "/marca", label: "Marca", icon: Palette },
];

function NavGroup({ items }: { items: typeof operacao }) {
  return (
    <nav className="stack" style={{ gap: 2 }}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => "sidebar-nav-btn" + (isActive ? " active" : "")}>
          <item.icon className="sidebar-nav-icon" /> {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Construtora back-office shell, built on the shared SidebarShell template
 * — same consolidated sidebar as the client portal, always plantta-branded
 * (only the client portal can go white-label). "Aprovação" and "Termo"
 * aren't static nav items on purpose: they're reached in context —
 * Aprovação from a row in Painel, Termo from an approved solicitação —
 * not as standalone legacy shortcuts.
 */
export function ConstrutoraPortalLayout() {
  const { role, logout } = useApp();

  if (role !== "construtora") return <Navigate to="/login/construtora" replace />;

  return (
    <SidebarShell
      brandName={planttaBrand.nome}
      brandColor={planttaBrand.color}
      brandLogo={planttaBrand.logo}
      brandTag="Construtora"
      sections={[
        { label: "Operação", icon: LayoutDashboard, content: <NavGroup items={operacao} /> },
        { label: "Configuração", icon: Settings2, content: <NavGroup items={configuracao} /> },
      ]}
      onLogout={logout}
    >
      <Outlet />
    </SidebarShell>
  );
}
