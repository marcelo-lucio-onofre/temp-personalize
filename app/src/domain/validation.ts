/** Validadores puros de campo — rodam no blur e no submit, nunca a cada
 * tecla (ver FormField.tsx). Retornam a mensagem de erro ou undefined. */
export type Validator = (value: string) => string | undefined;

export function required(msg = "Campo obrigatório"): Validator {
  return (v) => (v.trim() ? undefined : msg);
}

export function email(msg = "E-mail inválido"): Validator {
  return (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : msg);
}

export function uf(msg = "UF inválida"): Validator {
  return (v) => (!v.trim() || /^[A-Za-z]{2}$/.test(v.trim()) ? undefined : msg);
}

/** Formato leve (tamanho/dígitos) — não verifica dígito verificador real. */
export function cnpjCpf(msg = "CNPJ/CPF inválido"): Validator {
  return (v) => {
    if (!v.trim()) return undefined;
    const digits = v.replace(/\D/g, "");
    return digits.length === 11 || digits.length === 14 ? undefined : msg;
  };
}

export function compose(...validators: Validator[]): Validator {
  return (v) => {
    for (const validator of validators) {
      const err = validator(v);
      if (err) return err;
    }
    return undefined;
  };
}
