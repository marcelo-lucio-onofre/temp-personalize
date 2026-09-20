import { Navigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { fmtBRL } from "../domain/calculations";
import { useApp } from "../state/AppContext";

export function CalculadoraPage() {
  const { catalogo, activeVinculo, vinculoParametrico: parametrico, setParametrico } = useApp();
  if (!activeVinculo) return <Navigate to="/personalizacoes" replace />;

  const ambientes = catalogo.getAmbientes(activeVinculo.id);
  const eletrica = ambientes.flatMap((a) => a.itens).find((i) => i.id === "eletrica_sala")!;
  const hidraulica = ambientes.flatMap((a) => a.itens).find((i) => i.id === "hidraulica")!;

  const qtd = parametrico.eletrica_sala ?? eletrica.qtdPadrao ?? 8;
  const qtdHid = parametrico.hidraulica ?? hidraulica.qtdPadrao ?? 3;
  const extra = Math.max(0, qtd - (eletrica.qtdPadrao ?? 0));
  const extraHid = Math.max(0, qtdHid - (hidraulica.qtdPadrao ?? 0));
  const custo = eletrica.custoPorUnidade!;
  const custoHid = hidraulica.custoPorUnidade!;

  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: "Minhas personalizações", to: "/personalizacoes" }, { label: "Calculadora" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Calculadora de custo técnico</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>
        Preço calculado por quantidade × (material + mão de obra), não por SKU fixo.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Pontos Elétricos — Sala</div>
            <div className="text-soft" style={{ fontSize: 13 }}>Padrão: 8 pontos incluídos · Prazo: {eletrica.prazo}</div>
          </div>
          <span className="badge badge--tecnico">Técnico — requer RT</span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span>Quantidade desejada</span>
            <span className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{qtd} pontos</span>
          </div>
          <input
            type="range"
            min={8}
            max={40}
            value={qtd}
            onChange={(e) => setParametrico("eletrica_sala", Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--brand)" }}
          />
          <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--ink-softer)" }}>
            <span>8 (padrão)</span>
            <span>40</span>
          </div>
        </div>

        {extra > 0 ? (
          <>
            <div className="card" style={{ background: "var(--paper)", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Decomposição de custo — {extra} pontos extras</div>
              <div className="table-scroll">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "8px 16px", fontSize: 13, minWidth: 380 }}>
                  <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>Material</div>
                  <div className="mono" style={{ textAlign: "right" }}>Unitário</div>
                  <div className="mono" style={{ textAlign: "right" }}>Qtd</div>
                  <div className="mono" style={{ textAlign: "right", fontWeight: 600 }}>Subtotal</div>
                  <div>Conduíte/mangueira</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(custo.conduiteM, 2)}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{extra}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(extra * custo.conduiteM, 2)}</div>
                  <div>Fio/cabo</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(custo.fioM, 2)}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{extra}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(extra * custo.fioM, 2)}</div>
                  <div>Disjuntor/circuito</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(custo.disjuntor, 2)}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{extra}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(extra * custo.disjuntor, 2)}</div>
                  <div>Mão de obra</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(custo.maoDeObra, 2)}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{extra}</div>
                  <div className="mono" style={{ textAlign: "right" }}>{fmtBRL(extra * custo.maoDeObra, 2)}</div>
                </div>
              </div>
            </div>
            <div className="row card" style={{ justifyContent: "space-between", alignItems: "center", background: "var(--amber-bg)", border: "none" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--amber-ink)" }}>Custo adicional total</div>
                <div style={{ fontSize: 12, color: "var(--amber-ink)" }}>Sujeito à aprovação de responsável técnico</div>
              </div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--amber-ink)" }}>{fmtBRL(extra * custo.total, 2)}</div>
            </div>
          </>
        ) : (
          <div className="text-center text-soft" style={{ padding: 20, fontSize: 14 }}>
            Nenhum ponto extra selecionado — quantidade dentro do padrão.
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Pontos Hidráulicos — Cozinha</div>
        <div className="text-soft" style={{ fontSize: 13, marginBottom: 12 }}>Padrão: 3 pontos · Prazo: {hidraulica.prazo}</div>
        <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span>Quantidade desejada</span>
          <span className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{qtdHid} pontos</span>
        </div>
        <input
          type="range"
          min={3}
          max={12}
          value={qtdHid}
          onChange={(e) => setParametrico("hidraulica", Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--brand)" }}
        />
        <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--ink-softer)", marginBottom: 12 }}>
          <span>3 (padrão)</span>
          <span>12</span>
        </div>
        {extraHid > 0 && (
          <div className="row card" style={{ justifyContent: "space-between", background: "var(--amber-bg)", border: "none" }}>
            <span style={{ fontWeight: 600, color: "var(--amber-ink)" }}>{extraHid} pontos extras × {fmtBRL(custoHid.total, 2)}</span>
            <span className="mono" style={{ fontWeight: 700, color: "var(--amber-ink)" }}>{fmtBRL(extraHid * custoHid.total, 2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
