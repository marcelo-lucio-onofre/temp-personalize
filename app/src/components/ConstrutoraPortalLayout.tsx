import { NavLink, Navigate, Outlet } from "react-router-dom";
import type { ComponentType } from "react";
import { BarChart3, Building2, Package, Palette, Settings2, LayoutDashboard, Users } from "lucide-react";
import { SidebarShell } from "./SidebarShell";
import { planttaBrand } from "../data/mockData";
import { useApp } from "../state/AppContext";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  children?: { to: string; label: string }[];
}

const operacao: NavItem[] = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];
const configuracao: NavItem[] = [
  {
    to: "/catalogo",
    label: "Catálogo",
    icon: Package,
    children: [
      { to: "/catalogo/materiais", label: "Materiais" },
      { to: "/catalogo/categorias", label: "Categorias" },
      { to: "/catalogo/marcas", label: "Marcas" },
      { to: "/catalogo/fornecedores", label: "Fornecedores" },
    ],
  },
  { to: "/cadastro", label: "Cadastro", icon: Building2 },
  { to: "/pessoas", label: "Pessoas", icon: Users },
  { to: "/marca", label: "Marca", icon: Palette },
];

function NavGroup({ items }: { items: NavItem[] }) {
  return (
    <nav className="stack" style={{ gap: 2 }}>
      {items.map((item) => (
        <div key={item.to}>
          <NavLink to={item.to} end className={({ isActive }) => "sidebar-nav-btn" + (isActive ? " active" : "")}>
            <item.icon className="sidebar-nav-icon" /> {item.label}
          </NavLink>
          {item.children?.map((child) => (
            <NavLink key={child.to} to={child.to} className={({ isActive }) => "sidebar-nav-btn sidebar-nav-btn--sub" + (isActive ? " active" : "")}>
              {child.label}
            </NavLink>
          ))}
        </div>
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
  const { role, vinculos, construtoraLogadaId, logout } = useApp();

  if (role !== "construtora") return <Navigate to="/login/construtora" replace />;

  const construtoraNome = vinculos.find((v) => v.construtoraId === construtoraLogadaId)?.construtoraNome ?? "Construtora";

  return (
    <SidebarShell
      brandName={planttaBrand.nome}
      brandColor={planttaBrand.color}
      brandLogo={planttaBrand.logo}
      brandTag={construtoraNome}
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
