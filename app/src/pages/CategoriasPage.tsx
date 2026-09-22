import { SimpleCadastroPage } from "../components/SimpleCadastroPage";
import { useApp } from "../state/AppContext";
import { categoriaEmUso } from "../domain/usage";

export function CategoriasPage() {
  const { construtoraLogadaId, catalogoCategorias, catalogoMateriais, criarCategoria, atualizarCategoria, removerCategoria } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const categorias = catalogoCategorias.list(construtoraId);
  const materiais = catalogoMateriais.list(construtoraId);

  return (
    <SimpleCadastroPage
      breadcrumb={[{ label: "Painel", to: "/painel" }, { label: "Catálogo", to: "/catalogo" }, { label: "Categorias" }]}
      titulo="Categorias de material"
      descricao="Taxonomia fechada usada no cadastro de Materiais — evita 'Piso' e 'piso' virando duas linhas diferentes em relatório."
      itemLabel="categoria"
      placeholder="Piso"
      itens={categorias}
      emUso={(id) => categoriaEmUso(id, materiais)}
      emUsoMsg={(nome) => `"${nome}" está em uso por materiais cadastrados — remova o vínculo antes de excluir.`}
      onCriar={(nome) => criarCategoria({ construtoraId, nome })}
      onAtualizar={(id, nome) => atualizarCategoria(id, { nome })}
      onRemover={removerCategoria}
    />
  );
}
