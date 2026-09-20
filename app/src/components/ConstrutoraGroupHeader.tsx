import type { Brand } from "../domain/types";

const iniciais = (nome: string): string =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/**
 * Construtora identity badge + name — the one place that decides how a
 * construtora is represented (real logo on a dark chip, or colored
 * initials). Shared by every screen that groups by construtora so they
 * can't drift apart (Personalizações list, wizard step 1).
 */
export function ConstrutoraGroupHeader({ nome, brand }: { nome: string; brand: Brand | null | undefined }) {
  return (
    <div className="row gap-sm" style={{ alignItems: "center", marginBottom: 14 }}>
      {brand?.logo ? (
        <span
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <img src={brand.logo} alt={nome} style={{ maxWidth: 22, maxHeight: 22, objectFit: "contain" }} />
        </span>
      ) : (
        <span
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: brand?.color ?? "var(--navy)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 12,
          }}
        >
          {iniciais(nome)}
        </span>
      )}
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{nome}</div>
    </div>
  );
}
