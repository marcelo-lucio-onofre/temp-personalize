import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import type { ArquivoCadastro, CategoriaArquivo } from "../domain/types";
import { useApp } from "../state/AppContext";

interface CategoriaMeta {
  key: CategoriaArquivo;
  label: string;
  accept: string;
  hint: string;
}

const META: CategoriaMeta[] = [
  { key: "imagens", label: "Imagens", accept: "image/*", hint: "Fachada, perspectivas e fotos da obra." },
  { key: "dwg", label: "Arquivos DWG", accept: ".dwg,.dxf", hint: "Plantas técnicas em formato CAD para importar cotas." },
  { key: "plantas", label: "Plantas em PDF", accept: ".pdf", hint: "Plantas baixas e cortes para conferência visual." },
  { key: "memorial", label: "Memorial descritivo", accept: ".pdf,.doc,.docx", hint: "Especificação de acabamentos e materiais padrão." },
];

function fmtSize(bytes: number): string {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

export function CadastroPage() {
  const { cadastrarEmpreendimento } = useApp();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [torres, setTorres] = useState("");
  const [unidades, setUnidades] = useState("");
  const [prazo, setPrazo] = useState("");
  const [files, setFiles] = useState<Record<CategoriaArquivo, ArquivoCadastro[]>>({
    imagens: [],
    dwg: [],
    plantas: [],
    memorial: [],
  });
  const [submitted, setSubmitted] = useState(false);

  function addFiles(key: CategoriaArquivo, list: FileList | null) {
    if (!list?.length) return;
    const incoming: ArquivoCadastro[] = Array.from(list).map((f) => ({ id: `${key}-${Date.now()}-${f.name}`, name: f.name, size: f.size }));
    setFiles((prev) => ({ ...prev, [key]: [...prev[key], ...incoming] }));
  }

  function removeFile(key: CategoriaArquivo, id: string) {
    setFiles((prev) => ({ ...prev, [key]: prev[key].filter((f) => f.id !== id) }));
  }

  const filled = nome.trim() && construtora.trim() && torres && unidades && prazo;
  const uploaded = META.every((m) => files[m.key].length > 0);
  const complete = Boolean(filled && uploaded);
  const doneCount = META.filter((m) => files[m.key].length > 0).length;
  const totalFiles = META.reduce((n, m) => n + files[m.key].length, 0);

  function handleSubmit() {
    if (!complete) return;
    cadastrarEmpreendimento({
      nome,
      construtora,
      torres: Number(torres),
      unidades: Number(unidades),
      prazo,
      arquivos: files,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="container container--narrow text-center" style={{ paddingTop: 64 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--green-bg)",
            color: "var(--green-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            margin: "0 auto 20px",
          }}
        >
          ✓
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10 }}>Empreendimento cadastrado</h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 26, maxWidth: "46ch", marginInline: "auto", lineHeight: 1.5 }}>
          {nome} foi criado com {totalFiles} arquivos — imagens, DWG, plantas e memorial descritivo já disponíveis para montar o catálogo de personalização.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => navigate("/painel")}>
          Ir para o painel
        </button>
      </div>
    );
  }

  return (
    <div className="container container--narrow">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Cadastro" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Cadastrar empreendimento</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "60ch", lineHeight: 1.5 }}>
        Imagens, DWG, plantas e memorial descritivo são obrigatórios — é isso que alimenta o catálogo de personalização que o cliente vê no portal.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Dados do empreendimento</div>
        <div className="grid grid-2">
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Nome do empreendimento *</label>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Residencial Aurora" />
          </div>
          <div>
            <label className="label">Construtora *</label>
            <input className="input" value={construtora} onChange={(e) => setConstrutora(e.target.value)} placeholder="Prado Engenharia" />
          </div>
          <div>
            <label className="label">Prazo de personalização *</label>
            <input className="input" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </div>
          <div>
            <label className="label">Nº de torres *</label>
            <input className="input" type="number" min={1} value={torres} onChange={(e) => setTorres(e.target.value)} placeholder="2" />
          </div>
          <div>
            <label className="label">Nº de unidades *</label>
            <input className="input" type="number" min={1} value={unidades} onChange={(e) => setUnidades(e.target.value)} placeholder="300" />
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Arquivos do empreendimento</div>
        <div className="mono text-soft" style={{ fontSize: 11 }}>{doneCount} de 4 categorias enviadas</div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {META.map((cat) => {
          const list = files[cat.key];
          const has = list.length > 0;
          return (
            <div
              key={cat.key}
              style={{
                border: `2px dashed ${has ? "var(--green)" : "var(--rule-strong)"}`,
                borderRadius: 10,
                padding: 16,
                background: has ? "var(--green-bg)" : "var(--paper)",
              }}
            >
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {cat.label} <span style={{ color: "var(--red-ink)" }}>*</span>
                </div>
                <span className={has ? "badge badge--simples" : "badge badge--bloqueado"}>
                  {has ? `✓ ${list.length} arquivo${list.length > 1 ? "s" : ""}` : "Obrigatório"}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 10, lineHeight: 1.4 }}>{cat.hint}</div>
              <input type="file" multiple accept={cat.accept} onChange={(e) => addFiles(cat.key, e.target.files)} style={{ fontSize: 12, maxWidth: "100%" }} />
              {has && (
                <div className="stack gap-xs" style={{ marginTop: 10 }}>
                  {list.map((chip) => (
                    <div key={chip.id} className="row" style={{ justifyContent: "space-between", background: "#fff", border: "1px solid var(--rule)", borderRadius: 6, padding: "6px 9px", fontSize: 11.5, gap: 8 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chip.name}</span>
                      <span className="row gap-sm" style={{ flexShrink: 0 }}>
                        <span className="mono text-soft">{fmtSize(chip.size)}</span>
                        <button
                          type="button"
                          style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", fontWeight: 700, fontSize: 14, padding: 0 }}
                          onClick={() => removeFile(cat.key, chip.id)}
                          aria-label={`Remover ${chip.name}`}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="row" style={{ justifyContent: "space-between", gap: 16 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", maxWidth: "44ch" }}>
          {complete ? "Tudo certo — pode cadastrar o empreendimento." : "Preencha os dados e envie ao menos um arquivo em cada categoria obrigatória."}
        </div>
        <button type="button" className="btn btn--primary" disabled={!complete} onClick={handleSubmit}>
          Cadastrar empreendimento
        </button>
      </div>
    </div>
  );
}
