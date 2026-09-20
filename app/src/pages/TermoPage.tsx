import { Navigate, useParams } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { Breadcrumb } from "../components/Breadcrumb";
import { fmtBRL, formatTermoRef, isRemocao, resumirUnidade } from "../domain/calculations";
import { useApp } from "../state/AppContext";

/**
 * Termo de alteração / memorial personalizado — documento gerado a partir
 * de dados reais (não mais uma linha fixa hardcoded), agregando TODAS as
 * personalizações aprovadas da unidade. Reachable pelo cliente ("Minha
 * unidade" → "Gerar memorial personalizado") e pela construtora ("Ver
 * termo de alteração" em Aprovação) — por isso vive fora dos dois shells
 * de portal, com seu próprio guard de acesso.
 */
export function TermoPage() {
  const { vinculoId } = useParams<{ vinculoId: string }>();
  const { role, vinculos, solicitacoes, catalogo } = useApp();

  if (!role) return <Navigate to="/" replace />;

  const vinculo = vinculos.find((v) => v.id === vinculoId);
  if (!vinculo) return <Navigate to={role === "construtora" ? "/painel" : "/personalizacoes"} replace />;

  const empreendimento = catalogo.getEmpreendimento(vinculo.id);
  const ambientes = catalogo.getAmbientes(vinculo.id);
  const aprovadas = solicitacoes
    .filter((s) => s.vinculoId === vinculo.id && s.status === "aprovado")
    .sort((a, b) => new Date(a.encerradoEm ?? a.abertoEm).getTime() - new Date(b.encerradoEm ?? b.abertoEm).getTime());

  const resumo = resumirUnidade(solicitacoes, vinculo.id, empreendimento?.valorImovel ?? 0);
  const totalCredito = aprovadas.filter(isRemocao).reduce((n, s) => n + (s.diferenca ?? 0), 0);
  const totalCusto = aprovadas.filter((s) => !isRemocao(s)).reduce((n, s) => n + (s.diferenca ?? 0), 0);

  const ambienteDoItem = (itemId: string) => ambientes.find((a) => a.itens.some((i) => i.id === itemId))?.nome ?? "—";
  const pareceres = aprovadas
    .filter((s) => s.nivel >= 2)
    .map((s) => ({ item: s.item, evento: s.timeline.find((t) => t.tipo === "aprovacao" || t.tipo === "parecer") }))
    .filter((p): p is { item: string; evento: NonNullable<typeof p.evento> } => Boolean(p.evento));

  const backTo = role === "construtora" ? "/painel" : "/personalizacoes";
  const backLabel = role === "construtora" ? "Painel" : "Minhas personalizações";

  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: backLabel, to: backTo }, { label: "Termo de alteração" }]} />
      <div className="card" style={{ padding: "40px 32px", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <BrandMark light={false} color="var(--green)" />
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>Motor de personalização em obra</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>TERMO DE ALTERAÇÃO</div>
            <div className="mono text-soft" style={{ fontSize: 12 }}>{formatTermoRef(vinculo)}</div>
            <div className="text-soft" style={{ fontSize: 12 }}>Emitido em {new Date().toLocaleDateString("pt-BR")}</div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid var(--rule)" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 6 }}>Construtora</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{vinculo.construtoraNome}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 6 }}>Cliente</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{empreendimento?.comprador ?? "—"}</div>
            <div className="text-soft" style={{ fontSize: 13 }}>CPF: {empreendimento?.cpf ?? "—"} · {vinculo.unidadeLabel} · Torre {vinculo.torre}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Empreendimento</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>{vinculo.empreendimentoNome} — Torre {vinculo.torre}, Unidade {vinculo.unidadeLabel}</div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Alterações contratadas</div>
        {aprovadas.length === 0 ? (
          <div className="card text-soft" style={{ fontSize: 13, marginBottom: 24 }}>Nenhuma personalização aprovada ainda nesta unidade.</div>
        ) : (
          <div className="table-scroll" style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ minWidth: 620 }}>
              <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1fr 1fr 0.5fr 0.7fr", padding: "10px 14px", background: "var(--paper)", fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", gap: 6 }}>
                <div>Ambiente</div><div>De (padrão)</div><div>Para (novo)</div><div>Nível</div><div style={{ textAlign: "right" }}>Diferença</div>
              </div>
              {aprovadas.map((s) => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "0.7fr 1fr 1fr 0.5fr 0.7fr", padding: "10px 14px", borderTop: "1px solid var(--paper-2)", fontSize: 12, gap: 6 }}>
                  <div>{ambienteDoItem(s.itemId)}</div>
                  <div>{s.de}</div>
                  <div>{s.para}</div>
                  <div>{s.nivel === 1 ? "Simples" : s.nivel === 2 ? "Técnico" : "Proibido"}</div>
                  <div className="mono" style={{ textAlign: "right", color: isRemocao(s) ? "var(--green-ink)" : "var(--red-ink)" }}>
                    {isRemocao(s) ? "+" : "−"}{fmtBRL(s.diferenca ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-4" style={{ marginBottom: 28, padding: 16, background: "var(--paper)", borderRadius: 10 }}>
          <div className="text-center" style={{ gridColumn: "span 1" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>Total créditos</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--green-ink)" }}>+{fmtBRL(totalCredito)}</div>
          </div>
          <div className="text-center" style={{ gridColumn: "span 1" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>Total custos</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--red-ink)" }}>−{fmtBRL(totalCusto)}</div>
          </div>
          <div className="text-center" style={{ gridColumn: "span 2" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>{resumo.totalAprovado >= 0 ? "Saldo a pagar" : "Saldo a favor do cliente"}</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: resumo.totalAprovado >= 0 ? "var(--red-ink)" : "var(--green-ink)" }}>
              {fmtBRL(Math.abs(resumo.totalAprovado))}
            </div>
          </div>
        </div>

        {pareceres.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Aprovação técnica</div>
            <div className="stack gap-sm" style={{ marginBottom: 28 }}>
              {pareceres.map(({ item, evento }, i) => (
                <div key={i} style={{ padding: 14, border: "1px solid var(--rule)", borderRadius: 8, fontSize: 13 }}>
                  <div style={{ marginBottom: 4 }}>
                    Item técnico: <strong>{item}</strong> — aprovado por <strong>{evento.autor}</strong>
                  </div>
                  <div className="text-soft">Parecer: "{evento.texto}"</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="grid grid-2" style={{ gap: 40, marginBottom: 24, paddingTop: 20, borderTop: "2px solid var(--rule)" }}>
          <div className="text-center">
            <div style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 40, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>{empreendimento?.comprador ?? "—"}</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Cliente — CPF {empreendimento?.cpf ?? "—"}</div>
          </div>
          <div className="text-center">
            <div style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 40, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>{vinculo.construtoraNome}</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Representante legal</div>
          </div>
        </div>

        <div className="text-center text-soft" style={{ fontSize: 10, paddingTop: 16, borderTop: "1px solid var(--paper-2)" }}>
          Documento gerado automaticamente pela plataforma plantta · Assinatura digital conforme MP 2.200-2/2001
        </div>
      </div>
    </div>
  );
}
