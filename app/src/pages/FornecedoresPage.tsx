import { Plus, Trash2 } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { useApp } from "../state/AppContext";
import type { Fornecedor } from "../domain/types";

const NOVO: Omit<Fornecedor, "id" | "construtoraId"> = {
  razaoSocial: "", nomeFantasia: "", cnpjCpf: "", responsavel: "", telefone: "", whatsapp: "", email: "", cep: "", endereco: "", cidade: "", uf: "",
};

export function FornecedoresPage() {
  const { construtoraLogadaId, catalogoFornecedores, criarFornecedor, atualizarFornecedor, removerFornecedor } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const fornecedores = catalogoFornecedores.list(construtoraId);

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Catálogo", to: "/catalogo" }, { label: "Fornecedores" }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Fornecedores</h1>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => criarFornecedor({ ...NOVO, construtoraId })}>
          <Plus className="sidebar-nav-icon" /> Novo fornecedor
        </button>
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        Quem entrega o material — cadastro próprio, independente do material em si.
      </p>

      {fornecedores.length === 0 && <div className="card text-soft" style={{ fontSize: 13 }}>Nenhum fornecedor cadastrado ainda.</div>}

      <div className="stack gap-lg">
        {fornecedores.map((f) => (
          <div key={f.id} className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Identificação</div>
            <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div>
                <label className="label">Razão social</label>
                <input className="input" value={f.razaoSocial} onChange={(e) => atualizarFornecedor(f.id, { razaoSocial: e.target.value })} placeholder="Portobello Distribuidora SP Ltda" />
              </div>
              <div>
                <label className="label">Nome fantasia</label>
                <input className="input" value={f.nomeFantasia} onChange={(e) => atualizarFornecedor(f.id, { nomeFantasia: e.target.value })} placeholder="Portobello Distribuidora SP" />
              </div>
              <div>
                <label className="label">CNPJ/CPF</label>
                <input className="input" value={f.cnpjCpf} onChange={(e) => atualizarFornecedor(f.id, { cnpjCpf: e.target.value })} placeholder="00.000.000/0001-00" />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Contato</div>
            <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div>
                <label className="label">Responsável</label>
                <input className="input" value={f.responsavel} onChange={(e) => atualizarFornecedor(f.id, { responsavel: e.target.value })} placeholder="Nome do contato" />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="input" value={f.telefone} onChange={(e) => atualizarFornecedor(f.id, { telefone: e.target.value })} placeholder="(11) 3000-0000" />
              </div>
              <div>
                <label className="label">WhatsApp</label>
                <input className="input" value={f.whatsapp} onChange={(e) => atualizarFornecedor(f.id, { whatsapp: e.target.value })} placeholder="(11) 90000-0000" />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input className="input" type="email" value={f.email} onChange={(e) => atualizarFornecedor(f.id, { email: e.target.value })} placeholder="contato@fornecedor.com.br" />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Endereço</div>
            <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div>
                <label className="label">CEP</label>
                <input className="input" value={f.cep} onChange={(e) => atualizarFornecedor(f.id, { cep: e.target.value })} placeholder="00000-000" />
              </div>
              <div>
                <label className="label">Endereço</label>
                <input className="input" value={f.endereco} onChange={(e) => atualizarFornecedor(f.id, { endereco: e.target.value })} placeholder="Rua, número" />
              </div>
              <div>
                <label className="label">Cidade</label>
                <input className="input" value={f.cidade} onChange={(e) => atualizarFornecedor(f.id, { cidade: e.target.value })} placeholder="São Paulo" />
              </div>
              <div>
                <label className="label">UF</label>
                <input className="input" value={f.uf} maxLength={2} onChange={(e) => atualizarFornecedor(f.id, { uf: e.target.value.toUpperCase() })} placeholder="SP" />
              </div>
            </div>

            <button
              type="button"
              style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}
              onClick={() => removerFornecedor(f.id)}
            >
              <Trash2 className="sidebar-nav-icon" style={{ width: 13, height: 13, marginRight: 4 }} /> Remover fornecedor
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
