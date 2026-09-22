import { Modal } from "./Modal";

/** Confirmação de exclusão — o botão de excluir já vem desabilitado (com
 * `title` explicando o motivo) em quem chama isso quando o registro está
 * em uso, então este diálogo só cobre o caso "pode excluir, confirma?". */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Excluir",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 20 }}>
        {description}
      </p>
      <div className="row gap-sm" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="btn btn--sm" onClick={onClose}>Cancelar</button>
        <button
          type="button"
          className="btn btn--sm"
          style={{ background: "var(--red-ink)", color: "#fff", borderColor: "var(--red-ink)" }}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
