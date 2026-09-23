import { SimpleCadastroPage } from "../components/SimpleCadastroPage";
import { useApp } from "../state/AppContext";
import { marcaEmUso } from "../domain/usage";

export function MarcasPage() {
  const { construtoraLogadaId, catalogoMarcas, catalogoMateriais, criarMarca, atualizarMarca, removerMarca } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const marcas = catalogoMarcas.list(construtoraId);
  const materiais = catalogoMateriais.list(construtoraId);

  return (
    <SimpleCadastroPage
      breadcrumb={[{ label: "Painel", to: "/painel" }, { label: "Cadastros auxiliares" }, { label: "Marcas" }]}
      titulo="Marcas"
      descricao="Usada no cadastro de Materiais — evita 'Portobello' e 'portobello' virando duas linhas diferentes em relatório."
      itemLabel="marca"
      placeholder="Portobello"
      itens={marcas}
      emUso={(id) => marcaEmUso(id, materiais)}
      emUsoMsg={(nome) => `"${nome}" está em uso por materiais cadastrados — remova o vínculo antes de excluir.`}
      onCriar={(nome) => criarMarca({ construtoraId, nome })}
      onAtualizar={(id, nome) => atualizarMarca(id, { nome })}
      onRemover={removerMarca}
    />
  );
}
