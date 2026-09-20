# DESIGN.md — plantta

Especificação de identidade visual pra quem (humano ou agente) for mexer na interface deste projeto. Objetivo: qualquer tela nova nasce parecida com as outras sem precisar redescobrir decisão por decisão.

## 1. Conceito de identidade visual

**plantta** é uma plataforma que transforma personalização de acabamentos numa obra — hoje resolvida em planilha e WhatsApp — em processo documentado: crédito calculado, aprovação técnica, termo assinado. A referência visual não é "SaaS genérico", é **papel técnico e canteiro de obra**: blueprint, memorial descritivo, ficha de material (concreto, porcelanato, granito). Isso guia toda decisão de cor/tipografia abaixo.

Princípios:
- **Neutros quentes, nunca azul-marinho.** Preto-azulado é o padrão de qualquer dashboard SaaS gerado. Aqui os neutros puxam pra um cinza-grafite quente (hue ~85-95 em oklch), como papel de rascunho técnico.
- **Verde funcional, não decorativo.** Verde só aparece onde significa crédito, aprovado, ou ação primária — nunca como wash decorativo.
- **Marca da construtora é dado, não decisão de design.** Quando o portal do cliente está em modo white-label, a cor de destaque (`--brand`) vem do banco (`Vinculo.brand`), não da paleta plantta. Ver seção 6.
- **Sem chrome decorativo.** Nada de eyebrow ALL-CAPS repetindo o que o breadcrumb já disse, nada de seta "→" no fim de botão/link só por estética. Se um elemento não carrega informação nova, ele não existe.

## 2. Paleta de cores

Definida em `src/index.css`, bloco `:root`. Valores em oklch (fonte da verdade — não converter pra hex e perder precisão).

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `oklch(20% 0.012 95)` | Texto principal |
| `--ink-soft` | `oklch(50% 0.010 90)` | Texto secundário/legenda |
| `--ink-softer` | `oklch(60% 0.010 90)` | Texto terciário, desabilitado |
| `--paper` | `oklch(97% 0.007 85)` | Fundo da página |
| `--paper-2` | `oklch(93% 0.008 85)` | Fundo de bloco alternado |
| `--rule` / `--rule-strong` | `oklch(90%/86% ... 85)` | Bordas |
| `--card` | `#fffdf9` | Fundo de card (branco levemente quente, não `#fff` puro) |
| `--navy` / `--navy-2` | `oklch(19%/30% 0.014 85)` | Fundo da sidebar — preto-grafite quente, **não azul** |
| `--green` / `--green-ink` / `--green-bg` | `oklch(50%/38%/94% 0.10-0.035 155)` | Crédito, aprovado, marca plantta padrão |
| `--amber-ink` / `--amber-bg` | `oklch(42%/94% 0.12/0.05 75)` | Nível técnico, pendente |
| `--red-ink` / `--red-bg` | `oklch(42%/94% 0.12/0.05 25)` | Débito, bloqueado, recusado |
| `--violet-bg` / `--violet-ink` | `oklch(95%/42% 0.035/0.12 260)` | Em análise |
| `--brand` | `var(--green)` por padrão, **sobrescrito por vínculo** | Ver seção 6 |

Regra: `--green` é sempre um verde **desaturado** (chroma ~0.10, não 0.16+) — verde de segurança de canteiro, não esmeralda de startup.

## 3. Tipografia

**IBM Plex Sans** (UI/prosa) + **IBM Plex Mono** (dados/números/IDs). Uma família só, dois papéis — não duas famílias arbitrárias. Escolhida porque o brief original da Plex é documentação técnica, que é literalmente o que o produto faz: vira decisão solta em documento preciso.

- Pesos carregados: Sans 400/500/600/700, Mono 400/500/600 (ver `index.html`). **Não pedir peso 800 da Plex Sans — não existe, cai em negrito sintético.**
- `.mono` (Plex Mono) só em dado tabular de verdade: dinheiro, IDs (`SOL-013`), timestamps, badges de nível. Nunca em prosa decorativa.
- Nunca ALL-CAPS pra rótulo de texto corrido (era `.eyebrow`, removido — ver seção 7). ALL-CAPS só sobrevive em rótulo de agrupamento de UI real (label de seção na sidebar, badge de status) — isso é estrutura de navegação, não decoração de conteúdo.

## 4. Espaçamento & grid

- `--radius-sm/--radius/--radius-lg`: 6/10/14px.
- `--gap`: 16px, escala via classes `.gap-xs`(6) `.gap-sm`(10) `.gap`(16) `.gap-lg`(24).
- `.container` max-width 1100px (`--narrow` 820, `--wide` 1200), padding lateral 16px, breakpoint mobile em 720px (grids de 2/4 colunas viram 1 coluna).
- Sidebar: 860px é o breakpoint — abaixo disso vira topbar+drawer, acima é coluna fixa. Ver `.portal-shell`/`.portal-body` em `index.css`: o shell é `flex-direction: column` (topbar em cima), e sidebar+conteúdo ficam numa `.portal-body` interna em row. **Não inverter isso** — já quebrou uma vez (topbar virando item de flex-row e esticando a tela toda).

## 5. Componentes

- `.card` — bloco com borda, usado pra unidade **clicável/selecionável** (opção de acabamento, vínculo, linha de lista). Se não é clicável, considerar um bloco mais simples (fundo tintado sem borda) em vez de reaproveitar `.card` por preguiça — isso é o "SaaS-card-kit genérico" que a skill de frontend-design aponta como tell de IA.
- `.badge--simples/tecnico/bloqueado` — cor é semântica (nível de aprovação), nunca segue `--brand`.
- `.btn--primary` usa `var(--brand)` — herda automaticamente a cor certa (plantta ou construtora) por estar dentro do escopo de `--brand` setado no `ClientPortalLayout`/`SidebarShell`.
- `Breadcrumb` (`components/Breadcrumb.tsx`) é a única forma de "onde estou" — não duplicar com eyebrow acima do H1.

## 6. White-label — regra crítica

O portal do cliente pode rodar com a marca da plantta (padrão) ou com a marca real da construtora (vínculo com `brand` preenchido em `mockData.vinculos`). Isso é resolvido em `AppContext.effectiveBrand` = `activeVinculo?.brand ?? planttaBrand`, e propagado via CSS var `--brand` no `SidebarShell`. **Qualquer cor de destaque na tela do cliente deve ler `var(--brand)`, nunca `var(--green)` fixo** — senão a troca de marca fica pela metade (alguns elementos mudam, outros não). O back-office da construtora nunca troca de marca — sempre plantta.

## 7. Histórico de decisões (não repetir)

- ~~Plus Jakarta Sans~~ → IBM Plex Sans (Plus Jakarta virou clichê de output de IA).
- ~~Sidebar azul-marinho (`oklch(20% 0.025 260)`)~~ → grafite quente (`oklch(19% 0.014 85)`).
- ~~Verde `oklch(55% 0.16 155)` saturado~~ → `oklch(50% 0.10 155)` desaturado.
- ~~`.eyebrow` ALL-CAPS acima de todo H1~~ → removido; info real (quando existe) virou parágrafo normal.
- ~~Seta "→" decorativa no fim de link/botão~~ → removida em todo lugar.
- ~~Ícone emoji na sidebar~~ → `lucide-react` em todo lugar (mesma lib usada em `reservas-hub` e `omnix`, os dois projetos-referência do time).
- ~~Menu lateral com árvore estática de construtora/empreendimento/unidade~~ → removido; seleção de unidade virou passo 1 do wizard "Nova personalização". Sidebar do cliente só tem "Nova personalização" + "Minhas personalizações".
