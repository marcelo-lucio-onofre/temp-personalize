import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { NivelBadge, PrazoBadge } from "../components/Badge";
import { fmtBRL } from "../domain/calculations";
import type { Solicitacao, StatusSolicitacao } from "../domain/types";
import { useApp } from "../state/AppContext";

const FILTERS: { key: StatusSolicitacao | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendente" },
  { key: "em_analise", label: "Em análise" },
  { key: "aprovado", label: "Aprovado" },
  { key: "recusado", label: "Recusado" },
];

export function PainelPage() {
  const { solicitacoes, vinculos, catalogo, construtoraLogadaId, aprovarSolicitacao, recusarSolicitacao } = useApp();
  const [filter, setFilter] = useState<StatusSolicitacao | "todos">("todos");

  const construtoraNome = vinculos.find((v) => v.construtoraId === construtoraLogadaId)?.construtoraNome ?? "Construtora";
  const minhas = construtoraLogadaId ? solicitacoes.filter((s) => s.construtoraId === construtoraLogadaId) : solicitacoes;

  function itemDaSolicitacao(s: Solicitacao) {
    const vinculo = vinculos.find((v) => v.id === s.vinculoId);
    if (!vinculo) return undefined;
    for (const amb of catalogo.getAmbientes(vinculo.id)) {
      const item = amb.itens.find((i) => i.id === s.itemId);
      if (item) return item;
    }
    return undefined;
  }

  const counts: Record<StatusSolicitacao, number> = { pendente: 0, em_analise: 0, aprovado: 0, recusado: 0 };
  for (const s of minhas) counts[s.status]++;

  const filtered = filter === "todos" ? minhas : minhas.filter((s) => s.status === filter);

  return (
    <div className="container container--wide">
      <Breadcrumb items={[{ label: "Construtora" }, { label: "Painel" }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Fila de solicitações</h1>
          <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>{construtoraNome}</p>
        </div>
        <div className="row gap-sm">
          <Link to="/cadastro/novo" className="btn btn--sm">+ Cadastrar empreendimento</Link>
          <Link to="/marca" className="btn btn--sm">Marca do portal</Link>
        </div>
      </div>

      <div className="row gap-sm" style={{ marginBottom: 20 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = f.key === "todos" ? minhas.length : counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              className="btn btn--sm"
              style={active ? { background: "var(--green-bg)", borderColor: "var(--green)", color: "var(--green-ink)" } : {}}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="mono" style={{ opacity: 0.7, marginLeft: 4 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="card text-center" style={{ background: "var(--amber-bg)", border: "none" }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--amber-ink)" }}>{counts.pendente}</div>
          <div style={{ fontSize: 12, color: "var(--amber-ink)" }}>Pendentes</div>
        </div>
        <div className="card text-center" style={{ background: "var(--violet-bg)", border: "none" }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--violet-ink)" }}>{counts.em_analise}</div>
          <div style={{ fontSize: 12, color: "var(--violet-ink)" }}>Em análise</div>
        </div>
        <div className="card text-center" style={{ background: "var(--green-bg)", border: "none" }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--green-ink)" }}>{counts.aprovado}</div>
          <div style={{ fontSize: 12, color: "var(--green-ink)" }}>Aprovados</div>
        </div>
        <div className="card text-center" style={{ background: "var(--red-bg)", border: "none" }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--red-ink)" }}>{counts.recusado}</div>
          <div style={{ fontSize: 12, color: "var(--red-ink)" }}>Recusados</div>
        </div>
      </div>

      <div className="card table-scroll" style={{ padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1.2fr 100px 130px 100px 110px 150px", padding: "12px 18px", background: "var(--paper)", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", gap: 8, minWidth: 860 }}>
          <div>ID</div><div>Cliente</div><div>Item</div><div>Nível</div><div>Prazo</div><div>Diferença</div><div>Data</div><div>Ações</div>
        </div>
        {filtered.map((r) => (
          <div
            key={r.id}
            style={{ display: "grid", gridTemplateColumns: "90px 1fr 1.2fr 100px 130px 100px 110px 150px", padding: "12px 18px", borderTop: "1px solid var(--paper-2)", fontSize: 13, alignItems: "center", gap: 8, minWidth: 860 }}
          >
            <Link to={`/aprovacao/${r.id}`} className="mono" style={{ fontSize: 12, color: "var(--green-ink)", textDecoration: "none", fontWeight: 600 }}>{r.id}</Link>
            <div>
              <div style={{ fontWeight: 600 }}>{r.cliente}</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.unidade} · T{r.torre}</div>
            </div>
            <div>
              <div>{r.item}</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.de} → {r.para}</div>
            </div>
            <div><NivelBadge nivel={r.nivel} /></div>
            <div>{(() => { const item = itemDaSolicitacao(r); return item ? <PrazoBadge item={item} /> : <span className="text-soft" style={{ fontSize: 12 }}>—</span>; })()}</div>
            <div className="mono" style={{ fontWeight: 600 }}>{r.diferenca != null ? "+" + fmtBRL(r.diferenca) : "—"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{r.data}</div>
            <div className="row gap-xs">
              {(r.status === "pendente" || r.status === "em_analise") && (
                <>
                  <button type="button" className="btn btn--sm" style={{ background: "var(--green)", color: "#fff", border: "none" }} onClick={() => aprovarSolicitacao(r.id)}>
                    Aprovar
                  </button>
                  <button type="button" className="btn btn--sm" onClick={() => recusarSolicitacao(r.id)}>
                    Recusar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
