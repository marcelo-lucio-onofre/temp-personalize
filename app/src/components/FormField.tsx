/** Label + slot de input + erro inline abaixo — layout puro, o campo em si
 * (input/select/textarea) é passado como children pelo caller, que também
 * decide quando validar (blur) e aplica `input input--invalid` no erro. */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required && <span style={{ color: "var(--red-ink)" }}> *</span>}
      </label>
      {children}
      {error ? (
        <div className="field-error" role="alert">{error}</div>
      ) : hint ? (
        <div className="text-soft" style={{ fontSize: 12, marginTop: 5 }}>{hint}</div>
      ) : null}
    </div>
  );
}
