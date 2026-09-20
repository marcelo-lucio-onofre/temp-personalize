import { useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";

const heroPhoto = "https://alliance.com.br/wp-content/uploads/2025/11/Copia-de-Guarita-1.jpg";

/**
 * Branded (white-label) client login — this is Alliance's own login page,
 * so signing in here goes straight to the Alliance vínculo's portal
 * (skipping the "meus imóveis" picker the generic login uses) and that
 * portal renders with Alliance's brand throughout.
 */
export function LoginClientePage() {
  const { brand, loginCliente } = useApp();
  const navigate = useNavigate();

  function handleEnter() {
    loginCliente("v-boulevard-501");
    navigate("/personalizacoes");
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "'Barlow','Plus Jakarta Sans',sans-serif" }}>
      <div
        style={{
          flex: "1 1 460px",
          minHeight: 420,
          position: "relative",
          backgroundImage: `linear-gradient(180deg, rgba(10,10,10,.15) 0%, rgba(10,10,10,.35) 55%, rgba(10,10,10,.86) 100%), url('${heroPhoto}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {brand.logo ? (
            <img src={brand.logo} alt={brand.nome} style={{ height: 26 }} />
          ) : (
            <>
              <div style={{ fontFamily: "'Noto Serif Display',serif", fontSize: 22, letterSpacing: ".12em", textTransform: "uppercase" }}>
                {brand.nome}
              </div>
              <svg width="120" height="13" viewBox="0 0 130 14" style={{ marginTop: 2 }}>
                <path d="M2 4 C 40 14, 90 14, 128 3" stroke={brand.color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </svg>
            </>
          )}
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", marginBottom: 12, fontWeight: 600 }}>
            Portal exclusivo do cliente
          </div>
          <h1 style={{ fontFamily: "'Noto Serif Display',serif", fontWeight: 400, fontSize: "clamp(24px,3.2vw,32px)", lineHeight: 1.22, marginBottom: 12, maxWidth: "20ch" }}>
            Acompanhe a personalização do seu apartamento em tempo real.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,.85)", maxWidth: "38ch", marginBottom: 0 }}>
            Escolhas, crédito gerado e aprovação técnica — tudo num só lugar, sem planilha e sem e-mail perdido.
          </p>
        </div>
      </div>

      <div style={{ flex: "1 1 340px", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: "#222" }}>Acesse seu apartamento</h2>
          <p style={{ fontSize: 13, color: "#7b7b7b", marginBottom: 24, lineHeight: 1.5 }}>
            Entre com os dados enviados pela {brand.nome} no e-mail de boas-vindas.
          </p>

          <div className="stack gap-sm" style={{ marginBottom: 20 }}>
            <div>
              <label className="label">Unidade ou e-mail</label>
              <input className="input" placeholder="apto501@allianceboulevard.com.br" />
            </div>
            <div>
              <label className="label">CPF ou senha</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            style={{ background: brand.color, textTransform: "uppercase", letterSpacing: ".04em" }}
            onClick={handleEnter}
          >
            Entrar
          </button>

          <div className="mono text-center text-soft" style={{ fontSize: 10.5, marginTop: 16 }}>
            Ambiente de demonstração — qualquer valor entra.
          </div>
        </div>
      </div>
    </div>
  );
}
