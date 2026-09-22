import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { FormField } from "../components/FormField";
import { useToast } from "../components/Toast";
import { UploadCompactRow } from "../components/CatalogoAuthoring";
import { useApp } from "../state/AppContext";
import { email as emailValidator, required } from "../domain/validation";
import type { CategoriaArquivoPessoa, Pessoa, StatusRegistroProfissional, TipoPapel } from "../domain/types";

const PAPEIS: TipoPapel[] = ["Arquiteto", "Engenheiro", "Técnico", "Designer", "Projetista", "Consultor", "Cliente", "Responsável pela construtora", "Outro"];
const STATUS_REGISTRO: StatusRegistroProfissional[] = ["Ativo", "Inativo"];

const META_ARQUIVOS: { key: CategoriaArquivoPessoa; label: string; accept: string }[] = [
  { key: "documentoProfissional", label: "Documento profissional", accept: ".pdf,image/*" },
  { key: "carteiraRegistro", label: "Carteira / registro", accept: ".pdf,image/*" },
  { key: "certificados", label: "Certificados", accept: ".pdf" },
  { key: "artRrt", label: "ART / RRT", accept: ".pdf" },
  { key: "contratos", label: "Contratos", accept: ".pdf,.doc,.docx" },
  { key: "projetosDocumentosTecnicos", label: "Projetos / documentos técnicos", accept: ".pdf,.dwg,.dxf" },
];

const ARQUIVOS_VAZIOS: Pessoa["arquivos"] = {
  documentoProfissional: [], carteiraRegistro: [], certificados: [], artRrt: [], contratos: [], projetosDocumentosTecnicos: [],
};

type Draft = Omit<Pessoa, "id" | "construtoraId">;
type Errors = Partial<Record<"nome" | "email" | "papeis", string>>;

const VAZIO: Draft = {
  papeis: [], nome: "", cpf: "", email: "", telefone: "", empresa: "", cargoEspecialidade: "",
  conselho: "", numeroRegistro: "", ufRegistro: "", statusRegistro: "Ativo",
  endereco: "", estadoCivil: "", canalContatoPreferencial: "", observacoes: "", arquivos: ARQUIVOS_VAZIOS,
};

