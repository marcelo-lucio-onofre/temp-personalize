import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { useApp } from "../state/AppContext";

const SWATCHES = ["#fd3541", "#2e9e68", "#0163a3", "#7c3aed", "#d9622b", "#0891b2"];

export function MarcaPage() {
  const { vinculos, construtoraLogadaId, brandRepo, saveBrand } = useApp();
  const navigate = useNavigate();

  const construtoraNome = vinculos.find((v) => v.construtoraId === construtoraLogadaId)?.construtoraNome ?? "Construtora";
  const brand = construtoraLogadaId ? brandRepo.getBrand(construtoraLogadaId) : null;

  const [nome, setNome] = useState(brand?.nome ?? construtoraNome);
  const [color, setColor] = useState(brand?.color ?? SWATCHES[0]);
  const [logo, setLogo] = useState<string | null>(brand?.logo ?? null);

  const initial = nome.trim()[0]?.toUpperCase() ?? "P";

  function handleLogo(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!construtoraLogadaId) return;
    saveBrand(construtoraLogadaId, { nome, color, logo });
    navigate("/painel");
  }

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Marca" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Personalizar portal do cliente</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 28, maxWidth: "58ch", lineHeight: 1.5 }}>
        Cor e logo aparecem na tela de login e no portal que o comprador acessa — o resto da plataforma continua com a marca padrão.
      </p>

      <div className="row gap-lg" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px" }} className="stack gap">
          <div className="card">
            <label className="label">Nome de exibição</label>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Prado Engenharia" />
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>
              Substitui "plantta" no cabeçalho do login e do portal do cliente.
            </div>
          </div>

          <div className="card">
            <label className="label">Cor primária</label>
            <div className="row gap-sm" style={{ marginBottom: 12 }}>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 44, height: 36, border: "1px solid var(--rule-strong)", borderRadius: 7, padding: 2, cursor: "pointer" }} />
              <span className="mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>{color}</span>
            </div>
            <div className="row gap-sm">
              {SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  onClick={() => setColor(hex)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    border: `2px solid ${color === hex ? "var(--ink)" : "transparent"}`,
                    background: hex,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="card">
            <label className="label">Logo</label>
            <div className="row gap">
              {logo ? (
                <span style={{ width: 52, height: 52, borderRadius: 12, background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={logo} alt="Logo" style={{ maxWidth: 38, maxHeight: 38, objectFit: "contain" }} />
                </span>
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 12, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>
                  {initial}
                </div>
              )}
              <div className="stack gap-xs">
                <input type="file" accept="image/*" onChange={(e) => handleLogo(e.target.files)} style={{ fontSize: 12 }} />
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Use o arquivo oficial da construtora — PNG ou SVG, fundo transparente.</div>
                {logo && (
                  <button
                    type="button"
                    style={{ fontSize: 11.5, color: "var(--red-ink)", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                    onClick={() => setLogo(null)}
                  >
                    Remover logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <button type="button" className="btn btn--primary" style={{ alignSelf: "flex-start", background: color }} onClick={handleSave}>
            Salvar e aplicar no portal
          </button>
        </div>

        <div style={{ flex: "1 1 280px" }} className="sticky-side">
          <div className="mono text-soft" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>
            Pré-visualização
          </div>
          <div className="card">
            <div className="row gap-sm" style={{ marginBottom: 16 }}>
              {logo ? (
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={logo} alt="Logo" style={{ maxWidth: 22, maxHeight: 22, objectFit: "contain" }} />
                </span>
              ) : (
                <div style={{ width: 30, height: 30, borderRadius: 8, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  {initial}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 12.5, lineHeight: 1.2 }}>{nome}</div>
                <div style={{ fontSize: 9.5, color: "var(--ink-soft)" }}>Portal do cliente</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-soft)", marginBottom: 6 }}>Saldo líquido</div>
            <div style={{ border: `2px solid ${color}`, borderRadius: 9, padding: 12, marginBottom: 10 }}>
              <div className="mono" style={{ fontSize: 17, fontWeight: 700, color }}>+R$ 5.940,00</div>
            </div>
            <button type="button" className="btn btn--primary btn--block" style={{ background: color }}>
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
