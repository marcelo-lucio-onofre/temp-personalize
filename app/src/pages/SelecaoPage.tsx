import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { PrazoBadge } from "../components/Badge";
import { fmtBRL, fmtSigned, saldoAllowanceGroup } from "../domain/calculations";
import { useApp } from "../state/AppContext";

export function SelecaoPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { catalogo, activeVinculo, vinculoChoices: choices, chooseOption, customSubmissions, submitCustomMaterial } = useApp();
  const allowanceGroups = activeVinculo ? catalogo.getAllowanceGroups(activeVinculo.id) : [];
  const navigate = useNavigate();

  const found = useMemo(() => {
    if (!activeVinculo) return null;
    for (const amb of catalogo.getAmbientes(activeVinculo.id)) {
      const item = amb.itens.find((i) => i.id === itemId);
      if (item) return { ambiente: amb, item };
    }
    return null;
  }, [catalogo, activeVinculo, itemId]);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customNome, setCustomNome] = useState("");
  const [customRef, setCustomRef] = useState("");
  const [prop1Forn, setProp1Forn] = useState("");
  const [prop1Valor, setProp1Valor] = useState("");
  const [prop2Forn, setProp2Forn] = useState("");
  const [prop2Valor, setProp2Valor] = useState("");
  const [avisoAceito, setAvisoAceito] = useState(false);

  if (!found) return <Navigate to="/personalizacoes" replace />;
  const { ambiente, item } = found;
  const allowanceGroup = allowanceGroups.find((g) => g.id === item.allowanceGroupId);
  const itensDoGrupo = allowanceGroup ? ambiente.itens.filter((i) => allowanceGroup.itemIds.includes(i.id)) : [];

  const chosenId = choices[item.id] ?? item.opcoes.find((o) => o.padrao)?.id;
  const custoOpcao = item.opcoes.find((o) => o.id === chosenId)?.preco ?? 0;
  const saldo = item.valorPadrao - custoOpcao;
  const alreadySubmitted = Boolean(customSubmissions[item.id]);
  const canSubmitCustom = Boolean(
    customNome.trim() && customRef.trim() && prop1Forn.trim() && prop1Valor.trim() && prop2Forn.trim() && prop2Valor.trim() && avisoAceito,
  );

  function handleSubmitCustom() {
    if (!canSubmitCustom) return;
    submitCustomMaterial({
      itemId: item.id,
      materialNome: customNome,
      referencia: customRef,
      propostas: [
        { fornecedor: prop1Forn, valor: prop1Valor },
        { fornecedor: prop2Forn, valor: prop2Valor },
      ],
      status: "enviado_para_analise",
      avisoRiscoAceito: avisoAceito,
    });
  }

  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: "Minhas personalizações", to: "/personalizacoes" }, { label: ambiente.nome }, { label: item.nome }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          {item.nome} — {ambiente.nome}
        </h1>
        <span className="badge badge--simples">Simples</span>
      </div>
      <div className="row gap-sm" style={{ alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <PrazoBadge item={item} />
        {item.leadTimeDias != null && (
          <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Material leva {item.leadTimeDias} dias para chegar após aprovação.</span>
        )}
      </div>

      {(() => {
        const emUso = Boolean(choices[item.id]);
        const atualOpt = item.opcoes.find((o) => o.id === chosenId);
        const opcoesDeTroca = item.opcoes.filter((o) => o.id !== chosenId);
        return (
          <>
            {atualOpt && (
              <div className="card" style={{ background: "var(--paper)", marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 8 }}>
                  {emUso ? "Em uso atualmente" : "Padrão do empreendimento"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{emUso ? atualOpt.nome : item.padrao}</div>
                <div className="mono" style={{ fontSize: 14, color: "var(--green-ink)" }}>
                  Valor: {fmtBRL(atualOpt.remocao ? item.valorPadrao : atualOpt.preco)} {!emUso && "(incluído no preço da unidade)"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
                  Ao trocar ou remover este item, {fmtBRL(item.valorPadrao)} entram como crédito no seu ledger.
                </div>
              </div>
            )}

            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Opções de troca</div>
            <div className="stack gap-sm" style={{ marginBottom: 24 }}>
              {opcoesDeTroca.map((opt) => {
                const sel = chosenId === opt.id;
                const diff = opt.preco - item.valorPadrao;
                const diffLabel = opt.remocao ? "+" + fmtBRL(item.valorPadrao) : diff !== 0 ? fmtSigned(diff) : null;
                const diffColor = opt.remocao || diff < 0 ? "var(--green-ink)" : "var(--red-ink)";
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className="card row"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left",
                      border: sel ? "2px solid var(--brand)" : "2px solid var(--rule)",
                      background: sel ? "var(--green-bg)" : "#fff",
                    }}
                    onClick={() => chooseOption(item.id, opt.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{opt.nome}</div>
                      <div className="mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                        {opt.remocao ? "R$ 0 (remoção)" : fmtBRL(opt.preco)}
                      </div>
                    </div>
                    {diffLabel && (
                      <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: diffColor }}>
                        {diffLabel}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}

      <div className="card" style={{ borderStyle: "dashed", marginBottom: 24 }}>
        {!showCustomForm ? (
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Não encontrou o que procura?</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                Traga seu próprio material com referência e ao menos 2 propostas de fornecedor para análise.
              </div>
            </div>
            <button type="button" className="btn" onClick={() => setShowCustomForm(true)}>
              Enviar material próprio
            </button>
          </div>
        ) : (
          <div>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Material próprio — análise técnica e financeira</div>
              <span className="badge badge--tecnico">Requer análise</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">Material desejado</label>
              <input className="input" value={customNome} onChange={(e) => setCustomNome(e.target.value)} placeholder="Ex.: Porcelanato importado XY 90×90" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Referência (link, código do fabricante ou foto)</label>
              <input className="input" value={customRef} onChange={(e) => setCustomRef(e.target.value)} placeholder="Ex.: link do fabricante ou código do produto" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>
              Propostas de fornecedor (mín. 2)
            </div>
            <div className="grid grid-2" style={{ marginBottom: 10 }}>
              <div>
                <label className="label">Fornecedor — proposta 1</label>
                <input className="input" value={prop1Forn} onChange={(e) => setProp1Forn(e.target.value)} placeholder="Nome do fornecedor" />
              </div>
              <div>
                <label className="label">Valor — proposta 1</label>
                <input className="input" value={prop1Valor} onChange={(e) => setProp1Valor(e.target.value)} placeholder="R$" />
              </div>
              <div>
                <label className="label">Fornecedor — proposta 2</label>
                <input className="input" value={prop2Forn} onChange={(e) => setProp2Forn(e.target.value)} placeholder="Nome do fornecedor" />
              </div>
              <div>
                <label className="label">Valor — proposta 2</label>
                <input className="input" value={prop2Valor} onChange={(e) => setProp2Valor(e.target.value)} placeholder="R$" />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 16 }}>
              O crédito do item padrão ({fmtBRL(item.valorPadrao)}) permanece no seu ledger até a aprovação técnica e financeira do material proposto.
            </div>

            <div style={{ border: "1px solid var(--red-bg)", background: "var(--red-bg)", borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--red-ink)", marginBottom: 4 }}>Risco de atraso na obra</div>
              <div style={{ fontSize: 12.5, color: "var(--red-ink)", lineHeight: 1.5, marginBottom: 10 }}>
                Material fora do catálogo não tem prazo de entrega garantido e pode atrasar a entrega da sua unidade. Conforme cláusula
                contratual, um atraso causado por material fora do catálogo pode gerar multa ao comprador — sujeito a análise jurídica
                caso a caso.
              </div>
              <label className="row gap-xs" style={{ alignItems: "flex-start", fontSize: 12.5, color: "var(--red-ink)", cursor: "pointer" }}>
                <input type="checkbox" checked={avisoAceito} onChange={(e) => setAvisoAceito(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Estou ciente do risco de atraso na obra e de possível multa contratual, e desejo prosseguir mesmo assim.</span>
              </label>
            </div>

            <div className="row gap-sm">
              <button
                type="button"
                className="btn"
                style={alreadySubmitted ? { background: "var(--green-bg)", color: "var(--green-ink)", border: "none" } : canSubmitCustom ? { background: "var(--brand)", color: "#fff", border: "none" } : {}}
                disabled={alreadySubmitted || !canSubmitCustom}
                onClick={handleSubmitCustom}
              >
                {alreadySubmitted ? "Enviado para análise ✓" : "Enviar para análise"}
              </button>
              <button type="button" className="btn" onClick={() => setShowCustomForm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ border: "2px solid var(--brand)", marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "var(--green-ink)" }}>Impacto no ledger de crédito</div>
        <div className="grid grid-2" style={{ textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Crédito gerado</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--green-ink)" }}>+{fmtBRL(item.valorPadrao)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Custo da opção</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--red-ink)" }}>
              {custoOpcao > 0 ? "−" + fmtBRL(custoOpcao) : "R$ 0"}
            </div>
          </div>
        </div>
        <div className="text-center" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Saldo líquido</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: saldo >= 0 ? "var(--green-ink)" : "var(--red-ink)" }}>
            {fmtSigned(saldo)}
          </div>
        </div>
      </div>

      {allowanceGroup && (() => {
        const saldo = saldoAllowanceGroup(allowanceGroup, itensDoGrupo, choices);
        return (
          <div className="card" style={{ border: "2px solid var(--rule-strong)", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Saldo do grupo de verba — {allowanceGroup.nome}</div>
            <div className="text-soft" style={{ fontSize: 12.5, marginBottom: 12 }}>
              Compartilhada entre {itensDoGrupo.map((i) => i.nome).join(", ")}. Gastar mais aqui reduz o saldo dos outros itens do grupo.
            </div>
            <div className="grid grid-2" style={{ textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Verba total</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{fmtBRL(saldo.valorTotal)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Saldo restante</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: saldo.saldo >= 0 ? "var(--green-ink)" : "var(--red-ink)" }}>
                  {fmtBRL(saldo.saldo)}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="row" style={{ justifyContent: "space-between" }}>
        <Link to="/personalizacoes" className="btn">
          Voltar
        </Link>
        <button type="button" className="btn btn--primary" onClick={() => navigate("/personalizacoes")}>
          Confirmar seleção
        </button>
      </div>
    </div>
  );
}
