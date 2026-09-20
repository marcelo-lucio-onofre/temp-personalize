import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { NivelBadge } from "../components/Badge";
import { Timeline } from "../components/Timeline";
import { fmtBRL } from "../domain/calculations";
import { useApp } from "../state/AppContext";

export function AprovacaoPage() {
  const { id } = useParams<{ id: string }>();
  const { solicitacoes, aprovarSolicitacao, recusarSolicitacao } = useApp();
  const [observacao, setObservacao] = useState("");

  const solicitacao = solicitacoes.find((s) => s.id === id);
  if (!solicitacao) return <Navigate to="/painel" replace />;

  const approved = solicitacao.status === "aprovado";
  const recusado = solicitacao.status === "recusado";
  const resolvido = approved || recusado;

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: solicitacao.id }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Aprovação técnica</h1>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>Solicitação de nível técnico — requer responsável técnico</div>
        </div>
        <NivelBadge nivel={solicitacao.nivel} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Dados do cliente</div>
          <div style={{ fontSize: 14, marginBottom: 4 }}><strong>{solicitacao.cliente}</strong></div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{solicitacao.unidade} · Torre {solicitacao.torre}</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Solicitado em {solicitacao.data}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Alteração solicitada</div>
          <div style={{ fontSize: 14, marginBottom: 4 }}><strong>{solicitacao.item}</strong></div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>De: {solicitacao.de} → Para: {solicitacao.para}</div>
        </div>
      </div>

      {solicitacao.id === "SOL-003" && (
        <div className="card table-scroll" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 12 }}>Cálculo paramétrico</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "6px 20px", fontSize: 13, paddingBottom: 12, borderBottom: "1px solid var(--paper-2)", minWidth: 380 }}>
            <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>Componente</div>
            <div className="mono" style={{ textAlign: "right", fontWeight: 600, color: "var(--ink-soft)" }}>Unit.</div>
            <div className="mono" style={{ textAlign: "right", fontWeight: 600, color: "var(--ink-soft)" }}>Qtd</div>
            <div className="mono" style={{ textAlign: "right", fontWeight: 600, color: "var(--ink-soft)" }}>Subtotal</div>
            <div>Conduíte/mangueira</div><div className="mono" style={{ textAlign: "right" }}>R$ 12,50</div><div className="mono" style={{ textAlign: "right" }}>12</div><div className="mono" style={{ textAlign: "right" }}>R$ 150,00</div>
            <div>Fio/cabo</div><div className="mono" style={{ textAlign: "right" }}>R$ 8,30</div><div className="mono" style={{ textAlign: "right" }}>12</div><div className="mono" style={{ textAlign: "right" }}>R$ 99,60</div>
            <div>Disjuntor/circuito</div><div className="mono" style={{ textAlign: "right" }}>R$ 45,00</div><div className="mono" style={{ textAlign: "right" }}>12</div><div className="mono" style={{ textAlign: "right" }}>R$ 540,00</div>
            <div>Mão de obra</div><div className="mono" style={{ textAlign: "right" }}>R$ 85,00</div><div className="mono" style={{ textAlign: "right" }}>12</div><div className="mono" style={{ textAlign: "right" }}>R$ 1.020,00</div>
          </div>
          <div className="row" style={{ justifyContent: "space-between", paddingTop: 12, fontWeight: 700, fontSize: 15 }}>
            <span>Custo adicional total</span>
            <span className="mono">{fmtBRL(1809.6, 2)}</span>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 14 }}>Linha do tempo</div>
        <Timeline events={solicitacao.timeline} />
        {solicitacao.status === "em_analise" && (
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--amber-ink)", marginTop: -4 }}>Aguardando parecer técnico</div>
        )}
      </div>

      <div className="card" style={{ border: "2px solid var(--green)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: "var(--green-ink)" }}>Parecer do responsável técnico</div>
        <div className="grid grid-2" style={{ marginBottom: 14 }}>
          <div>
            <label className="label">Responsável técnico</label>
            <input className="input" value={solicitacao.responsavel ?? "Eng. Carlos Medeiros — CREA 12345/SP"} readOnly />
          </div>
          <div>
            <label className="label">Registro profissional</label>
            <input className="input" value="CREA 12345/SP" readOnly />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Observações técnicas</label>
          <textarea
            className="input"
            style={{ minHeight: 80, resize: "vertical" }}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex.: Verificada capacidade do quadro elétrico — suporta 12 pontos adicionais sem troca de disjuntor geral."
          />
        </div>
        <div className="row gap-sm">
          <button
            type="button"
            className="btn"
            style={approved ? { background: "var(--green-bg)", color: "var(--green-ink)", border: "none" } : { background: "var(--green)", color: "#fff", border: "none" }}
            disabled={resolvido}
            onClick={() => aprovarSolicitacao(solicitacao.id)}
          >
            {approved ? "Aprovado ✓" : "Aprovar com assinatura digital"}
          </button>
          <button type="button" className="btn" disabled={resolvido}>Solicitar informação adicional</button>
          <button
            type="button"
            className="btn btn--danger-text"
            disabled={resolvido}
            onClick={() => recusarSolicitacao(solicitacao.id)}
          >
            {recusado ? "Recusado" : "Recusar com justificativa"}
          </button>
          {approved && (
            <Link to="/termo" className="btn" style={{ marginLeft: "auto" }}>
              Ver termo de alteração
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
