import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_k0dpx7w";
const TEMPLATE_ID = "template_qkvlcqz";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

if (PUBLIC_KEY) emailjs.init({ publicKey: PUBLIC_KEY });

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
 * configurados no painel da EmailJS. Se a chave pública não estiver
 * configurada (VITE_EMAILJS_PUBLIC_KEY), não tenta enviar.
 */
export async function enviarEmailBoasVindas(params: EmailBoasVindasParams): Promise<void> {
  if (!PUBLIC_KEY) {
    console.warn("EmailJS: VITE_EMAILJS_PUBLIC_KEY não configurada — e-mail de boas-vindas não enviado.");
    return;
  }
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...params });
}
