import { Plus, Trash2 } from "lucide-react";

/**
 * CRUD de vocabulário de uma palavra só (nome) — Categoria e Marca têm
 * exatamente a mesma forma (id + nome, escopado por construtora), então
 * compartilham essa UI em vez de duas cópias quase idênticas.
 */
export function SimpleNomeCrud({
  titulo,
  descricao,
  itens,
  onCriar,
  onAtualizar,
  onRemover,
  placeholder,
}: {
  titulo: string;
  descricao: string;
  itens: { id: string; nome: string }[];
  onCriar: () => void;
  onAtualizar: (id: string, nome: string) => void;
  onRemover: (id: string) => void;
  placeholder: string;
}) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{titulo}</div>
        <button type="button" className="btn btn--sm" onClick={onCriar}>
          <Plus className="sidebar-nav-icon" /> Novo
        </button>
      </div>
      <div className="text-soft" style={{ fontSize: 12.5, marginBottom: 16 }}>{descricao}</div>

      {itens.length === 0 && <div className="text-soft" style={{ fontSize: 13 }}>Nada cadastrado ainda.</div>}

      <div className="stack gap-sm">
        {itens.map((it) => (
          <div
            key={it.id}
            className="row gap-sm"
            style={{ alignItems: "center", border: "1px solid var(--rule)", borderRadius: 8, padding: "8px 12px", background: "var(--paper)" }}
          >
            <input className="input" style={{ flex: 1 }} value={it.nome} placeholder={placeholder} onChange={(e) => onAtualizar(it.id, e.target.value)} />
            <button
              type="button"
              style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", padding: 4, flexShrink: 0 }}
              onClick={() => onRemover(it.id)}
              aria-label="Remover"
            >
              <Trash2 className="sidebar-nav-icon" style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
