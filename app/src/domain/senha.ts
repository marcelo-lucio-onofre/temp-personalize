const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** Senha temporária de primeiro acesso — enviada por e-mail ao cliente,
 * troca de fato fica fora do escopo deste protótipo. Sem caracteres
 * ambíguos (0/O, 1/I/l) pra evitar erro de digitação ao copiar do e-mail. */
export function gerarSenhaTemporaria(tamanho = 10): string {
  let senha = "";
  for (let i = 0; i < tamanho; i++) senha += CHARS[Math.floor(Math.random() * CHARS.length)];
  return senha;
}
