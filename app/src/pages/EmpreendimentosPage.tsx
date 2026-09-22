import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { FilterBar, textMatch } from "../components/FilterBar";
import { useApp } from "../state/AppContext";
import { totalUnidadesTorres } from "../domain/calculations";
import type { StatusComercialEmpreendimento } from "../domain/types";

const STATUS: StatusComercialEmpreendimento[] = ["Planejamento", "Lançamento", "Em obras", "Entregue"];

export function EmpreendimentosPage() {
  const { construtoraLogadaId, cadastros } = useApp();
  const navigate = useNavigate();
  const construtoraId = construtoraLogadaId ?? "";
  const empreendimentos = cadastros.filter((c) => c.construtoraId === construtoraId);

  const [query, setQuery] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusComercialEmpreendimento | "">("");

  const filtrados = empreendimentos.filter(
    (e) => textMatch(query, e.nome, e.cidade) && (!statusFiltro || e.statusComercial === statusFiltro),
  );

  return (
    <div className="container container--wide">
      <PageHeader
        breadcrumb={[{ label: "Painel", to: "/painel" }, { label: "Cadastro" }]}
        title="Empreendimentos"
        description="Cada empreendimento aqui vira torres/unidades e um catálogo próprio de personalização."
        action={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate("/cadastro/novo")}>
            <Plus className="sidebar-nav-icon" /> Novo empreendimento
          </button>
        }
      />

      <FilterBar value={query} onChange={setQuery} placeholder="Buscar nome ou cidade..." suggestions={[...new Set(empreendimentos.flatMap((e) => [e.nome, e.cidade].filter(Boolean)))]}>
        <select className="input" style={{ maxWidth: 200 }} value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as StatusComercialEmpreendimento | "")}>
          <option value="">Todo estágio</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        columns={[
          { key: "nome", header: "Nome", render: (e) => <div style={{ fontWeight: 600 }}>{e.nome}</div> },
          { key: "tipo", header: "Tipo", render: (e) => e.tipo },
          { key: "cidade", header: "Cidade/UF", render: (e) => (e.cidade ? `${e.cidade}${e.uf ? "/" + e.uf : ""}` : "—") },
          { key: "status", header: "Estágio", render: (e) => <span className="badge badge--neutro">{e.statusComercial}</span> },
          { key: "unidades", header: "Unidades", mono: true, render: (e) => String(totalUnidadesTorres(e.torres)) },
          { key: "criadoEm", header: "Criado em", mono: true, render: (e) => new Date(e.criadoEm).toLocaleDateString("pt-BR") },
        ]}
        rows={filtrados}
        rowKey={(e) => e.id}
        emptyMessage={empreendimentos.length === 0 ? "Nenhum empreendimento cadastrado ainda." : "Nenhum resultado pra esse filtro."}
        actions={(e) => (
          <button type="button" className="table-icon-btn" onClick={() => navigate(`/cadastro/${e.id}`)} aria-label={`Continuar cadastro de ${e.nome}`} title="Continuar cadastro">
            <ArrowRight size={14} />
          </button>
        )}
      />
    </div>
  );
}
