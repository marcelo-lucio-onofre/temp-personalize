import type { Item, NivelAprovacao } from "../domain/types";
import { nivelLabel, statusPrazo } from "../domain/calculations";

const classByNivel: Record<NivelAprovacao, string> = {
  1: "badge badge--simples",
  2: "badge badge--tecnico",
  3: "badge badge--bloqueado",
};

export function NivelBadge({ nivel }: { nivel: NivelAprovacao }) {
  return <span className={classByNivel[nivel]}>{nivelLabel(nivel)}</span>;
}

const classByStatusPrazo = {
  aberto: "badge badge--simples",
  nao_iniciado: "badge badge--tecnico",
  encerrado: "badge badge--bloqueado",
} as const;

/** Aberto=verde (mesma semântica de crédito/aprovado), Não iniciado=âmbar
 * (mesma semântica de pendente/técnico), Encerrado=vermelho (mesma
 * semântica de débito/recusado) — sem inventar cor nova, ver design.md §2.
 * Sem prazo definido não renderiza nada. */
export function PrazoBadge({ item }: { item: Pick<Item, "prazoInicio" | "prazoFim"> }) {
  const status = statusPrazo(item);
  if (status === "sem_prazo") return null;
  const texto =
    status === "encerrado"
      ? "Prazo encerrado"
      : status === "nao_iniciado"
        ? `Abre em ${item.prazoInicio}`
        : item.prazoInicio && item.prazoFim
          ? `Prazo: ${item.prazoInicio} – ${item.prazoFim}`
          : item.prazoFim
            ? `Prazo até ${item.prazoFim}`
            : "Prazo aberto";
  return <span className={classByStatusPrazo[status]}>{texto}</span>;
}
