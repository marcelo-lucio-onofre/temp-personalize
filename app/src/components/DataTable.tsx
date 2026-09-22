import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  mono?: boolean;
}

/** Tabela genérica com paginação client-side fixa em 10/página — usada por
 * todos os cadastros (Categorias, Marcas, Fornecedores, Materiais,
 * Pessoas, Empreendimentos). Ações da linha ficam à direita, coluna própria. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  emptyMessage,
  pageSize = 10,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
  emptyMessage: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * pageSize;
  const visible = rows.slice(start, start + pageSize);

  return (
    <div className="card table-scroll" style={{ padding: 0 }}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}>{c.header}</th>
            ))}
            {actions && <th style={{ textAlign: "right" }}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} className={c.mono ? "mono" : undefined}>{c.render(row)}</td>
              ))}
              {actions && (
                <td>
                  <div className="table-actions">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <div className="table-empty">{emptyMessage}</div>}

      {rows.length > 0 && (
        <div className="pagination">
          <span>{start + 1}–{Math.min(start + pageSize, rows.length)} de {rows.length}</span>
          <div className="row gap-xs">
            <button
              type="button"
              className="table-icon-btn"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="mono" style={{ fontSize: 12, padding: "0 4px" }}>{currentPage + 1}/{pageCount}</span>
            <button
              type="button"
              className="table-icon-btn"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
