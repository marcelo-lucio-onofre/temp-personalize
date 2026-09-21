import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LayoutGrid, Package, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { NivelBadge, PrazoBadge } from "../components/Badge";
import { ConstrutoraGroupHeader } from "../components/ConstrutoraGroupHeader";
import { avaliarOpcao, avaliarParametrico, fmtBRL, fmtSigned, saldoAllowanceGroup } from "../domain/calculations";
import { useApp } from "../state/AppContext";
import type { Brand, Vinculo } from "../domain/types";

const STEPS = [
  { label: "Empreendimento", icon: Building2 },
  { label: "Ambiente", icon: LayoutGrid },
  { label: "Item", icon: Package },
  { label: "Opção", icon: SlidersHorizontal },
  { label: "Revisão", icon: CheckCircle2 },
];

function agrupar(vinculos: Vinculo[]) {
  const porConstrutora = new Map<string, { nome: string; brand: Brand | null; empreendimentos: Map<string, { nome: string; unidades: Vinculo[] }> }>();
  for (const v of vinculos) {
    if (!porConstrutora.has(v.construtoraId)) porConstrutora.set(v.construtoraId, { nome: v.construtoraNome, brand: v.brand, empreendimentos: new Map() });
    const c = porConstrutora.get(v.construtoraId)!;
    if (!c.empreendimentos.has(v.empreendimentoId)) c.empreendimentos.set(v.empreendimentoId, { nome: v.empreendimentoNome, unidades: [] });
    c.empreendimentos.get(v.empreendimentoId)!.unidades.push(v);
  }
  return porConstrutora;
}

/**
 * "Nova personalização" — guided flow that replaces the old free-roam
 * Portal as the primary way a client requests a change: pick the unit,
 * then área, then item, then option, then confirm. Ends by creating a
 * real Solicitacao (see AppContext.criarSolicitacao) and taking the client
 * straight to its detail/timeline.
 */
