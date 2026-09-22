import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

/** Topo padrão de toda página de lista/formulário/detalhe dos cadastros —
 * voltar + breadcrumb + título + ação primária. Um lugar só pra essa
 * combinação em vez de cada página remontar o row/h1 na mão. */
export function PageHeader({
  breadcrumb,
  backTo,
  title,
  description,
  action,
}: {
  breadcrumb: BreadcrumbItem[];
  /** Rota explícita pro botão Voltar; sem isso usa o histórico do navegador. */
  backTo?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="row gap-sm" style={{ alignItems: "center", marginBottom: 6 }}>
        <button
          type="button"
          className="table-icon-btn"
          style={{ width: 28, height: 28, flexShrink: 0 }}
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="Voltar"
        >
          <ArrowLeft size={15} />
        </button>
        <Breadcrumb items={breadcrumb} />
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: description ? 6 : 0 }}>{title}</h1>
          {description && <p style={{ fontSize: 14, color: "var(--ink-soft)", maxWidth: "70ch", lineHeight: 1.5 }}>{description}</p>}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    </div>
  );
}
