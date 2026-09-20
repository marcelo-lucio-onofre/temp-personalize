import { BrandMark } from "../components/BrandMark";
import { Breadcrumb } from "../components/Breadcrumb";

const linhas = [
  { ambiente: "Sala", de: "Standard 60×60", para: "Portobello Premium", nivel: "Simples", credito: "+6.000", custo: "−8.500" },
  { ambiente: "Cozinha", de: "Granito Cinza Corumbá", para: "Quartzo Branco Ibiza", nivel: "Simples", credito: "+3.200", custo: "−4.900" },
  { ambiente: "Banheiro", de: "Deca Aspen + Link", para: "Docol Benefit Black", nivel: "Simples", credito: "+2.100", custo: "−3.400" },
  { ambiente: "Varanda", de: "Externo Cinza", para: "Removido", nivel: "Simples", credito: "+3.800", custo: "—" },
  { ambiente: "Sala", de: "8 pontos elétricos", para: "14 pontos (+6)", nivel: "Técnico", credito: "—", custo: "−904,80" },
];

export function TermoPage() {
  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Termo de alteração" }]} />
      <div className="card" style={{ padding: "40px 32px", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <BrandMark light={false} color="var(--green)" />
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>Motor de personalização em obra</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>TERMO DE ALTERAÇÃO</div>
            <div className="mono text-soft" style={{ fontSize: 12 }}>Nº ALT-2026-00147</div>
            <div className="text-soft" style={{ fontSize: 12 }}>Emitido em 15/09/2026</div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid var(--rule)" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 6 }}>Construtora</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Prado Engenharia Ltda.</div>
            <div className="text-soft" style={{ fontSize: 13 }}>CNPJ: 12.345.678/0001-90</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 6 }}>Cliente</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Marina Alves</div>
            <div className="text-soft" style={{ fontSize: 13 }}>CPF: •••.•••.•••-89 · Apto 1204 · Torre B</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Empreendimento</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>Residencial Aurora — Torre B, Unidade 1204</div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Alterações contratadas</div>
        <div className="table-scroll" style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ minWidth: 620 }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1fr 1fr 0.5fr 0.6fr 0.6fr", padding: "10px 14px", background: "var(--paper)", fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", gap: 6 }}>
              <div>Ambiente</div><div>De (padrão)</div><div>Para (novo)</div><div>Nível</div><div style={{ textAlign: "right" }}>Crédito</div><div style={{ textAlign: "right" }}>Custo</div>
            </div>
            {linhas.map((l, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "0.7fr 1fr 1fr 0.5fr 0.6fr 0.6fr", padding: "10px 14px", borderTop: "1px solid var(--paper-2)", fontSize: 12, gap: 6 }}>
                <div>{l.ambiente}</div>
                <div>{l.de}</div>
                <div>{l.para}</div>
                <div><span style={{ color: l.nivel === "Simples" ? "var(--green-ink)" : "var(--amber-ink)" }}>{l.nivel}</span></div>
                <div className="mono" style={{ textAlign: "right", color: "var(--green-ink)" }}>{l.credito}</div>
                <div className="mono" style={{ textAlign: "right", color: "var(--red-ink)" }}>{l.custo}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-4" style={{ marginBottom: 28, padding: 16, background: "var(--paper)", borderRadius: 10 }}>
          <div className="text-center" style={{ gridColumn: "span 1" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>Total créditos</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--green-ink)" }}>+R$ 15.100</div>
          </div>
          <div className="text-center" style={{ gridColumn: "span 1" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>Total custos</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--red-ink)" }}>−R$ 17.704,80</div>
          </div>
          <div className="text-center" style={{ gridColumn: "span 1" }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>Saldo a pagar</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--red-ink)" }}>R$ 2.604,80</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Aprovação técnica</div>
        <div style={{ padding: 14, border: "1px solid var(--rule)", borderRadius: 8, marginBottom: 28, fontSize: 13 }}>
          <div style={{ marginBottom: 4 }}>
            Item técnico: <strong>Pontos Elétricos (+6)</strong> — aprovado por <strong>Eng. Carlos Medeiros</strong> (CREA 12345/SP)
          </div>
          <div className="text-soft">Parecer: "Quadro elétrico suporta adição de 6 pontos sem troca de disjuntor geral. Execução conforme projeto complementar."</div>
        </div>

        <div className="grid grid-2" style={{ gap: 40, marginBottom: 24, paddingTop: 20, borderTop: "2px solid var(--rule)" }}>
          <div className="text-center">
            <div style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 40, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Marina Alves</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Cliente — CPF •••.•••.•••-89</div>
          </div>
          <div className="text-center">
            <div style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 40, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Prado Engenharia Ltda.</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Representante legal</div>
          </div>
        </div>

        <div className="text-center text-soft" style={{ fontSize: 10, paddingTop: 16, borderTop: "1px solid var(--paper-2)" }}>
          Documento gerado automaticamente pela plataforma plantta · Assinatura digital conforme MP 2.200-2/2001 · Hash: 7f3a...c92d
        </div>
      </div>
    </div>
  );
}