export function NovaPersonalizacaoPage() {
  const { vinculos, catalogo, chooseOption, setParametrico, criarSolicitacao, selecionarVinculo, loginScopeConstrutoraId, vinculoChoices, customSubmissions, submitCustomMaterial } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [vinculoId, setVinculoId] = useState<string | null>(null);
  const [ambienteId, setAmbienteId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [opcaoId, setOpcaoId] = useState<string | null>(null);
  const [qtd, setQtd] = useState<number | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customNome, setCustomNome] = useState("");
  const [customRef, setCustomRef] = useState("");
  const [prop1Forn, setProp1Forn] = useState("");
  const [prop1Valor, setProp1Valor] = useState("");
  const [prop2Forn, setProp2Forn] = useState("");
  const [prop2Valor, setProp2Valor] = useState("");
  const [avisoAceito, setAvisoAceito] = useState(false);

  const vinculo = vinculos.find((v) => v.id === vinculoId);
  const ambientes = vinculoId ? catalogo.getAmbientes(vinculoId) : [];
  const ambiente = ambientes.find((a) => a.id === ambienteId);
  const item = ambiente?.itens.find((i) => i.id === itemId);
  const isParametrico = Boolean(item?.parametrico);
  const allowanceGroups = vinculoId ? catalogo.getAllowanceGroups(vinculoId) : [];
  const allowanceGroup = allowanceGroups.find((g) => g.id === item?.allowanceGroupId);
  const itensDoGrupo = allowanceGroup && ambiente ? ambiente.itens.filter((i) => allowanceGroup.itemIds.includes(i.id)) : [];

  function irPara(i: number) {
    if (i < step) setStep(i);
  }

  function escolherVinculo(v: Vinculo) {
    setVinculoId(v.id);
    selecionarVinculo(v.id);
    setAmbienteId(null);
    setItemId(null);
    setOpcaoId(null);
    setQtd(null);
    setStep(1);
  }

  function escolherAmbiente(id: string) {
    setAmbienteId(id);
    setItemId(null);
    setOpcaoId(null);
    setQtd(null);
    setStep(2);
  }

  function escolherItem(id: string, parametrico: boolean, qtdPadrao?: number) {
    setItemId(id);
    setOpcaoId(null);
    setQtd(parametrico ? (qtdPadrao ?? 0) + 1 : null);
    setShowCustomForm(false);
    setCustomNome("");
    setCustomRef("");
    setProp1Forn("");
    setProp1Valor("");
    setProp2Forn("");
    setProp2Valor("");
    setAvisoAceito(false);
    setStep(3);
  }

  function handleSubmit() {
    if (!vinculo || !item) return;
    const emp = catalogo.getEmpreendimento(vinculo.id);
    if (!emp) return;
    const avaliacao = item.parametrico
      ? avaliarParametrico(item, qtd ?? item.qtdPadrao ?? 0)
      : avaliarOpcao(item, item.opcoes.find((o) => o.id === opcaoId)!);

    if (item.parametrico) setParametrico(item.id, qtd ?? item.qtdPadrao ?? 0);
    else if (opcaoId) chooseOption(item.id, opcaoId);

    const created = criarSolicitacao({
      vinculoId: vinculo.id,
      construtoraId: vinculo.construtoraId,
      itemId: item.id,
      item: item.nome,
      unidade: vinculo.unidadeLabel,
      torre: vinculo.torre,
      cliente: emp.comprador,
      de: avaliacao.de,
      para: avaliacao.para,
      diferenca: avaliacao.diferenca,
      nivel: item.nivel,
    });
    navigate(`/personalizacoes/${created.id}`);
  }

  const meusVinculos = loginScopeConstrutoraId ? vinculos.filter((v) => v.construtoraId === loginScopeConstrutoraId) : vinculos;
  const grupos = agrupar(meusVinculos);
  const podeContinuarOpcao = isParametrico ? (qtd ?? 0) > (item?.qtdPadrao ?? 0) : Boolean(opcaoId);

  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: "Personalizações", to: "/personalizacoes" }, { label: "Nova" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Nova personalização</h1>

      <div className="row gap-sm" style={{ marginBottom: 28, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => irPara(i)}
              disabled={i > step}
              className="row gap-xs"
              style={{
                border: "none",
                background: "none",
                cursor: i < step ? "pointer" : "default",
                padding: "4px 8px 4px 0",
                opacity: i > step ? 0.4 : 1,
                fontSize: 12.5,
                fontWeight: current ? 700 : 600,
                color: current ? "var(--brand)" : done ? "var(--ink)" : "var(--ink-soft)",
              }}
            >
              <s.icon className="sidebar-nav-icon" />
              {i + 1}. {s.label}
              {i < STEPS.length - 1 && <span style={{ color: "var(--rule-strong)", marginLeft: 6 }}>›</span>}
            </button>
          );
        })}
      </div>

      {step === 0 && (
        <div className="stack gap-lg">
          {[...grupos.entries()].map(([construtoraId, c]) => (
            <div key={construtoraId}>
              {!loginScopeConstrutoraId && <ConstrutoraGroupHeader nome={c.nome} brand={c.brand} />}
              <div className="stack gap-lg" style={{ paddingLeft: loginScopeConstrutoraId ? 0 : 40 }}>
                {[...c.empreendimentos.entries()].map(([empId, emp]) => (
                  <div key={empId}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 8 }}>{emp.nome}</div>
                    <div className="stack gap-sm">
                      {emp.unidades.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className="card row"
                          style={{ justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left", width: "100%" }}
                          onClick={() => escolherVinculo(v)}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{v.unidadeLabel}</div>
                            <div className="text-soft" style={{ fontSize: 12 }}>Torre {v.torre}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 1 && vinculoId && (
        <div className="grid grid-2">
          {ambientes.map((a) => (
            <button
              key={a.id}
              type="button"
              className="card"
              style={{ cursor: "pointer", textAlign: "left" }}
              onClick={() => escolherAmbiente(a.id)}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{a.nome}</div>
              <div className="text-soft" style={{ fontSize: 12 }}>{a.itens.length} itens personalizáveis</div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && ambiente && (
        <div className="stack gap-sm">
          {ambiente.itens.map((i) => {
            const bloqueado = i.nivel === 3;
            return (
              <button
                key={i.id}
                type="button"
                className="card row"
                disabled={bloqueado}
                style={{ justifyContent: "space-between", alignItems: "center", cursor: bloqueado ? "not-allowed" : "pointer", textAlign: "left", width: "100%", opacity: bloqueado ? 0.5 : 1 }}
                onClick={() => !bloqueado && escolherItem(i.id, Boolean(i.parametrico), i.qtdPadrao)}
              >
                <div>
                  <div className="row gap-xs" style={{ marginBottom: 2, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{i.nome}</span>
                    <NivelBadge nivel={i.nivel} />
                    {!bloqueado && <PrazoBadge item={i} />}
                  </div>
                  <div className="text-soft" style={{ fontSize: 12 }}>{bloqueado ? i.motivoBloqueio : `Padrão: ${i.padrao}`}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 3 && item && (
        <div className="stack gap-lg">
          {isParametrico ? (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.nome}</div>
              <div className="text-soft" style={{ fontSize: 13, marginBottom: 16 }}>Padrão incluído: {item.qtdPadrao} pontos</div>
              <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span>Quantidade desejada</span>
                <span className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{qtd} pontos</span>
              </div>
              <input
                type="range"
                min={item.qtdPadrao}
                max={(item.qtdPadrao ?? 0) * 5}
                value={qtd ?? item.qtdPadrao ?? 0}
                onChange={(e) => setQtd(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--brand)" }}
              />
              {(qtd ?? 0) > (item.qtdPadrao ?? 0) && (
                <div className="row card" style={{ justifyContent: "space-between", marginTop: 14, background: "var(--amber-bg)", border: "none" }}>
                  <span style={{ fontWeight: 600, color: "var(--amber-ink)" }}>Custo estimado</span>
                  <span className="mono" style={{ fontWeight: 700, color: "var(--amber-ink)" }}>{fmtBRL(avaliarParametrico(item, qtd ?? 0).diferenca, 2)}</span>
                </div>
              )}
            </div>
          ) : (() => {
            const chosenPreviamente = vinculoChoices[item.id];
            const atualOpt = item.opcoes.find((o) => o.id === chosenPreviamente) ?? item.opcoes.find((o) => o.padrao);
            const opcoesDeTroca = item.opcoes.filter((o) => o.id !== atualOpt?.id);
            return (
              <div className="stack gap-sm">
                {atualOpt && (
                  <button
                    type="button"
                    className="card"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: opcaoId === atualOpt.id ? "2px solid var(--brand)" : "2px solid var(--rule-strong)",
                      background: "var(--paper)",
                    }}
                    onClick={() => setOpcaoId(atualOpt.id)}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 6 }}>
                      {chosenPreviamente ? "Em uso atualmente" : "Padrão do empreendimento"}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{atualOpt.nome}</div>
                    <div className="mono text-soft" style={{ fontSize: 12 }}>
                      {fmtBRL(atualOpt.preco)} {!chosenPreviamente && "(incluído no preço da unidade)"}
                    </div>
                  </button>
                )}
                {opcoesDeTroca.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginTop: 6 }}>Opções de troca</div>
                    {opcoesDeTroca.map((opt) => {
                      const sel = opcaoId === opt.id;
                      const av = avaliarOpcao(item, opt);
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
                          onClick={() => setOpcaoId(opt.id)}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.nome}</div>
                            <div className="mono text-soft" style={{ fontSize: 12 }}>{opt.remocao ? "R$ 0 (remoção)" : fmtBRL(opt.preco)}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div
                              className="mono"
                              style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: opt.remocao ? "var(--green-ink)" : "var(--red-ink)", marginBottom: 2 }}
                            >
                              {opt.remocao ? "Gera crédito" : "Custo adicional"}
                            </div>
                            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: opt.remocao ? "var(--green-ink)" : "var(--red-ink)" }}>
                              {opt.remocao ? "+" + fmtBRL(av.diferenca) : fmtSigned(opt.preco - item.valorPadrao)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })()}
          {!isParametrico && (() => {
            const alreadySubmitted = Boolean(customSubmissions[item.id]);
            const canSubmitCustom = Boolean(
              customNome.trim() && customRef.trim() && prop1Forn.trim() && prop1Valor.trim() && prop2Forn.trim() && prop2Valor.trim() && avisoAceito,
            );
            const handleSubmitCustom = () => {
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
            };
            return (
              <div className="card" style={{ borderStyle: "dashed" }}>
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
                        Material fora do catálogo não tem prazo de entrega garantido e pode atrasar a entrega da sua unidade. Conforme
                        cláusula contratual, um atraso causado por material fora do catálogo pode gerar multa ao comprador — sujeito a
                        análise jurídica caso a caso.
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
            );
          })()}
          {!isParametrico && opcaoId && (() => {
            const custoOpcao = item.opcoes.find((o) => o.id === opcaoId)?.preco ?? 0;
            const saldo = item.valorPadrao - custoOpcao;
            return (
              <div className="card" style={{ border: "2px solid var(--brand)" }}>
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
            );
          })()}
          {!isParametrico && allowanceGroup && item && (() => {
            const saldo = saldoAllowanceGroup(allowanceGroup, itensDoGrupo, vinculoChoices, { itemId: item.id, opcaoId });
            return (
              <div className="card" style={{ border: "2px solid var(--rule-strong)" }}>
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
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn--primary" disabled={!podeContinuarOpcao} onClick={() => setStep(4)}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 4 && vinculo && item && (
        <div className="stack gap-lg">
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Resumo</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{vinculo.empreendimentoNome} · {vinculo.unidadeLabel} · Torre {vinculo.torre}</div>
            <div className="row gap-sm" style={{ alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14 }}>{ambiente?.nome} — <strong>{item.nome}</strong></span>
              <PrazoBadge item={item} />
            </div>
            {(() => {
              const opcaoSelecionada = item.opcoes.find((o) => o.id === opcaoId);
              const av = isParametrico ? avaliarParametrico(item, qtd ?? 0) : avaliarOpcao(item, opcaoSelecionada!);
              const isCredito = !isParametrico && Boolean(opcaoSelecionada?.remocao);
              return (
                <>
                  <div className="text-soft" style={{ fontSize: 13, marginBottom: 8 }}>{av.de} → {av.para}</div>
                  {av.diferenca > 0 && (
                    <div className="row gap-xs" style={{ alignItems: "baseline" }}>
                      <span
                        className="mono"
                        style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: isCredito ? "var(--green-ink)" : "var(--ink-soft)" }}
                      >
                        {isCredito ? "Gera crédito" : "Custo adicional"}
                      </span>
                      <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: isCredito ? "var(--green-ink)" : "var(--ink)" }}>
                        {fmtBRL(av.diferenca, 2)}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn" onClick={() => setStep(3)}>Voltar</button>
            <button type="button" className="btn btn--primary" onClick={handleSubmit}>Enviar solicitação</button>
          </div>
        </div>
      )}
    </div>
  );
}
