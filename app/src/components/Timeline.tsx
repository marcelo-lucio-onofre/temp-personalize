import { fmtDataHora } from "../domain/calculations";
import type { TimelineEvent, TipoEventoTimeline } from "../domain/types";

const corPorTipo: Record<TipoEventoTimeline, string> = {
  criacao: "var(--ink-soft)",
  roteamento: "var(--violet-ink)",
  assumido: "var(--violet-ink)",
  parecer: "var(--amber-ink)",
  aprovacao: "var(--green-ink)",
  recusa: "var(--red-ink)",
  info: "var(--ink-soft)",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="stack" style={{ gap: 0 }}>
      {events.map((ev, i) => (
        <div key={ev.id} className="row gap-sm" style={{ alignItems: "flex-start" }}>
          <div className="stack" style={{ alignItems: "center", flexShrink: 0, width: 14 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: corPorTipo[ev.tipo], marginTop: 4 }} />
            {i < events.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 28, background: "var(--rule)" }} />}
          </div>
          <div style={{ paddingBottom: 18, flex: 1 }}>
            <div className="row gap-sm" style={{ marginBottom: 2 }}>
              <span className="mono text-soft" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{fmtDataHora(ev.data)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: corPorTipo[ev.tipo] }}>{ev.autor}</span>
              <span className="text-soft" style={{ fontSize: 11 }}>· {ev.papel}</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{ev.texto}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