export function PessoaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { construtoraLogadaId, pessoasRepo, criarPessoa, atualizarPessoa } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const existente = id ? pessoasRepo.list(construtoraId).find((p) => p.id === id) : undefined;

  const [draft, setDraft] = useState<Draft>(existente ? { ...existente } : VAZIO);
  const [errors, setErrors] = useState<Errors>({});

  if (id && !existente) {
    return (
      <div className="container">
        <PageHeader breadcrumb={[{ label: "Painel", to: "/painel" }, { label: "Pessoas", to: "/pessoas" }, { label: "Não encontrada" }]} title="Pessoa não encontrada" />
      </div>
    );
  }

  function togglePapel(papel: TipoPapel) {
    setDraft((d) => ({ ...d, papeis: d.papeis.includes(papel) ? d.papeis.filter((x) => x !== papel) : [...d.papeis, papel] }));
    setErrors((e) => ({ ...e, papeis: undefined }));
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function validarTudo(): boolean {
    const next: Errors = {
      nome: required("Nome é obrigatório")(draft.nome),
      email: emailValidator()(draft.email),
      papeis: draft.papeis.length === 0 ? "Selecione pelo menos um papel" : undefined,
    };
    Object.keys(next).forEach((k) => next[k as keyof Errors] === undefined && delete next[k as keyof Errors]);
    setErrors(next);
    if (next.papeis) document.getElementById("pessoa-papeis")?.scrollIntoView({ block: "center" });
    else if (next.nome) document.getElementById("pessoa-nome")?.focus();
    else if (next.email) document.getElementById("pessoa-email")?.focus();
    return Object.keys(next).length === 0;
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!validarTudo()) return;
    if (existente) {
      atualizarPessoa(existente.id, draft);
      toast.success("Pessoa atualizada.");
    } else {
      criarPessoa({ construtoraId, ...draft });
      toast.success("Pessoa criada.");
    }
    navigate("/pessoas");
  }

  return (
    <div className="container container--narrow">
      <PageHeader
        breadcrumb={[
          { label: "Painel", to: "/painel" },
          { label: "Pessoas", to: "/pessoas" },
          { label: existente ? existente.nome || "Editar" : "Nova pessoa" },
        ]}
        backTo="/pessoas"
        title={existente ? "Editar pessoa" : "Nova pessoa"}
      />

      <form onSubmit={salvar}>
        <div className="card" style={{ marginBottom: 16 }} id="pessoa-papeis">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>Papel(éis)</div>
          </div>
          <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
            {PAPEIS.map((papel) => (
              <label key={papel} className="row gap-xs" style={{ fontSize: 12.5, alignItems: "center", border: "1px solid var(--rule)", borderRadius: 6, padding: "4px 8px" }}>
                <input type="checkbox" checked={draft.papeis.includes(papel)} onChange={() => togglePapel(papel)} /> {papel}
              </label>
            ))}
          </div>
          {errors.papeis && <div className="field-error">{errors.papeis}</div>}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 12 }}>Dados essenciais</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <FormField label="Nome" htmlFor="pessoa-nome" required error={errors.nome}>
              <input
                id="pessoa-nome"
                className={errors.nome ? "input input--invalid" : "input"}
                value={draft.nome}
                placeholder="Nome completo"
                onChange={(e) => { set("nome", e.target.value); setErrors((er) => ({ ...er, nome: undefined })); }}
                onBlur={() => setErrors((er) => ({ ...er, nome: required("Nome é obrigatório")(draft.nome) }))}
              />
            </FormField>
            <FormField label="CPF" htmlFor="pessoa-cpf">
              <input id="pessoa-cpf" className="input" value={draft.cpf} placeholder="000.000.000-00" onChange={(e) => set("cpf", e.target.value)} />
            </FormField>
            <FormField label="E-mail" htmlFor="pessoa-email" error={errors.email}>
              <input
                id="pessoa-email"
                type="email"
                className={errors.email ? "input input--invalid" : "input"}
                value={draft.email}
                placeholder="nome@email.com"
                onChange={(e) => { set("email", e.target.value); setErrors((er) => ({ ...er, email: undefined })); }}
                onBlur={() => setErrors((er) => ({ ...er, email: emailValidator()(draft.email) }))}
              />
            </FormField>
            <FormField label="Telefone / WhatsApp" htmlFor="pessoa-telefone">
              <input id="pessoa-telefone" className="input" value={draft.telefone} placeholder="(11) 90000-0000" onChange={(e) => set("telefone", e.target.value)} />
            </FormField>
            <FormField label="Empresa" htmlFor="pessoa-empresa">
              <input id="pessoa-empresa" className="input" value={draft.empresa} placeholder="Empresa/escritório" onChange={(e) => set("empresa", e.target.value)} />
            </FormField>
            <FormField label="Cargo / especialidade" htmlFor="pessoa-cargo">
              <input id="pessoa-cargo" className="input" value={draft.cargoEspecialidade} placeholder="Arquiteta responsável" onChange={(e) => set("cargoEspecialidade", e.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 12 }}>Registro profissional</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <FormField label="Conselho" htmlFor="pessoa-conselho">
              <input id="pessoa-conselho" className="input" value={draft.conselho} placeholder="CAU, CREA, CFT..." onChange={(e) => set("conselho", e.target.value)} />
            </FormField>
            <FormField label="Número do registro" htmlFor="pessoa-numeroRegistro">
              <input id="pessoa-numeroRegistro" className="input" value={draft.numeroRegistro} onChange={(e) => set("numeroRegistro", e.target.value)} />
            </FormField>
            <FormField label="UF" htmlFor="pessoa-ufRegistro">
              <input id="pessoa-ufRegistro" className="input" value={draft.ufRegistro} maxLength={2} placeholder="SP" onChange={(e) => set("ufRegistro", e.target.value.toUpperCase())} />
            </FormField>
            <FormField label="Status" htmlFor="pessoa-statusRegistro">
              <select id="pessoa-statusRegistro" className="input" value={draft.statusRegistro} onChange={(e) => set("statusRegistro", e.target.value as StatusRegistroProfissional)}>
                {STATUS_REGISTRO.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 12 }}>Contato / cliente</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <FormField label="Endereço" htmlFor="pessoa-endereco">
                <input id="pessoa-endereco" className="input" value={draft.endereco} placeholder="Rua, número, cidade/UF" onChange={(e) => set("endereco", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Estado civil" htmlFor="pessoa-estadoCivil">
              <input id="pessoa-estadoCivil" className="input" value={draft.estadoCivil} placeholder="Se necessário contratualmente" onChange={(e) => set("estadoCivil", e.target.value)} />
            </FormField>
            <FormField label="Canal de contato preferencial" htmlFor="pessoa-canal">
              <input id="pessoa-canal" className="input" value={draft.canalContatoPreferencial} placeholder="WhatsApp, e-mail, telefone..." onChange={(e) => set("canalContatoPreferencial", e.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <FormField label="Observações" htmlFor="pessoa-observacoes">
            <textarea id="pessoa-observacoes" className="input" rows={2} style={{ resize: "vertical", fontFamily: "inherit" }} value={draft.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </FormField>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Uploads</div>
          {META_ARQUIVOS.map((m) => (
            <UploadCompactRow
              key={m.key}
              label={m.label}
              accept={m.accept}
              arquivos={draft.arquivos[m.key]}
              onAdd={(list) => {
                if (!list?.length) return;
                const incoming = Array.from(list).map((f) => ({ id: `${m.key}-${Date.now()}-${f.name}`, name: f.name, size: f.size }));
                setDraft((d) => ({ ...d, arquivos: { ...d.arquivos, [m.key]: [...d.arquivos[m.key], ...incoming] } }));
              }}
              onClear={() => setDraft((d) => ({ ...d, arquivos: { ...d.arquivos, [m.key]: [] } }))}
            />
          ))}
        </div>

        <div className="row gap-sm" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={() => navigate("/pessoas")}>Cancelar</button>
          <button type="submit" className="btn btn--primary">Salvar pessoa</button>
        </div>
      </form>
    </div>
  );
}
