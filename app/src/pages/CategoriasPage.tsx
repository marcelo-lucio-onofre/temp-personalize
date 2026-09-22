import { Breadcrumb } from "../components/Breadcrumb";
import { SimpleNomeCrud } from "../components/SimpleNomeCrud";
import { useApp } from "../state/AppContext";

export function CategoriasPage() {
  const { construtoraLogadaId, catalogoCategorias, criarCategoria, atualizarCategoria, removerCategoria } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const categorias = catalogoCategorias.list(construtoraId);

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Catálogo", to: "/catalogo" }, { label: "Categorias" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Categorias de material</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        Taxonomia fechada usada no cadastro de Materiais — evita "Piso" e "piso" virando duas linhas diferentes em relatório.
      </p>
      <SimpleNomeCrud
        titulo="Categorias"
        descricao="Uma por linha de acabamento — Piso, Bancada, Louças e Metais, Revestimento..."
        itens={categorias}
        onCriar={() => criarCategoria({ construtoraId, nome: "Nova categoria" })}
        onAtualizar={(id, nome) => atualizarCategoria(id, { nome })}
        onRemover={removerCategoria}
        placeholder="Piso"
      />
    </div>
  );
}
