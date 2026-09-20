import { useNavigate } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useApp } from "../state/AppContext";

export function LoginConstrutoraPage() {
  const { loginConstrutora } = useApp();
  const navigate = useNavigate();

  function handleEnter() {
    loginConstrutora();
    navigate("/painel");
  }

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px", background: "var(--navy)" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 20px 50px -30px rgba(0,0,0,.5)" }}>
        <div className="row gap-sm" style={{ marginBottom: 22 }}>
          <BrandMark light={false} />
          <span
            className="mono"
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              borderLeft: "1px solid var(--rule-strong)",
              paddingLeft: 8,
            }}
          >
            Construtora
          </span>
        </div>

        <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>Painel da construtora</h1>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 22, lineHeight: 1.5 }}>
          Acesse a fila de aprovação, o cadastro de empreendimentos e a marca do seu portal de cliente.
        </p>

        <div className="stack gap-sm" style={{ marginBottom: 20 }}>
          <div>
            <label className="label">E-mail corporativo</label>
            <input className="input" placeholder="voce@construtora.com.br" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
        </div>

        <button type="button" className="btn btn--primary btn--block" onClick={handleEnter}>
          Entrar
        </button>

        <div className="mono text-center text-soft" style={{ fontSize: 10.5, marginTop: 16 }}>
          Ambiente de demonstração — qualquer valor entra.
        </div>
      </div>
    </div>
  );
}
