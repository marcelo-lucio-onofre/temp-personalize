import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { JanelaBadge, NivelBadge } from "../components/Badge";
import { ConstrutoraGroupHeader } from "../components/ConstrutoraGroupHeader";
import { fmtDataHora, formatSolicitacaoRef, isEditavel, statusLabel, tempoDecorrido } from "../domain/calculations";
import type { Brand, Solicitacao, StatusSolicitacao, Vinculo } from "../domain/types";
import { useApp } from "../state/AppContext";

const statusBadgeClass = {
  pendente: "badge--tecnico",
  em_analise: "badge--tecnico",
  aprovado: "badge--simples",
  recusado: "badge--bloqueado",
} as const;

const FILTERS: { key: StatusSolicitacao | "todos"; label: string }[] = [
  { key: "todos", label: "Todas" },
  { key: "pendente", label: "Pendente" },
  { key: "em_analise", label: "Em análise" },
  { key: "aprovado", label: "Aprovado" },
  { key: "recusado", label: "Recusado" },
];

function SolicitacaoCard({ s, vinculo }: { s: Solicitacao; vinculo: Vinculo }) {
  const ref = formatSolicitacaoRef(vinculo, s.id);
  const editavel = isEditavel(s);
  const aberta = !s.encerradoEm;
  return (
    <Link to={`/personalizacoes/${s.id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div>
          <div className="mono text-soft" style={{ fontSize: 11, marginBottom: 2 }}>{ref}</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{s.item}</div>
          <div className="text-soft" style={{ fontSize: 12 }}>{vinculo.unidadeLabel}</div>
        </div>
        <div className="row gap-sm" style={{ flexShrink: 0 }}>
          <NivelBadge nivel={s.nivel} />
          <span className={`badge ${statusBadgeClass[s.status]}`}>{statusLabel(s.status)}</span>
        </div>
      </div>
      <div className="row gap" style={{ fontSize: 12, color: "var(--ink-soft)", flexWrap: "wrap" }}>
        <span>{s.de} → {s.para}</span>
        <span>·</span>
        <span>Aberta em {fmtDataHora(s.abertoEm)}</span>
        <span>·</span>
        <span>{aberta ? `${tempoDecorrido(s.abertoEm)} em aberto` : `resolvida em ${tempoDecorrido(s.abertoEm, s.encerradoEm)}`}</span>
        {s.responsavel && (
          <>
            <span>·</span>
            <span>Com {s.responsavel}</span>
          </>
        )}
        {editavel && (
          <>
            <span>·</span>
            <span style={{ color: "var(--green-ink)", fontWeight: 600 }}>Editável</span>
          </>
        )}
      </div>
    </Link>
  );
}

/**
 * The client's home screen after login — every personalization request
 * they've opened. Grouped by construtora → empreendimento so a client
 * with several units doesn't get one flat undifferentiated list.
 *
 * Scoping mirrors what a real auth token would carry: logging in through a
 * specific construtora's own (white-label) login locks this screen to that
 * construtora only — see AppContext.loginScopeConstrutoraId. Logging in
 * through the generic plantta screen sees every construtora the client
 * holds a unit with.
 */
export function PersonalizacoesPage() {
  const { solicitacoes, vinculos, catalogo, loginScopeConstrutoraId } = useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusSolicitacao | "todos">("todos");

  const meusVinculos = loginScopeConstrutoraId
    ? vinculos.filter((v) => v.construtoraId === loginScopeConstrutoraId)
    : vinculos;
  const meusVinculoIds = new Set(meusVinculos.map((v) => v.id));
  const minhas = solicitacoes
    .filter((s) => meusVinculoIds.has(s.vinculoId))
    .sort((a, b) => new Date(b.abertoEm).getTime() - new Date(a.abertoEm).getTime());

  const q = query.trim().toLowerCase();
  const filtradas = minhas.filter((s) => {
    if (status !== "todos" && s.status !== status) return false;
    if (!q) return true;
    const vinculo = vinculos.find((v) => v.id === s.vinculoId);
    const haystack = [s.item, s.id, vinculo?.empreendimentoNome, vinculo?.unidadeLabel, vinculo?.construtoraNome]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const counts: Record<StatusSolicitacao, number> = { pendente: 0, em_analise: 0, aprovado: 0, recusado: 0 };
  for (const s of minhas) counts[s.status]++;

  // Group filtered results: construtora → empreendimento → solicitações.
  const grupos = new Map<string, { nome: string; brand: Brand | null; empreendimentos: Map<string, { nome: string; itens: Solicitacao[] }> }>();
  for (const s of filtradas) {
    const vinculo = vinculos.find((v) => v.id === s.vinculoId);
    if (!vinculo) continue;
    if (!grupos.has(vinculo.construtoraId)) {
      grupos.set(vinculo.construtoraId, { nome: vinculo.construtoraNome, brand: vinculo.brand, empreendimentos: new Map() });
    }
    const grupo = grupos.get(vinculo.construtoraId)!;
    if (!grupo.empreendimentos.has(vinculo.empreendimentoId)) {
      grupo.empreendimentos.set(vinculo.empreendimentoId, { nome: vinculo.empreendimentoNome, itens: [] });
    }
    grupo.empreendimentos.get(vinculo.empreendimentoId)!.itens.push(s);
  }

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Minhas personalizações" }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Minhas personalizações</h1>
        <Link to="/personalizacoes/nova" className="btn btn--primary">
          <Plus className="sidebar-nav-icon" /> Nova personalização
        </Link>
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20 }}>
        {loginScopeConstrutoraId
          ? `Pedidos de personalização com ${meusVinculos[0]?.construtoraNome}, com status e quem está analisando.`
          : "Todo pedido de personalização que você abriu, em qualquer construtora, com status e quem está analisando."}
      </p>

      <div className="row gap-sm" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <Search className="sidebar-nav-icon" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por item, empreendimento, unidade..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="row gap-sm" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = status === f.key;
          const count = f.key === "todos" ? minhas.length : counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              className="btn btn--sm"
              style={active ? { background: "var(--green-bg)", borderColor: "var(--green)", color: "var(--green-ink)" } : {}}
              onClick={() => setStatus(f.key)}
            >
              {f.label} <span className="mono" style={{ opacity: 0.7, marginLeft: 4 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtradas.length === 0 && (
        <div className="card text-soft" style={{ fontSize: 14 }}>
          {minhas.length === 0 ? "Nenhuma personalização ainda. Clique em “Nova personalização” pra começar." : "Nada encontrado com esse filtro."}
        </div>
      )}

      <div className="stack gap-lg">
        {[...grupos.entries()].map(([construtoraId, grupo]) => (
          <div key={construtoraId}>
            {!loginScopeConstrutoraId && <ConstrutoraGroupHeader nome={grupo.nome} brand={grupo.brand} />}
            <div className="stack gap-lg" style={{ paddingLeft: loginScopeConstrutoraId ? 0 : 40 }}>
              {[...grupo.empreendimentos.entries()].map(([empId, emp]) => (
                <div key={empId}>
                  <div className="row gap-sm" style={{ alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-soft)" }}>{emp.nome}</span>
                    <JanelaBadge itens={catalogo.listTodosItensDoEmpreendimento(empId)} />
                  </div>
                  <div className="stack gap-sm">
                    {emp.itens.map((s) => (
                      <SolicitacaoCard key={s.id} s={s} vinculo={vinculos.find((v) => v.id === s.vinculoId)!} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
