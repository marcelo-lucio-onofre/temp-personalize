import { useState } from "react";
import { Breadcrumb } from "../components/Breadcrumb";
import { CatalogoPlantaEditor } from "../components/CatalogoAuthoring";
import { useApp } from "../state/AppContext";

/**
 * Autoria de catálogo — Ambientes e itens de cada planta. Materiais,
 * Categorias, Marcas e Fornecedores viraram cadastros próprios (sub-níveis
 * de menu em /catalogo/materiais, /categorias, /marcas, /fornecedores),
 * não moram mais nesta home. Um empreendimento raramente tem uma planta só
 * (dezenas/centenas/milhares de unidades com layouts diferentes convivem
 * no mesmo prédio), então a seleção é Empreendimento → Planta antes de
 * editar ambientes/itens — cada planta tem seu próprio catálogo,
 * independente das outras.
 */
export function CatalogoPage() {
  const { vinculos, catalogo, construtoraLogadaId } = useApp();

  const construtoraId = construtoraLogadaId ?? "";
  const construtoraNome = vinculos.find((v) => v.construtoraId === construtoraId)?.construtoraNome ?? "Construtora";
  const empreendimentos = catalogo.listEmpreendimentosByConstrutora(construtoraId);
  const [empreendimentoIdSelecionado, setEmpreendimentoIdSelecionado] = useState("");
  const empreendimentoId = empreendimentos.some((e) => e.empreendimentoId === empreendimentoIdSelecionado)
    ? empreendimentoIdSelecionado
    : (empreendimentos[0]?.empreendimentoId ?? "");

  const plantas = empreendimentoId ? catalogo.listPlantas(empreendimentoId) : [];
  const [plantaIdSelecionada, setPlantaIdSelecionada] = useState("");
  const plantaId = plantas.some((p) => p.id === plantaIdSelecionada) ? plantaIdSelecionada : (plantas[0]?.id ?? "");

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Catálogo" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Catálogo — {construtoraNome}</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        O que o cliente vê no portal de personalização vem daqui — ambientes, itens, opções, preços e verbas de cada planta.
      </p>

      <div className="row gap-sm" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 220 }}>
          <label className="label">Empreendimento</label>
          <select
            className="input"
            value={empreendimentoId}
            onChange={(e) => { setEmpreendimentoIdSelecionado(e.target.value); setPlantaIdSelecionada(""); }}
          >
            {empreendimentos.map((e) => (
              <option key={e.empreendimentoId} value={e.empreendimentoId}>{e.nome}</option>
            ))}
          </select>
        </div>
        {plantas.length > 0 && (
          <div style={{ minWidth: 220 }}>
            <label className="label">Planta</label>
            <select className="input" value={plantaId} onChange={(e) => setPlantaIdSelecionada(e.target.value)}>
              {plantas.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="stack gap-lg">
        {empreendimentoId && plantas.length === 0 && (
          <div className="card text-soft" style={{ fontSize: 13 }}>
            Este empreendimento ainda não tem planta cadastrada — cadastre em "Cadastro" antes de montar o catálogo.
          </div>
        )}
        {empreendimentoId && plantaId && (
          <CatalogoPlantaEditor key={`${empreendimentoId}:${plantaId}`} empreendimentoId={empreendimentoId} plantaId={plantaId} construtoraId={construtoraId} />
        )}
      </div>
    </div>
  );
}
