import { useId, type CSSProperties } from "react";
import { normalizarContraLista } from "../domain/calculations";

/**
 * Texto livre com sugestões (marca, ambiente) — não é enum fechado como
 * Categoria, mas também não pode virar "Portobello" e "portobello" como
 * duas linhas diferentes num relatório. Datalist nativo dá o autocomplete;
 * o onBlur normaliza a grafia pra bater com uma sugestão já existente
 * quando o usuário digitou algo que só difere por caixa/espaço.
 */
export function SugestaoInput({
  value,
  options,
  onChange,
  placeholder,
  className = "input",
  style,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const listId = useId();
  return (
    <>
      <input
        className={className}
        style={style}
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          const normalizado = normalizarContraLista(e.target.value, options);
          if (normalizado !== e.target.value) onChange(normalizado);
        }}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
