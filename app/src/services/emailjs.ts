import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_k0dpx7w";
const TEMPLATE_ID = "template_qkvlcqz";
// Chave pública da conta EmailJS — não é secreta (é feita pra rodar no
// navegador), mas VITE_EMAILJS_PUBLIC_KEY ainda permite trocar por outra
// conta em outro ambiente sem tocar no código.
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "9mOEOt45cm72sa5Sq";

emailjs.init({ publicKey: PUBLIC_KEY });

export interface EmailBoasVindasParams {
  nome: string;
  email: string;
  senha: string;
  loginUrl: string;
  unsubscribeUrl: string;
}

/**
 * Envia o e-mail de boas-vindas com as credenciais de acesso — via EmailJS
 * direto do navegador (sem backend próprio), usando o serviço/template já
 * configurados no painel da EmailJS.
 */
export async function enviarEmailBoasVindas(params: EmailBoasVindasParams): Promise<void> {
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...params });
}
