import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Dialog genérico usado pelos formulários pequenos (Categoria/Marca/
 * Material). Fecha em Esc ou clique fora, foca o primeiro campo ao abrir e
 * devolve o foco pra quem abriu ao fechar — padrão de foco de modal
 * acessível (ver frontend-patterns). */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const first = panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button");
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
