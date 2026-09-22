import { useId } from "react";

/** Barra de filtro das listagens — busca com sugestão nativa (mesmo padrão
 * de datalist do SugestaoInput.tsx) + slot pra filtros adicionais (select
 * de categoria, chips de papel, etc.), tudo client-side. */
export function FilterBar({
  value,
  onChange,
  placeholder,
  suggestions,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suggestions: string[];
  children?: React.ReactNode;
}) {
  const listId = useId();
  return (
    <div className="filter-bar">
      <div style={{ flex: "1 1 240px" }}>
        <input
          className="input"
          list={listId}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
        />
        <datalist id={listId}>
          {[...new Set(suggestions)].map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>
      </div>
      {children}
    </div>
  );
}

/** Substring case-insensitive contra vários campos de uma vez — usado pra
 * filtrar linhas de tabela pela busca do FilterBar. */
export function textMatch(query: string, ...fields: (string | undefined | null)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f ?? "").toLowerCase().includes(q));
}
