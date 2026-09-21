import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, FileStack, CheckCircle2, Layers, Lock, Package } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { CatalogoPlantaEditor, PlantasManager } from "../components/CatalogoAuthoring";
import { useApp } from "../state/AppContext";
import type { ArquivoCadastro, CategoriaArquivo } from "../domain/types";

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

const STEPS = [
  { label: "Empreendimento", icon: Building2 },
  { label: "Plantas e unidades", icon: Layers },
  { label: "Catálogo", icon: Package },
  { label: "Arquivos", icon: FileStack },
  { label: "Revisão", icon: CheckCircle2 },
];

function fmtSize(bytes: number): string {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

/**
 * Cadastro de empreendimento — segue a hierarquia completa (ver design.md):
 * Empreendimento → Unidade (Plantas, e quais números de unidade seguem
 * cada uma) → Ambiente → Item → Especificação → Quantidade → Custo →
 * Opções (essas cinco últimas são o passo "Catálogo", reaproveitando o
 * mesmo editor de CatalogoPage — não uma cópia paralela).
 *
 * O empreendimento é criado logo após o passo 1 (dados básicos) — não só
 * no fim — porque os passos de Plantas/Catálogo precisam de um
 * empreendimentoId real pra gravar contra. Os passos seguintes salvam ao
 * vivo no repositório (mesmo padrão de CatalogoPage); "Confirmar cadastro"
 * no fim só anexa os arquivos, que é a única coisa ainda pendente.
 */
export function CadastroPage() {
  const { vinculos, construtoraLogadaId, cadastrarEmpreendimento, atualizarArquivosCadastro, catalogo } = useApp();
  const navigate = useNavigate();

  const construtoraNome = vinculos.find((v) => v.construtoraId === construtoraLogadaId)?.construtoraNome ?? "Construtora";

  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [torres, setTorres] = useState("");
  const [unidades, setUnidades] = useState("");
  const [prazo, setPrazo] = useState("");
  const [empreendimentoIdCriado, setEmpreendimentoIdCriado] = useState<string | null>(null);
  const [plantaSelecionadaId, setPlantaSelecionadaId] = useState("");
  const [files, setFiles] = useState<Record<CategoriaArquivo, ArquivoCadastro[]>>({
    imagens: [],
    dwg: [],
    plantas: [],
    memorial: [],
  });
  const [finalizado, setFinalizado] = useState(false);

  function addFiles(key: CategoriaArquivo, list: FileList | null) {
    if (!list?.length) return;
    const incoming: ArquivoCadastro[] = Array.from(list).map((f) => ({ id: `${key}-${Date.now()}-${f.name}`, name: f.name, size: f.size }));
    setFiles((prev) => ({ ...prev, [key]: [...prev[key], ...incoming] }));
  }

  function removeFile(key: CategoriaArquivo, id: string) {
    setFiles((prev) => ({ ...prev, [key]: prev[key].filter((f) => f.id !== id) }));
  }

  const dadosPreenchidos = Boolean(nome.trim() && torres && unidades && prazo);
  const uploaded = META.every((m) => files[m.key].length > 0);
  const doneCount = META.filter((m) => files[m.key].length > 0).length;
  const totalFiles = META.reduce((n, m) => n + files[m.key].length, 0);
  const plantas = empreendimentoIdCriado ? catalogo.listPlantas(empreendimentoIdCriado) : [];
  const plantaId = plantas.some((p) => p.id === plantaSelecionadaId) ? plantaSelecionadaId : (plantas[0]?.id ?? "");

  function irPara(i: number) {
    if (i < step) setStep(i);
  }

  function handleContinuarDados() {
    if (!construtoraLogadaId || !dadosPreenchidos) return;
    if (!empreendimentoIdCriado) {
      const created = cadastrarEmpreendimento({
        nome,
        construtoraId: construtoraLogadaId,
        construtora: construtoraNome,
        torres: Number(torres),
        unidades: Number(unidades),
        prazo,
        arquivos: files,
      });
      setEmpreendimentoIdCriado(created.id);
    }
    setStep(1);
  }

  function handleConfirmar() {
    if (!empreendimentoIdCriado) return;
    atualizarArquivosCadastro(empreendimentoIdCriado, files);
    setFinalizado(true);
  }

  if (finalizado) {
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
          {nome} foi criado com {plantas.length} planta{plantas.length === 1 ? "" : "s"} e {totalFiles} arquivos para {construtoraNome}.
        </p>
        <div className="row gap-sm" style={{ justifyContent: "center" }}>
          <Link to="/catalogo" className="btn btn--primary">Ir para o catálogo</Link>
          <button type="button" className="btn" onClick={() => navigate("/painel")}>Ir para o painel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Cadastro" }]} />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Cadastrar empreendimento</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        Empreendimento → plantas e unidades → catálogo (ambientes, itens, especificações e opções) → arquivos — em {construtoraNome}.
      </p>

      <div className="row gap-sm" style={{ marginBottom: 28, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => irPara(i)}
              disabled={i > step}
              className="row gap-xs"
              style={{
                border: "none",
                background: "none",
                cursor: i < step ? "pointer" : "default",
                padding: "4px 8px 4px 0",
                opacity: i > step ? 0.4 : 1,
                fontSize: 12.5,
                fontWeight: current ? 700 : 600,
                color: current ? "var(--brand)" : done ? "var(--ink)" : "var(--ink-soft)",
              }}
            >
              <s.icon className="sidebar-nav-icon" />
              {i + 1}. {s.label}
              {i < STEPS.length - 1 && <span style={{ color: "var(--rule-strong)", marginLeft: 6 }}>›</span>}
            </button>
          );
        })}
      </div>

      {step === 0 && (
        <div className="container--narrow stack gap-lg" style={{ padding: 0 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Dados do empreendimento</div>
            <div className="grid grid-2">
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Construtora</label>
                <div
                  className="row gap-sm"
                  style={{ alignItems: "center", padding: "10px 12px", border: "1px solid var(--rule)", borderRadius: 8, background: "var(--paper)", color: "var(--ink-soft)" }}
                >
                  <Lock className="sidebar-nav-icon" style={{ width: 14, height: 14 }} />
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>{construtoraNome}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>
                  Definida pelo login — o empreendimento é sempre cadastrado na construtora logada.
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Nome do empreendimento *</label>
                <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Residencial Aurora" disabled={Boolean(empreendimentoIdCriado)} />
              </div>
              <div>
                <label className="label">Prazo de personalização *</label>
                <input className="input" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} disabled={Boolean(empreendimentoIdCriado)} />
              </div>
              <div>
                <label className="label">Nº de torres *</label>
                <input className="input" type="number" min={1} value={torres} onChange={(e) => setTorres(e.target.value)} placeholder="2" disabled={Boolean(empreendimentoIdCriado)} />
              </div>
              <div>
                <label className="label">Nº de unidades *</label>
                <input className="input" type="number" min={1} value={unidades} onChange={(e) => setUnidades(e.target.value)} placeholder="300" disabled={Boolean(empreendimentoIdCriado)} />
              </div>
            </div>
            {empreendimentoIdCriado && (
              <div style={{ fontSize: 12, color: "var(--green-ink)", marginTop: 12 }}>
                ✓ Empreendimento criado — dados básicos ficam travados a partir daqui; o resto ainda pode ser ajustado no Catálogo depois.
              </div>
            )}
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn--primary" disabled={!dadosPreenchidos} onClick={handleContinuarDados}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 1 && empreendimentoIdCriado && (
        <div className="stack gap-lg">
          <PlantasManager empreendimentoId={empreendimentoIdCriado} plantaSelecionadaId={plantaId} onSelecionar={setPlantaSelecionadaId} />
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn" onClick={() => setStep(0)}>Voltar</button>
            <button type="button" className="btn btn--primary" disabled={plantas.length === 0} onClick={() => setStep(2)}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 2 && empreendimentoIdCriado && (
        <div className="stack gap-lg">
          {plantas.length > 1 && (
            <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
              {plantas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn btn--sm"
                  style={p.id === plantaId ? { background: "var(--green-bg)", borderColor: "var(--green)", color: "var(--green-ink)" } : {}}
                  onClick={() => setPlantaSelecionadaId(p.id)}
                >
                  {p.nome}
                </button>
              ))}
            </div>
          )}
          {plantaId && (
            <CatalogoPlantaEditor key={plantaId} empreendimentoId={empreendimentoIdCriado} plantaId={plantaId} construtoraId={construtoraLogadaId ?? ""} />
          )}
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn" onClick={() => setStep(1)}>Voltar</button>
            <button type="button" className="btn btn--primary" onClick={() => setStep(3)}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="container--narrow stack gap-lg" style={{ padding: 0 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Arquivos do empreendimento</div>
            <div className="mono text-soft" style={{ fontSize: 11 }}>{doneCount} de 4 categorias enviadas</div>
          </div>
          <div className="grid grid-2">
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
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn" onClick={() => setStep(2)}>Voltar</button>
            <button type="button" className="btn btn--primary" disabled={!uploaded} onClick={() => setStep(4)}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="container--narrow stack gap-lg" style={{ padding: 0 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", marginBottom: 10 }}>Resumo</div>
            <div className="stack gap-sm">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="text-soft" style={{ fontSize: 13 }}>Construtora</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{construtoraNome}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="text-soft" style={{ fontSize: 13 }}>Empreendimento</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{nome}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="text-soft" style={{ fontSize: 13 }}>Prazo de personalização</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{prazo}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="text-soft" style={{ fontSize: 13 }}>Torres / Unidades</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{torres} / {unidades}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="text-soft" style={{ fontSize: 13 }}>Plantas cadastradas</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{plantas.length}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="text-soft" style={{ fontSize: 13 }}>Arquivos enviados</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{totalFiles} ({doneCount} de 4 categorias)</span>
              </div>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn" onClick={() => setStep(3)}>Voltar</button>
            <button type="button" className="btn btn--primary" onClick={handleConfirmar}>
              Confirmar cadastro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
