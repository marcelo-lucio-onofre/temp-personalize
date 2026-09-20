import { Navigate, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { NivelBadge } from "../components/Badge";
import { fmtBRL, fmtLedgerValor, fmtSigned, resumirAlteracoes } from "../domain/calculations";
import { ledgerInicial } from "../data/mockData";
import { useApp } from "../state/AppContext";

export function CarrinhoPage() {
  const { catalogo, activeVinculo, vinculoChoices: choices, vinculoParametrico: parametrico } = useApp();
  const navigate = useNavigate();
  if (!activeVinculo) return <Navigate to="/personalizacoes" replace />;

  const ambientes = catalogo.getAmbientes(activeVinculo.id);
  const { linhas, totalCredito, totalDebito, saldo } = resumirAlteracoes(ambientes, choices, parametrico);

  // The seeded ledger below represents transactions already posted before
  // this session started; live selections above extend it.
  const ledger = ledgerInicial;

  return (
    <div className="container container--wide">
      <Breadcrumb items={[{ label: "Minhas personalizações", to: "/personalizacoes" }, { label: "Carrinho" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Carrinho de personalização</h1>

      <div className="row gap-lg" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: "1.6 1 420px" }} className="stack gap-sm">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Alterações selecionadas</div>
          {linhas.length === 0 && (
            <div className="card text-soft" style={{ fontSize: 14 }}>
              Nenhuma alteração ainda. Vá ao portal e personalize um item.
            </div>
          )}
          {linhas.map((s) => {
            const liquido = s.credito - s.custo;
            return (
              <div key={s.itemId} className="card">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.item}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: 8 }}>{s.ambiente}</span>
                  </div>
                  <NivelBadge nivel={s.nivel} />
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 8 }}>
                  {s.de} → {s.para}
                </div>
                <div className="row gap" style={{ fontSize: 13 }}>
                  <span>
                    Crédito:{" "}
                    <span className="mono" style={{ color: "var(--green-ink)", fontWeight: 600 }}>
                      {s.credito > 0 ? "+" + fmtBRL(s.credito) : "—"}
                    </span>
                  </span>
                  <span>
                    Custo:{" "}
                    <span className="mono" style={{ color: "var(--red-ink)", fontWeight: 600 }}>
                      {s.custo > 0 ? "−" + fmtBRL(s.custo, 2) : "—"}
                    </span>
                  </span>
                  <span>
                    Líquido:{" "}
                    <span className="mono" style={{ fontWeight: 700, color: liquido >= 0 ? "var(--green-ink)" : "var(--red-ink)" }}>
                      {fmtSigned(liquido, 2)}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: "1 1 300px" }} className="sticky-side stack gap">
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Ledger de crédito</div>
            <div className="stack">
              {ledger.map((tx) => (
                <div key={tx.id} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--paper-2)", fontSize: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="mono text-soft" style={{ fontSize: 11, marginBottom: 2 }}>{tx.data}</div>
                    <div>{tx.descricao}</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 600, whiteSpace: "nowrap", color: tx.tipo === "credito" ? "var(--green-ink)" : "var(--red-ink)" }}>
                    {fmtLedgerValor(tx.valor)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: "var(--navy)", color: "#fff" }}>
            <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ opacity: 0.7 }}>Créditos gerados</span>
              <span className="mono" style={{ fontWeight: 600, color: "oklch(70% 0.12 155)" }}>+{fmtBRL(totalCredito)}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
              <span style={{ opacity: 0.7 }}>Custos adicionais</span>
              <span className="mono" style={{ fontWeight: 600, color: "oklch(75% 0.1 25)" }}>−{fmtBRL(totalDebito, 2)}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--navy-2)", paddingTop: 12, fontSize: 16, fontWeight: 700 }}>
              <span>Saldo líquido</span>
              <span className="mono">{fmtSigned(saldo, 2)}</span>
            </div>
            <button type="button" className="btn btn--primary btn--block" style={{ marginTop: 16 }} onClick={() => navigate("/aprovacao/SOL-003")}>
              Enviar para aprovação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
