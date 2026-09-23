import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { FormField } from "../components/FormField";
import { useToast } from "../components/Toast";
import { useApp } from "../state/AppContext";
import { email as emailValidator, required, uf as ufValidator } from "../domain/validation";
import type { Fornecedor } from "../domain/types";

type Draft = Omit<Fornecedor, "id" | "construtoraId">;
type Errors = Partial<Record<keyof Draft, string>>;

const VAZIO: Draft = {
  razaoSocial: "", nomeFantasia: "", cnpjCpf: "", responsavel: "", telefone: "", whatsapp: "", email: "", cep: "", endereco: "", cidade: "", uf: "",
};

const VALIDATORS: Partial<Record<keyof Draft, (v: string) => string | undefined>> = {
  razaoSocial: required("Razão social é obrigatória"),
  email: emailValidator(),
  uf: ufValidator(),
};

export function FornecedorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { construtoraLogadaId, catalogoFornecedores, criarFornecedor, atualizarFornecedor } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const existente = id ? catalogoFornecedores.list(construtoraId).find((f) => f.id === id) : undefined;

  const [draft, setDraft] = useState<Draft>(existente ? { ...existente } : VAZIO);
  const [errors, setErrors] = useState<Errors>({});

  if (id && !existente) {
    return (
      <div className="container">
        <PageHeader breadcrumb={[{ label: "Painel", to: "/painel" }, { label: "Cadastros auxiliares" }, { label: "Fornecedores", to: "/catalogo/fornecedores" }, { label: "Não encontrado" }]} title="Fornecedor não encontrado" />
      </div>
    );
  }

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function blurField(key: keyof Draft) {
    const validator = VALIDATORS[key];
    if (!validator) return;
    setErrors((e) => ({ ...e, [key]: validator(draft[key] as string) }));
  }

  function validarTudo(): boolean {
    const next: Errors = {};
    for (const key of Object.keys(VALIDATORS) as (keyof Draft)[]) {
      const err = VALIDATORS[key]!(draft[key] as string);
      if (err) next[key] = err;
    }
    setErrors(next);
    const firstKey = Object.keys(next)[0];
    if (firstKey) document.getElementById(`forn-${firstKey}`)?.focus();
    return Object.keys(next).length === 0;
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!validarTudo()) return;
    if (existente) {
      atualizarFornecedor(existente.id, draft);
      toast.success("Fornecedor atualizado.");
    } else {
      criarFornecedor({ construtoraId, ...draft });
      toast.success("Fornecedor criado.");
    }
    navigate("/catalogo/fornecedores");
  }

  return (
    <div className="container container--narrow">
      <PageHeader
        breadcrumb={[
          { label: "Painel", to: "/painel" },
          { label: "Cadastros auxiliares" },
          { label: "Fornecedores", to: "/catalogo/fornecedores" },
          { label: existente ? existente.razaoSocial || "Editar" : "Novo fornecedor" },
        ]}
        backTo="/catalogo/fornecedores"
        title={existente ? "Editar fornecedor" : "Novo fornecedor"}
      />

      <form onSubmit={salvar}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 12 }}>Identificação</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <FormField label="Razão social" htmlFor="forn-razaoSocial" required error={errors.razaoSocial}>
              <input
                id="forn-razaoSocial"
                className={errors.razaoSocial ? "input input--invalid" : "input"}
                value={draft.razaoSocial}
                placeholder="Portobello Distribuidora SP Ltda"
                onChange={(e) => setField("razaoSocial", e.target.value)}
                onBlur={() => blurField("razaoSocial")}
              />
            </FormField>
            <FormField label="Nome fantasia" htmlFor="forn-nomeFantasia">
              <input id="forn-nomeFantasia" className="input" value={draft.nomeFantasia} placeholder="Portobello Distribuidora SP" onChange={(e) => setField("nomeFantasia", e.target.value)} />
            </FormField>
            <FormField label="CNPJ/CPF" htmlFor="forn-cnpjCpf">
              <input id="forn-cnpjCpf" className="input" value={draft.cnpjCpf} placeholder="00.000.000/0001-00" onChange={(e) => setField("cnpjCpf", e.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 12 }}>Contato</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <FormField label="Responsável" htmlFor="forn-responsavel">
              <input id="forn-responsavel" className="input" value={draft.responsavel} placeholder="Nome do contato" onChange={(e) => setField("responsavel", e.target.value)} />
            </FormField>
            <FormField label="Telefone" htmlFor="forn-telefone">
              <input id="forn-telefone" className="input" value={draft.telefone} placeholder="(11) 3000-0000" onChange={(e) => setField("telefone", e.target.value)} />
            </FormField>
            <FormField label="WhatsApp" htmlFor="forn-whatsapp">
              <input id="forn-whatsapp" className="input" value={draft.whatsapp} placeholder="(11) 90000-0000" onChange={(e) => setField("whatsapp", e.target.value)} />
            </FormField>
            <FormField label="E-mail" htmlFor="forn-email" error={errors.email}>
              <input
                id="forn-email"
                type="email"
                className={errors.email ? "input input--invalid" : "input"}
                value={draft.email}
                placeholder="contato@fornecedor.com.br"
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => blurField("email")}
              />
            </FormField>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 12 }}>Endereço</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <FormField label="CEP" htmlFor="forn-cep">
              <input id="forn-cep" className="input" value={draft.cep} placeholder="00000-000" onChange={(e) => setField("cep", e.target.value)} />
            </FormField>
            <FormField label="Endereço" htmlFor="forn-endereco">
              <input id="forn-endereco" className="input" value={draft.endereco} placeholder="Rua, número" onChange={(e) => setField("endereco", e.target.value)} />
            </FormField>
            <FormField label="Cidade" htmlFor="forn-cidade">
              <input id="forn-cidade" className="input" value={draft.cidade} placeholder="São Paulo" onChange={(e) => setField("cidade", e.target.value)} />
            </FormField>
            <FormField label="UF" htmlFor="forn-uf" error={errors.uf}>
              <input
                id="forn-uf"
                className={errors.uf ? "input input--invalid" : "input"}
                value={draft.uf}
                maxLength={2}
                placeholder="SP"
                onChange={(e) => setField("uf", e.target.value.toUpperCase())}
                onBlur={() => blurField("uf")}
              />
            </FormField>
          </div>
        </div>

        <div className="row gap-sm" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={() => navigate("/catalogo/fornecedores")}>Cancelar</button>
          <button type="submit" className="btn btn--primary">Salvar fornecedor</button>
        </div>
      </form>
    </div>
  );
}
