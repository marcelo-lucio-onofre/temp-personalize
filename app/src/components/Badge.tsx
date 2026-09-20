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

/** Aberto=verde (mesma semântica de crédito/aprovado), Encerrado=vermelho
 * (mesma semântica de débito/recusado) — sem inventar cor nova, ver
 * design.md §2. Sem prazo definido não renderiza nada. */
export function PrazoBadge({ item }: { item: Pick<Item, "prazo"> }) {
  const status = statusPrazo(item);
  if (status === "sem_prazo") return null;
  return (
    <span className={status === "aberto" ? "badge badge--simples" : "badge badge--bloqueado"}>
      {status === "aberto" ? `Prazo até ${item.prazo}` : "Prazo encerrado"}
    </span>
  );
}
