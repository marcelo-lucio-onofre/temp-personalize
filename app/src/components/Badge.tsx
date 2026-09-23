import type { Item, NivelAprovacao } from "../domain/types";
import { calcularJanelaPersonalizacao, nivelLabel, statusPrazo } from "../domain/calculations";

const classByNivel: Record<NivelAprovacao, string> = {
  1: "badge badge--simples",
  2: "badge badge--tecnico",
  3: "badge badge--bloqueado",
};

export function NivelBadge({ nivel }: { nivel: NivelAprovacao }) {
  return <span className={classByNivel[nivel]}>{nivelLabel(nivel)}</span>;
}

/** Exigência documental (ART/RRT) — independente do nível de aprovação,
 * que é sobre quem decide, não sobre o que precisa ser registrado. */
export function ArtBadge({ requerArt }: { requerArt?: boolean }) {
  if (!requerArt) return null;
  return <span className="badge badge--tecnico">Requer ART</span>;
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

const classByStatusJanela = {
  habilitado: "badge badge--simples",
  habilitado_em_breve: "badge badge--tecnico",
  desabilitado: "badge badge--bloqueado",
} as const;

/**
 * Janela de personalização do EMPREENDIMENTO — derivada do catálogo (menor
 * início / maior fim entre todos os itens de todas as plantas), nunca um
 * campo próprio. Mesma semântica de cor de PrazoBadge. Sem itens com prazo
 * ainda (empreendimento recém-cadastrado, catálogo vazio) não renderiza
 * nada.
 */
export function JanelaBadge({ itens }: { itens: Pick<Item, "prazoInicio" | "prazoFim">[] }) {
  const janela = calcularJanelaPersonalizacao(itens);
  if (janela.status === "sem_prazo") return null;
  const texto =
    janela.status === "desabilitado"
      ? "Personalização encerrada"
      : janela.status === "habilitado_em_breve"
        ? `Personalização abre em ${janela.inicio}`
        : janela.inicio && janela.fim
          ? `Personalização: ${janela.inicio} – ${janela.fim}`
          : janela.fim
            ? `Personalização aberta até ${janela.fim}`
            : "Personalização aberta";
  return <span className={classByStatusJanela[janela.status]}>{texto}</span>;
}
