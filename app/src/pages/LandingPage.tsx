import { NavLink, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <header className="appbar" style={{ position: "static" }}>
        <div className="appbar-inner">
          <NavLink to="/" className="brandmark">
            <BrandMark />
          </NavLink>
          <div className="row gap-sm" style={{ marginLeft: "auto" }}>
            <NavLink to="/login/cliente" className="nav-btn">
              Entrar · Cliente
            </NavLink>
            <NavLink to="/login/construtora" className="nav-btn">
              Entrar · Construtora
            </NavLink>
            <NavLink to="/login/cliente/marca" className="nav-btn" style={{ border: "1px solid var(--navy-2)" }}>
              Portal com marca da construtora
            </NavLink>
          </div>
        </div>
      </header>

      <section style={{ background: "var(--navy)", color: "#fff", padding: "72px 16px 64px" }}>
        <div className="container text-center" style={{ maxWidth: 900 }}>
          <div className="mono" style={{ fontSize: 12, letterSpacing: ".08em", color: "var(--green)", textTransform: "uppercase", marginBottom: 20 }}>
            Motor de personalização em obra
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: 1.1, fontWeight: 800, marginBottom: 20 }}>
            Do pedido do cliente à ordem de execução — com crédito calculado e responsabilidade técnica.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "oklch(78% 0.005 90)", maxWidth: 620, margin: "0 auto 32px" }}>
            Ledger de crédito, custo paramétrico e governança técnica num único fluxo. Nada passa por planilha ou WhatsApp.
          </p>
          <div className="row gap-sm" style={{ justifyContent: "center" }}>
            <button type="button" className="btn btn--primary" onClick={() => navigate("/login/construtora")}>
              Agendar demonstração
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "transparent", borderColor: "oklch(40% 0.01 90)", color: "#fff" }}
              onClick={() => navigate("/login/cliente")}
            >
              Ver o fluxo completo
            </button>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: -32, maxWidth: 1100 }}>
        <div className="card" style={{ boxShadow: "0 24px 60px -35px rgba(0,0,0,.25)" }}>
          <div className="grid grid-4 text-center">
            {[
              { label: "Solicitação", sub: "cliente", on: true },
              { label: "Crédito calculado", sub: "ledger" },
              { label: "Aprovação técnica", sub: "governança" },
              { label: "Execução", sub: "obra" },
            ].map((step) => (
              <div key={step.label}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    margin: "0 auto 10px",
                    background: step.on ? "var(--green)" : "var(--rule-strong)",
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{step.label}</div>
                <div className="mono text-soft" style={{ fontSize: 11 }}>
                  {step.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)", padding: "56px 16px" }}>
        <div className="container" style={{ padding: 0 }}>
          <div className="mono" style={{ fontSize: 12, color: "var(--green-ink)", textTransform: "uppercase", marginBottom: 12 }}>
            Três peças, um motor
          </div>
          <h2 style={{ fontSize: 26, marginBottom: 28, fontWeight: 700 }}>O que nenhum concorrente brasileiro entrega junto.</h2>
          <div className="grid grid-auto">
            <div className="card" style={{ background: "var(--green-bg)", border: "none" }}>
              <div style={{ fontWeight: 700, color: "var(--green-ink)", marginBottom: 8 }}>Ledger de crédito</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                Cada item padrão removido gera saldo. Cada upgrade consome saldo. Extrato em tempo real — como conta corrente da personalização.
              </div>
            </div>
            <div className="card" style={{ background: "var(--violet-bg)", border: "none" }}>
              <div style={{ fontWeight: 700, color: "var(--violet-ink)", marginBottom: 8 }}>Motor paramétrico</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                Preço por fórmula: (material + mão de obra) × quantidade. Pontos elétricos, metros de tubulação — não só SKU de catálogo.
              </div>
            </div>
            <div className="card" style={{ background: "var(--amber-bg)", border: "none" }}>
              <div style={{ fontWeight: 700, color: "var(--amber-ink)", marginBottom: 8 }}>Governança técnica</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                3 níveis: Simples (automático), Técnico (responsável técnico obrigatório), Proibido (bloqueio imediato). Alinhado à NBR 16280.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="mono" style={{ fontSize: 12, color: "var(--green-ink)", textTransform: "uppercase", marginBottom: 12 }}>
          Planos
        </div>
        <h2 style={{ fontSize: 26, marginBottom: 28, fontWeight: 700 }}>Cobrança por unidade ativa em personalização.</h2>
        <div className="grid grid-auto">
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Starter</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              R$ 499<span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}>/mês</span>
            </div>
            <div className="text-soft" style={{ fontSize: 13 }}>1 empreendimento · até 50 unidades</div>
          </div>
          <div className="card" style={{ background: "var(--green)", color: "#fff", border: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Professional</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              R$ 999<span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>/mês</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>3 empreendimentos · 300 unidades</div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Enterprise</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              R$ 1.999+<span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}>/mês</span>
            </div>
            <div className="text-soft" style={{ fontSize: 13 }}>white label · API · % sobre upgrade</div>
          </div>
        </div>
      </section>

      <section className="container text-center">
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Coloque a personalização sob controle.</h2>
        <button type="button" className="btn btn--primary" onClick={() => navigate("/login/construtora")}>
          Agendar demonstração
        </button>
      </section>
    </div>
  );
}
