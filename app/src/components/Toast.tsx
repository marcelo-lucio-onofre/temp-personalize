import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ToastItem {
  id: number;
  type: "success" | "error";
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/** Pilha de toasts de feedback de ação (salvar/excluir) — canto inferior
 * direito, some sozinho em 4s. `aria-live="polite"` pra não atropelar
 * leitor de tela no meio de outra leitura. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const push = useCallback((type: ToastItem["type"], message: string) => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const value: ToastContextValue = {
    success: useCallback((message: string) => push("success", message), [push]),
    error: useCallback((message: string) => push("error", message), [push]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="status">
            <span className="toast-icon">
              {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
