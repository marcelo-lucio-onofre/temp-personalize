import { Link } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { fmtBRL, resumirUnidade } from "../domain/calculations";
import { useApp } from "../state/AppContext";

/**
 * "Monte sua unidade" — o valor do imóvel somado a toda personalização já
 * aprovada (definitivo) e ainda pendente (estimado), num único total. É a
 * agregação que também alimenta o Termo de alteração (ver TermoPage).
 */
export function MinhaUnidadePage() {
  const { vinculos, activeVinculoId, selecionarVinculo, solicitacoes, catalogo, loginScopeConstrutoraId } = useApp();

  const meusVinculos = loginScopeConstrutoraId ? vinculos.filter((v) => v.construtoraId === loginScopeConstrutoraId) : vinculos;
  const vinculo = meusVinculos.find((v) => v.id === activeVinculoId) ?? meusVinculos[0];

  if (!vinculo) {
    return (
      <div className="container container--narrow">
        <Breadcrumb items={[{ label: "Minha unidade" }]} />
        <div className="card text-soft" style={{ fontSize: 14 }}>Nenhuma unidade vinculada.</div>
      </div>
    );
  }

  const empreendimento = catalogo.getEmpreendimento(vinculo.id);
  const resumo = resumirUnidade(solicitacoes, vinculo.id, empreendimento?.valorImovel ?? 0);

  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: "Minha unidade" }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Minha unidade</h1>
        {meusVinculos.length > 1 && (
          <select
            className="input"
            style={{ maxWidth: 320 }}
            value={vinculo.id}
            onChange={(e) => selecionarVinculo(e.target.value)}
          >
            {meusVinculos.map((v) => (
              <option key={v.id} value={v.id}>{v.construtoraNome} · {v.empreendimentoNome} · {v.unidadeLabel}</option>
            ))}
          </select>
        )}
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>
        {vinculo.empreendimentoNome} · {vinculo.unidadeLabel} · Torre {vinculo.torre}
      </p>

      <div className="card" style={{ border: "2px solid var(--brand)", marginBottom: 24 }}>
        <div className="stack gap-sm" style={{ marginBottom: 16 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>Valor do imóvel</span>
            <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{fmtBRL(resumo.valorImovel)}</span>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>Personalizações aprovadas</span>
            <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--green-ink)" }}>
              {resumo.totalAprovado >= 0 ? "+" : ""}{fmtBRL(resumo.totalAprovado)}
            </span>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>Personalizações pendentes (estimado)</span>
            <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--amber-ink)" }}>
              {resumo.totalPendente >= 0 ? "+" : ""}{fmtBRL(resumo.totalPendente)}
            </span>
          </div>
        </div>
        <div style={{ borderTop: "2px solid var(--rule)", paddingTop: 16 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{fmtBRL(resumo.totalGeral)}</span>
          </div>
          {resumo.totalPendente !== 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
              Inclui {fmtBRL(resumo.totalPendente)} em personalizações ainda não aprovadas pela construtora.
            </div>
          )}
        </div>
      </div>

      <div className="row gap-sm" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
        <Link to="/personalizacoes" className="btn">Revisar minhas personalizações</Link>
        <Link to={`/termo/${vinculo.id}`} className="btn btn--primary">Gerar memorial personalizado</Link>
      </div>
    </div>
  );
}
