import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { FilterBar, textMatch } from "../components/FilterBar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import { useApp } from "../state/AppContext";
import type { Pessoa, TipoPapel } from "../domain/types";

const PAPEIS: TipoPapel[] = ["Arquiteto", "Engenheiro", "Técnico", "Designer", "Projetista", "Consultor", "Cliente", "Responsável pela construtora", "Outro"];

/**
 * Pessoa/Papel — cadastro único pra qualquer humano com quem a construtora
 * lida, em vez de telas separadas por "tipo" (arquiteto, técnico, cliente).
 * A mesma pessoa pode acumular papéis (ex.: Arquiteto + Responsável pela
 * construtora).
 */
export function PessoasPage() {
  const { construtoraLogadaId, pessoasRepo, removerPessoa } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const construtoraId = construtoraLogadaId ?? "";
  const pessoas = pessoasRepo.list(construtoraId);

  const [query, setQuery] = useState("");
  const [papelFiltro, setPapelFiltro] = useState<TipoPapel | "todos">("todos");
  const [excluindo, setExcluindo] = useState<Pessoa | null>(null);

  const filtradas = pessoas.filter(
    (p) => textMatch(query, p.nome, p.empresa) && (papelFiltro === "todos" || p.papeis.includes(papelFiltro)),
  );

  function confirmarExclusao() {
    if (!excluindo) return;
    removerPessoa(excluindo.id);
    toast.success("Pessoa excluída.");
    setExcluindo(null);
  }

  return (
    <div className="container">
      <PageHeader
        breadcrumb={[{ label: "Painel", to: "/painel" }, { label: "Pessoas" }]}
        title="Pessoas"
        description="Um cadastro só pra qualquer pessoa — arquiteto, engenheiro, técnico, cliente. A mesma pessoa pode ter mais de um papel ao mesmo tempo, em vez de virar registros duplicados em telas separadas."
        action={
          <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate("/pessoas/novo")}>
            <Plus className="sidebar-nav-icon" /> Nova pessoa
          </button>
        }
      />

      <div className="row gap-xs" style={{ marginBottom: 14, flexWrap: "wrap" }}>
        <button type="button" className="btn btn--sm" style={papelFiltro === "todos" ? { background: "var(--green-bg)", borderColor: "var(--green)", color: "var(--green-ink)" } : {}} onClick={() => setPapelFiltro("todos")}>
          Todos <span className="mono" style={{ opacity: 0.7, marginLeft: 4 }}>{pessoas.length}</span>
        </button>
        {PAPEIS.map((papel) => {
          const count = pessoas.filter((p) => p.papeis.includes(papel)).length;
          if (count === 0) return null;
          const active = papelFiltro === papel;
          return (
            <button key={papel} type="button" className="btn btn--sm" style={active ? { background: "var(--green-bg)", borderColor: "var(--green)", color: "var(--green-ink)" } : {}} onClick={() => setPapelFiltro(papel)}>
              {papel} <span className="mono" style={{ opacity: 0.7, marginLeft: 4 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <FilterBar value={query} onChange={setQuery} placeholder="Buscar nome ou empresa..." suggestions={[...new Set(pessoas.flatMap((p) => [p.nome, p.empresa].filter(Boolean)))]} />

      <DataTable
        columns={[
          { key: "nome", header: "Nome", render: (p) => <div style={{ fontWeight: 600 }}>{p.nome || "—"}</div> },
          {
            key: "papeis",
            header: "Papéis",
            render: (p) => (
              <div className="row gap-xs" style={{ flexWrap: "wrap" }}>
                {p.papeis.length === 0 ? <span className="text-soft">—</span> : p.papeis.map((pp) => <span key={pp} className="badge badge--neutro">{pp}</span>)}
              </div>
            ),
          },
          { key: "empresa", header: "Empresa", render: (p) => p.empresa || "—" },
          {
            key: "contato",
            header: "Contato",
            render: (p) => (
              <div>
                <div style={{ fontSize: 12.5 }}>{p.email || "—"}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{p.telefone}</div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Registro",
            render: (p) =>
              p.conselho || p.numeroRegistro ? (
                <span className={p.statusRegistro === "Ativo" ? "badge badge--simples" : "badge badge--bloqueado"}>{p.statusRegistro}</span>
              ) : (
                <span className="text-soft">—</span>
              ),
          },
        ]}
        rows={filtradas}
        rowKey={(p) => p.id}
        emptyMessage={pessoas.length === 0 ? "Nenhuma pessoa cadastrada ainda." : "Nenhum resultado pra esse filtro."}
        actions={(p) => (
          <>
            <button type="button" className="table-icon-btn" onClick={() => navigate(`/pessoas/${p.id}`)} aria-label={`Editar ${p.nome}`}>
              <Pencil size={14} />
            </button>
            <button type="button" className="table-icon-btn table-icon-btn--danger" onClick={() => setExcluindo(p)} aria-label={`Excluir ${p.nome}`}>
              <Trash2 size={14} />
            </button>
          </>
        )}
      />

      {excluindo && (
        <ConfirmDialog
          open
          onClose={() => setExcluindo(null)}
          onConfirm={confirmarExclusao}
          title="Excluir pessoa"
          description={`Excluir "${excluindo.nome}"? Essa ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
}
