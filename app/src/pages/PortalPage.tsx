import { Link, Navigate } from "react-router-dom";
import { ClipboardList, ShoppingCart, Calculator } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { JanelaBadge, NivelBadge } from "../components/Badge";
import { fmtBRL, fmtSigned, qtdExtra, resumirAlteracoes } from "../domain/calculations";
import { useApp } from "../state/AppContext";

export function PortalPage() {
  const { catalogo, activeVinculo, effectiveBrand: brand, vinculoChoices: choices, vinculoParametrico: parametrico } = useApp();
  if (!activeVinculo) return <Navigate to="/personalizacoes" replace />;

  const empreendimento = catalogo.getEmpreendimento(activeVinculo.id)!;
  const ambientes = catalogo.getAmbientes(activeVinculo.id);
  const { totalCredito, totalDebito, saldo } = resumirAlteracoes(ambientes, choices, parametrico);

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Minhas personalizações", to: "/personalizacoes" }, { label: "Portal" }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Meu apartamento</h1>
        <JanelaBadge itens={catalogo.listTodosItensDoEmpreendimento(activeVinculo.empreendimentoId)} />
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20 }}>
        {empreendimento.nome}, {empreendimento.unidade}, {empreendimento.torre}
      </p>

      <div className="row gap-sm" style={{ marginBottom: 24 }}>
        <Link to="/carrinho" className="btn btn--sm">
          <ShoppingCart className="sidebar-nav-icon" style={{ color: "inherit" }} /> Carrinho
        </Link>
        <Link to="/calculadora" className="btn btn--sm">
          <Calculator className="sidebar-nav-icon" style={{ color: "inherit" }} /> Calculadora
        </Link>
        <Link to="/personalizacoes" className="btn btn--sm">
          <ClipboardList className="sidebar-nav-icon" style={{ color: "inherit" }} /> Minhas personalizações
        </Link>
      </div>

      <div className="row gap" style={{ marginBottom: 28 }}>
        <div className="card" style={{ flex: "1 1 180px", background: "var(--green-bg)", border: "none" }}>
          <div style={{ fontSize: 12, color: "var(--green-ink)", marginBottom: 4 }}>Créditos gerados</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--green-ink)" }}>{fmtBRL(totalCredito)}</div>
        </div>
        <div className="card" style={{ flex: "1 1 180px", background: "var(--red-bg)", border: "none" }}>
          <div style={{ fontSize: 12, color: "var(--red-ink)", marginBottom: 4 }}>Custos adicionais</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--red-ink)" }}>{fmtBRL(totalDebito, 2)}</div>
        </div>
        <div className="card" style={{ flex: "1 1 180px", border: `2px solid ${brand.color}` }}>
          <div style={{ fontSize: 12, color: "var(--green-ink)", marginBottom: 4 }}>Saldo líquido</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: saldo >= 0 ? brand.color : "var(--red-ink)" }}>
            {fmtSigned(saldo, 2)}
          </div>
        </div>
      </div>

      <div className="stack gap-lg">
        {ambientes.map((amb) => (
          <div key={amb.id}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{amb.nome}</h2>
              <span className="mono text-soft" style={{ fontSize: 11 }}>{amb.itens.length} itens</span>
            </div>
            <div className="stack gap-sm">
              {amb.itens.map((item) => {
                const chosenId = choices[item.id];
                const chosenOpt = chosenId ? item.opcoes.find((o) => o.id === chosenId) : undefined;

                let statusLine = `Padrão: ${item.padrao}`;
                let diffLabel: string | null = null;
                let diffColor = "var(--ink-soft)";

                if (item.nivel === 3) {
                  statusLine = item.motivoBloqueio ?? "Alteração proibida";
                } else if (item.parametrico) {
                  const qtd = parametrico[item.id] ?? item.qtdPadrao ?? 0;
                  const extra = qtdExtra(item, qtd);
                  if (extra > 0) {
                    const cost = extra * (item.custoPorUnidade?.total ?? 0);
                    diffLabel = fmtBRL(cost, 2);
                    diffColor = "var(--red-ink)";
                    statusLine = `${item.qtdPadrao} padrão → ${qtd} solicitados (+${extra})`;
                  } else {
                    statusLine = `${item.padrao} · prazo: ${item.prazoFim}`;
                  }
                } else if (chosenOpt && !chosenOpt.padrao) {
                  if (chosenOpt.remocao) {
                    diffLabel = "+" + fmtBRL(item.valorPadrao);
                    diffColor = "var(--green-ink)";
                    statusLine = "Removido (crédito gerado)";
                  } else {
                    const diff = chosenOpt.preco - item.valorPadrao;
                    diffLabel = fmtSigned(diff);
                    diffColor = diff > 0 ? "var(--red-ink)" : "var(--green-ink)";
                    statusLine = `${item.padrao} → ${chosenOpt.nome}`;
                  }
                } else {
                  statusLine = `Padrão: ${item.padrao}` + (item.prazoFim ? ` · prazo: ${item.prazoFim}` : "");
                }

                const hasAction = item.nivel < 3;
                const actionLabel = chosenOpt && !chosenOpt.padrao ? "Alterar" : "Personalizar";
                const target = item.parametrico ? "/calculadora" : `/selecao/${item.id}`;

                return (
                  <div
                    key={item.id}
                    className="card row gap-sm"
                    style={{ justifyContent: "space-between", alignItems: "center", padding: "16px 18px" }}
                  >
                    <div style={{ flex: "1 1 200px" }}>
                      <div className="row gap-xs" style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{item.nome}</span>
                        <NivelBadge nivel={item.nivel} />
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{statusLine}</div>
                    </div>
                    <div className="row gap-sm">
                      {diffLabel && (
                        <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: diffColor }}>
                          {diffLabel}
                        </span>
                      )}
                      {hasAction && (
                        <Link to={target} className="btn btn--sm">
                          {actionLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
