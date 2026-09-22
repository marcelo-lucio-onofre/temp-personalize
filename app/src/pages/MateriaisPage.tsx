import { Breadcrumb } from "../components/Breadcrumb";
import { BibliotecaMateriais } from "../components/CatalogoAuthoring";
import { useApp } from "../state/AppContext";

export function MateriaisPage() {
  const { construtoraLogadaId } = useApp();
  const construtoraId = construtoraLogadaId ?? "";

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Catálogo", to: "/catalogo" }, { label: "Materiais" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Materiais</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        Identidade do produto — categoria, marca, modelo, SKU. Preço e prazo entram por item, no momento em que o material é anexado a uma opção.
      </p>
      <BibliotecaMateriais construtoraId={construtoraId} />
    </div>
  );
}
