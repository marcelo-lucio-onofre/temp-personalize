import { BrandMark } from "../components/BrandMark";

/**
 * Link de descadastro dos e-mails de boas-vindas/notificação — destino do
 * `unsubscribeUrl` enviado pela EmailJS. Protótipo sem backend de e-mail
 * próprio, então não há preferência real pra persistir; só confirma pro
 * cliente que o pedido foi recebido.
 */
export function DescadastroPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px", background: "var(--navy)" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 20px 50px -30px rgba(0,0,0,.5)", textAlign: "center" }}>
        <div className="row gap-sm" style={{ marginBottom: 22, justifyContent: "center" }}>
          <BrandMark light={false} />
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>Preferência atualizada</h1>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>
          Você não receberá mais e-mails de boas-vindas/notificação da plantta.
        </p>
      </div>
    </div>
  );
}
