import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { NivelBadge } from "../components/Badge";
import { fmtBRL } from "../domain/calculations";
import type { AllowanceGroup, Ambiente, Item, MaterialCatalogItem, NivelAprovacao, Opcao } from "../domain/types";
import { useApp } from "../state/AppContext";

const gerarId = (prefixo: string) => `${prefixo}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const NOVO_MATERIAL: Omit<MaterialCatalogItem, "id" | "construtoraId"> = {
  categoria: "", marca: "", modelo: "", sku: "", fornecedor: "", precoCliente: 0, custoConstrutora: 0, leadTimeDias: 0, imagemUrl: null,
};

/**
 * Biblioteca de materiais do construtora — reutilizável entre todos os
 * empreendimentos dele, em vez de digitar marca/SKU/preço de novo em cada
 * item (é o próprio ponto do MATERIAL_CATALOG do benchmark).
 */
function BibliotecaMateriais({ construtoraId }: { construtoraId: string }) {
  const { catalogoMateriais, criarMaterial, atualizarMaterial, removerMaterial } = useApp();
  const materiais = catalogoMateriais.list(construtoraId);

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Biblioteca de materiais</div>
        <button type="button" className="btn btn--sm" onClick={() => criarMaterial({ ...NOVO_MATERIAL, construtoraId })}>
          <Plus className="sidebar-nav-icon" /> Novo material
        </button>
      </div>
      <div className="text-soft" style={{ fontSize: 12.5, marginBottom: 16 }}>
        Cadastre marca, SKU e preço uma vez — depois anexe a quantas opções de item quiser, nos ambientes abaixo.
      </div>

      {materiais.length === 0 && <div className="text-soft" style={{ fontSize: 13 }}>Nenhum material cadastrado ainda.</div>}

      <div className="stack gap-sm">
        {materiais.map((m) => (
          <div key={m.id} style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: 12, background: "var(--paper)" }}>
            <div className="grid grid-2" style={{ marginBottom: 8, gap: 8 }}>
              <div>
                <label className="label">Categoria</label>
                <input className="input" value={m.categoria} onChange={(e) => atualizarMaterial(m.id, { categoria: e.target.value })} placeholder="Piso" />
              </div>
              <div>
                <label className="label">Marca</label>
                <input className="input" value={m.marca} onChange={(e) => atualizarMaterial(m.id, { marca: e.target.value })} placeholder="Portobello" />
              </div>
              <div>
                <label className="label">Modelo</label>
                <input className="input" value={m.modelo} onChange={(e) => atualizarMaterial(m.id, { modelo: e.target.value })} placeholder="Premium 80×80" />
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="input" value={m.sku} onChange={(e) => atualizarMaterial(m.id, { sku: e.target.value })} placeholder="PTB-PREM-8080" />
              </div>
              <div>
                <label className="label">Fornecedor</label>
                <input className="input" value={m.fornecedor} onChange={(e) => atualizarMaterial(m.id, { fornecedor: e.target.value })} placeholder="Distribuidora ABC" />
              </div>
              <div>
                <label className="label">Lead time (dias)</label>
                <input className="input" type="number" min={0} value={m.leadTimeDias} onChange={(e) => atualizarMaterial(m.id, { leadTimeDias: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Preço cliente (R$)</label>
                <input className="input" type="number" min={0} value={m.precoCliente} onChange={(e) => atualizarMaterial(m.id, { precoCliente: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Custo construtora (R$)</label>
                <input className="input" type="number" min={0} value={m.custoConstrutora} onChange={(e) => atualizarMaterial(m.id, { custoConstrutora: Number(e.target.value) })} />
              </div>
            </div>
            <button
              type="button"
              style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}
              onClick={() => removerMaterial(m.id)}
            >
              <Trash2 className="sidebar-nav-icon" style={{ width: 13, height: 13, marginRight: 4 }} /> Remover material
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpcaoRow({ opcao, onChange, onRemove }: { opcao: Opcao; onChange: (patch: Partial<Opcao>) => void; onRemove: () => void }) {
  return (
    <div className="row gap-sm" style={{ alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--rule)" }}>
      <input className="input" style={{ flex: "2 1 160px" }} value={opcao.nome} onChange={(e) => onChange({ nome: e.target.value })} placeholder="Nome da opção" />
      <input className="input" style={{ flex: "1 1 100px" }} type="number" min={0} value={opcao.preco} onChange={(e) => onChange({ preco: Number(e.target.value) })} />
      <label className="row gap-xs" style={{ fontSize: 12, flexShrink: 0 }}>
        <input type="checkbox" checked={Boolean(opcao.padrao)} onChange={(e) => onChange({ padrao: e.target.checked })} /> Padrão
      </label>
      <label className="row gap-xs" style={{ fontSize: 12, flexShrink: 0 }}>
        <input type="checkbox" checked={Boolean(opcao.remocao)} onChange={(e) => onChange({ remocao: e.target.checked })} /> Remoção
      </label>
      <button type="button" style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", padding: 4, flexShrink: 0 }} onClick={onRemove} aria-label="Remover opção">
        <Trash2 className="sidebar-nav-icon" style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

interface ItemRowProps {
  item: Item;
  grupos: AllowanceGroup[];
  materiais: MaterialCatalogItem[];
  onChange: (patch: Partial<Item>) => void;
  onRemove: () => void;
  onOpcoesChange: (updater: (opcoes: Opcao[]) => Opcao[]) => void;
  onAtribuirGrupo: (groupId: string) => void;
}

function ItemRow({ item, grupos, materiais, onChange, onRemove, onOpcoesChange, onAtribuirGrupo }: ItemRowProps) {
  const [materialParaAnexar, setMaterialParaAnexar] = useState("");

  function anexarOpcaoDaBiblioteca() {
    const material = materiais.find((m) => m.id === materialParaAnexar);
    if (!material) return;
    onOpcoesChange((opcoes) => [
      ...opcoes,
      { id: gerarId("op"), nome: `${material.marca} ${material.modelo}`, preco: material.precoCliente, custoConstrutora: material.custoConstrutora, materialCatalogItemId: material.id },
    ]);
    setMaterialParaAnexar("");
  }

  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: 14, background: "var(--paper)" }}>
      <div className="row gap-sm" style={{ alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap" }}>
        <input className="input" style={{ flex: "1 1 200px" }} value={item.nome} onChange={(e) => onChange({ nome: e.target.value })} placeholder="Nome do item" />
        <NivelBadge nivel={item.nivel} />
        <button type="button" style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", padding: 4 }} onClick={onRemove} aria-label="Remover item">
          <Trash2 className="sidebar-nav-icon" style={{ width: 15, height: 15 }} />
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: 8, marginBottom: 10 }}>
        <div>
          <label className="label">Especificação padrão</label>
          <input className="input" value={item.padrao} onChange={(e) => onChange({ padrao: e.target.value })} placeholder="Porcelanato Standard 60×60" />
        </div>
        <div>
          <label className="label">Preço base / verba (R$)</label>
          <input className="input" type="number" min={0} value={item.valorPadrao} onChange={(e) => onChange({ valorPadrao: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label">Nível de aprovação</label>
          <select className="input" value={item.nivel} onChange={(e) => onChange({ nivel: Number(e.target.value) as NivelAprovacao })}>
            <option value={1}>1 — Simples (automático)</option>
            <option value={2}>2 — Técnico (responsável obrigatório)</option>
            <option value={3}>3 — Proibido (bloqueio imediato)</option>
          </select>
        </div>
        <div>
          <label className="label">Prazo de decisão do cliente</label>
          <input className="input" type="date" value={item.prazo ?? ""} onChange={(e) => onChange({ prazo: e.target.value || null })} />
        </div>
        <div>
          <label className="label">Lead time do material (dias)</label>
          <input className="input" type="number" min={0} value={item.leadTimeDias ?? ""} onChange={(e) => onChange({ leadTimeDias: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="label">Necessário em obra</label>
          <input className="input" type="date" value={item.necessarioEmObra ?? ""} onChange={(e) => onChange({ necessarioEmObra: e.target.value || undefined })} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="label">Grupo de verba compartilhada</label>
          <select className="input" value={item.allowanceGroupId ?? ""} onChange={(e) => onAtribuirGrupo(e.target.value)}>
            <option value="">Nenhum — verba própria do item</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {item.nivel === 3 && (
        <div style={{ marginBottom: 10 }}>
          <label className="label">Motivo do bloqueio</label>
          <input className="input" value={item.motivoBloqueio ?? ""} onChange={(e) => onChange({ motivoBloqueio: e.target.value })} placeholder="Elemento estrutural — alteração proibida por norma..." />
        </div>
      )}

      {item.parametrico ? (
        <div className="grid grid-2" style={{ gap: 8 }}>
          <div>
            <label className="label">Quantidade padrão incluída</label>
            <input className="input" type="number" min={0} value={item.qtdPadrao ?? 0} onChange={(e) => onChange({ qtdPadrao: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Custo por unidade extra (R$)</label>
            <input
              className="input"
              type="number"
              min={0}
              value={item.custoPorUnidade?.total ?? 0}
              onChange={(e) => onChange({ custoPorUnidade: { ...item.custoPorUnidade, total: Number(e.target.value) } })}
            />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Opções</div>
          {item.opcoes.map((opt) => (
            <OpcaoRow
              key={opt.id}
              opcao={opt}
              onChange={(patch) => onOpcoesChange((opcoes) => opcoes.map((o) => (o.id === opt.id ? { ...o, ...patch } : o)))}
              onRemove={() => onOpcoesChange((opcoes) => opcoes.filter((o) => o.id !== opt.id))}
            />
          ))}
          <div className="row gap-sm" style={{ marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn--sm" onClick={() => onOpcoesChange((opcoes) => [...opcoes, { id: gerarId("op"), nome: "Nova opção", preco: 0 }])}>
              <Plus className="sidebar-nav-icon" /> Opção em branco
            </button>
            {materiais.length > 0 && (
              <div className="row gap-xs" style={{ alignItems: "center" }}>
                <select className="input" style={{ width: 200 }} value={materialParaAnexar} onChange={(e) => setMaterialParaAnexar(e.target.value)}>
                  <option value="">Anexar da biblioteca...</option>
                  {materiais.map((m) => (
                    <option key={m.id} value={m.id}>{m.marca} {m.modelo} — {fmtBRL(m.precoCliente)}</option>
                  ))}
                </select>
                <button type="button" className="btn btn--sm" disabled={!materialParaAnexar} onClick={anexarOpcaoDaBiblioteca}>Anexar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface EditorProps {
  empreendimentoId: string;
  construtoraId: string;
}

/** Remounted (via `key`) every time the selected empreendimento changes, so
 * its local edit buffer always starts from that empreendimento's own saved
 * catalog instead of leaking edits across empreendimentos. */
function CatalogoEmpreendimentoEditor({ empreendimentoId, construtoraId }: EditorProps) {
  const { catalogo, catalogoMateriais, salvarCatalogo } = useApp();
  const [ambientes, setAmbientes] = useState<Ambiente[]>(() => catalogo.getAmbientesByEmpreendimentoId(empreendimentoId));
  const [grupos, setGrupos] = useState<AllowanceGroup[]>(() => catalogo.getAllowanceGroupsByEmpreendimentoId(empreendimentoId));
  const [dirty, setDirty] = useState(false);
  const materiais = catalogoMateriais.list(construtoraId);

  function mutarAmbientes(updater: (prev: Ambiente[]) => Ambiente[]) {
    setAmbientes(updater);
    setDirty(true);
  }
  function mutarGrupos(updater: (prev: AllowanceGroup[]) => AllowanceGroup[]) {
    setGrupos(updater);
    setDirty(true);
  }

  function updateAmbiente(ambienteId: string, patch: Partial<Ambiente>) {
    mutarAmbientes((prev) => prev.map((a) => (a.id === ambienteId ? { ...a, ...patch } : a)));
  }
  function addAmbiente() {
    mutarAmbientes((prev) => [...prev, { id: gerarId("amb"), nome: "Novo ambiente", itens: [] }]);
  }
  function removeAmbiente(ambienteId: string) {
    mutarAmbientes((prev) => prev.filter((a) => a.id !== ambienteId));
    mutarGrupos((prev) => prev.filter((g) => g.ambienteId !== ambienteId));
  }

  function updateItem(ambienteId: string, itemId: string, patch: Partial<Item>) {
    mutarAmbientes((prev) => prev.map((a) => (a.id !== ambienteId ? a : { ...a, itens: a.itens.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })));
  }
  function addItem(ambienteId: string) {
    mutarAmbientes((prev) =>
      prev.map((a) =>
        a.id !== ambienteId
          ? a
          : { ...a, itens: [...a.itens, { id: gerarId("item"), nome: "Novo item", nivel: 1, padrao: "", valorPadrao: 0, prazo: null, opcoes: [] }] },
      ),
    );
  }
  function removeItem(ambienteId: string, itemId: string) {
    mutarAmbientes((prev) => prev.map((a) => (a.id !== ambienteId ? a : { ...a, itens: a.itens.filter((i) => i.id !== itemId) })));
    mutarGrupos((prev) => prev.map((g) => ({ ...g, itemIds: g.itemIds.filter((id) => id !== itemId) })));
  }
  function updateItemOpcoes(ambienteId: string, itemId: string, updater: (opcoes: Opcao[]) => Opcao[]) {
    mutarAmbientes((prev) =>
      prev.map((a) => (a.id !== ambienteId ? a : { ...a, itens: a.itens.map((i) => (i.id !== itemId ? i : { ...i, opcoes: updater(i.opcoes) })) })),
    );
  }
  function atribuirGrupo(ambienteId: string, itemId: string, novoGroupId: string) {
    updateItem(ambienteId, itemId, { allowanceGroupId: novoGroupId || undefined });
    mutarGrupos((prev) =>
      prev.map((g) => {
        if (g.id === novoGroupId) return g.itemIds.includes(itemId) ? g : { ...g, itemIds: [...g.itemIds, itemId] };
        return g.itemIds.includes(itemId) ? { ...g, itemIds: g.itemIds.filter((id) => id !== itemId) } : g;
      }),
    );
  }

  function addGrupo(ambienteId: string) {
    mutarGrupos((prev) => [...prev, { id: gerarId("ag"), nome: "Nova verba", ambienteId, valorTotal: 0, itemIds: [] }]);
  }
  function updateGrupo(groupId: string, patch: Partial<AllowanceGroup>) {
    mutarGrupos((prev) => prev.map((g) => (g.id === groupId ? { ...g, ...patch } : g)));
  }
  function removeGrupo(groupId: string) {
    mutarGrupos((prev) => prev.filter((g) => g.id !== groupId));
    mutarAmbientes((prev) => prev.map((a) => ({ ...a, itens: a.itens.map((i) => (i.allowanceGroupId === groupId ? { ...i, allowanceGroupId: undefined } : i)) })));
  }

  function handleSalvar() {
    salvarCatalogo(empreendimentoId, ambientes, grupos);
    setDirty(false);
  }

  return (
    <div className="stack gap-lg">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Ambientes e itens</div>
        <div className="row gap-sm" style={{ alignItems: "center" }}>
          {dirty && <span style={{ fontSize: 12, color: "var(--amber-ink)" }}>Alterações não salvas</span>}
          <button type="button" className="btn btn--primary btn--sm" onClick={handleSalvar}>Salvar catálogo</button>
        </div>
      </div>

      <div className="stack gap-lg">
        {ambientes.map((amb) => {
          const gruposDoAmbiente = grupos.filter((g) => g.ambienteId === amb.id);
          return (
            <div key={amb.id} className="card">
              <div className="row gap-sm" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <input className="input" style={{ maxWidth: 260, fontWeight: 700 }} value={amb.nome} onChange={(e) => updateAmbiente(amb.id, { nome: e.target.value })} />
                <button type="button" className="btn btn--sm" onClick={() => removeAmbiente(amb.id)}>
                  <Trash2 className="sidebar-nav-icon" style={{ width: 14, height: 14 }} /> Remover ambiente
                </button>
              </div>

              <div className="stack gap-sm" style={{ marginBottom: 14 }}>
                {amb.itens.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    grupos={gruposDoAmbiente}
                    materiais={materiais}
                    onChange={(patch) => updateItem(amb.id, item.id, patch)}
                    onRemove={() => removeItem(amb.id, item.id)}
                    onOpcoesChange={(updater) => updateItemOpcoes(amb.id, item.id, updater)}
                    onAtribuirGrupo={(groupId) => atribuirGrupo(amb.id, item.id, groupId)}
                  />
                ))}
              </div>

              <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
                <button type="button" className="btn btn--sm" onClick={() => addItem(amb.id)}>
                  <Plus className="sidebar-nav-icon" /> Item
                </button>
                <button type="button" className="btn btn--sm" onClick={() => addGrupo(amb.id)}>
                  <Plus className="sidebar-nav-icon" /> Verba compartilhada neste ambiente
                </button>
              </div>

              {gruposDoAmbiente.length > 0 && (
                <div className="stack gap-sm" style={{ marginTop: 14 }}>
                  {gruposDoAmbiente.map((g) => (
                    <div key={g.id} className="row gap-sm" style={{ alignItems: "center", border: "1px dashed var(--rule-strong)", borderRadius: 8, padding: 10, flexWrap: "wrap" }}>
                      <input className="input" style={{ flex: "1 1 160px" }} value={g.nome} onChange={(e) => updateGrupo(g.id, { nome: e.target.value })} />
                      <input className="input" style={{ flex: "0 1 140px" }} type="number" min={0} value={g.valorTotal} onChange={(e) => updateGrupo(g.id, { valorTotal: Number(e.target.value) })} />
                      <span className="text-soft" style={{ fontSize: 12 }}>{g.itemIds.length} item(ns) vinculado(s) — atribua pelo campo "Grupo de verba" em cada item</span>
                      <button type="button" style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer" }} onClick={() => removeGrupo(g.id)} aria-label="Remover verba">
                        <Trash2 className="sidebar-nav-icon" style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className="btn" style={{ alignSelf: "flex-start" }} onClick={addAmbiente}>
        <Plus className="sidebar-nav-icon" /> Novo ambiente
      </button>
    </div>
  );
}

/**
 * Autoria de catálogo — a tela que faltava para a construtora efetivamente
 * "montar o catálogo e as regras" (ver design.md / benchmark). Edita
 * ambientes/itens/opções/verbas de um empreendimento por vez (o editor
 * remonta do zero ao trocar de empreendimento — ver `key` abaixo — pra
 * nunca vazar edição de um catálogo pro outro).
 */
export function CatalogoPage() {
  const { vinculos, catalogo } = useApp();

  const construtoras = [...new Map(vinculos.map((v) => [v.construtoraId, v.construtoraNome])).entries()];
  const [construtoraId, setConstrutoraId] = useState(construtoras[0]?.[0] ?? "");
  const empreendimentos = catalogo.listEmpreendimentosByConstrutora(construtoraId);
  const [empreendimentoIdSelecionado, setEmpreendimentoIdSelecionado] = useState("");
  const empreendimentoId = empreendimentos.some((e) => e.empreendimentoId === empreendimentoIdSelecionado)
    ? empreendimentoIdSelecionado
    : (empreendimentos[0]?.empreendimentoId ?? "");

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Catálogo" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Catálogo</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        O que o cliente vê no portal de personalização vem daqui — ambientes, itens, opções, preços e verbas de cada empreendimento, além da biblioteca de materiais reutilizável.
      </p>

      <div className="row gap-sm" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 220 }}>
          <label className="label">Construtora</label>
          <select className="input" value={construtoraId} onChange={(e) => { setConstrutoraId(e.target.value); setEmpreendimentoIdSelecionado(""); }}>
            {construtoras.map(([id, nome]) => (
              <option key={id} value={id}>{nome}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 220 }}>
          <label className="label">Empreendimento</label>
          <select className="input" value={empreendimentoId} onChange={(e) => setEmpreendimentoIdSelecionado(e.target.value)}>
            {empreendimentos.map((e) => (
              <option key={e.empreendimentoId} value={e.empreendimentoId}>{e.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stack gap-lg">
        <BibliotecaMateriais construtoraId={construtoraId} />
        {empreendimentoId && <CatalogoEmpreendimentoEditor key={empreendimentoId} empreendimentoId={empreendimentoId} construtoraId={construtoraId} />}
      </div>
    </div>
  );
}
