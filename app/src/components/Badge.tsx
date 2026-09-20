import type { NivelAprovacao } from "../domain/types";
import { nivelLabel } from "../domain/calculations";

const classByNivel: Record<NivelAprovacao, string> = {
  1: "badge badge--simples",
  2: "badge badge--tecnico",
  3: "badge badge--bloqueado",
};

export function NivelBadge({ nivel }: { nivel: NivelAprovacao }) {
  return <span className={classByNivel[nivel]}>{nivelLabel(nivel)}</span>;
}
