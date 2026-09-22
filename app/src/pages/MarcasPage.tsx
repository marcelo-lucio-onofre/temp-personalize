import { Breadcrumb } from "../components/Breadcrumb";
import { SimpleNomeCrud } from "../components/SimpleNomeCrud";
import { useApp } from "../state/AppContext";

export function MarcasPage() {
  const { construtoraLogadaId, catalogoMarcas, criarMarca, atualizarMarca, removerMarca } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const marcas = catalogoMarcas.list(construtoraId);

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Catálogo", to: "/catalogo" }, { label: "Marcas" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Marcas</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        Usada no cadastro de Materiais — evita "Portobello" e "portobello" virando duas linhas diferentes em relatório.
      </p>
      <SimpleNomeCrud
        titulo="Marcas"
        descricao="Uma por fabricante — Portobello, Deca, Docol, Tramontina..."
        itens={marcas}
        onCriar={() => criarMarca({ construtoraId, nome: "Nova marca" })}
        onAtualizar={(id, nome) => atualizarMarca(id, { nome })}
        onRemover={removerMarca}
        placeholder="Portobello"
      />
    </div>
  );
}
