import { Plus, Trash2 } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { UploadCompactRow } from "../components/CatalogoAuthoring";
import { useApp } from "../state/AppContext";
import type { CategoriaArquivoPessoa, Pessoa, StatusRegistroProfissional, TipoPapel } from "../domain/types";

const PAPEIS: TipoPapel[] = ["Arquiteto", "Engenheiro", "Técnico", "Designer", "Projetista", "Consultor", "Cliente", "Responsável pela construtora", "Outro"];
const STATUS_REGISTRO: StatusRegistroProfissional[] = ["Ativo", "Inativo"];

const META_ARQUIVOS_PESSOA: { key: CategoriaArquivoPessoa; label: string; accept: string }[] = [
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

const NOVA: Omit<Pessoa, "id" | "construtoraId"> = {
  papeis: [], nome: "", cpf: "", email: "", telefone: "", empresa: "", cargoEspecialidade: "",
  conselho: "", numeroRegistro: "", ufRegistro: "", statusRegistro: "Ativo",
  endereco: "", estadoCivil: "", canalContatoPreferencial: "", observacoes: "", arquivos: ARQUIVOS_VAZIOS,
};

/**
 * Pessoa/Papel — cadastro único pra qualquer humano com quem a construtora
 * lida, em vez de telas separadas por "tipo" (arquiteto, técnico, cliente).
 * A mesma pessoa pode acumular papéis (ex.: Arquiteto + Responsável pela
 * construtora) — por isso Papéis é multi-seleção, não um campo único.
 */
export function PessoasPage() {
  const { construtoraLogadaId, pessoasRepo, criarPessoa, atualizarPessoa, removerPessoa } = useApp();
  const construtoraId = construtoraLogadaId ?? "";
  const pessoas = pessoasRepo.list(construtoraId);

  function togglePapel(p: Pessoa, papel: TipoPapel) {
    const papeis = p.papeis.includes(papel) ? p.papeis.filter((x) => x !== papel) : [...p.papeis, papel];
    atualizarPessoa(p.id, { papeis });
  }

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Painel", to: "/painel" }, { label: "Pessoas" }]} />
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pessoas</h1>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => criarPessoa({ ...NOVA, construtoraId })}>
          <Plus className="sidebar-nav-icon" /> Nova pessoa
        </button>
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, maxWidth: "70ch", lineHeight: 1.5 }}>
        Um cadastro só pra qualquer pessoa — arquiteto, engenheiro, técnico, cliente. A mesma pessoa pode ter mais de um papel ao mesmo
        tempo, em vez de virar registros duplicados em telas separadas.
      </p>

      {pessoas.length === 0 && <div className="card text-soft" style={{ fontSize: 13 }}>Nenhuma pessoa cadastrada ainda.</div>}

      <div className="stack gap-lg">
        {pessoas.map((p) => (
          <div key={p.id} className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>Papel(éis)</div>
            <div className="row gap-sm" style={{ flexWrap: "wrap", marginBottom: 14 }}>
              {PAPEIS.map((papel) => (
                <label key={papel} className="row gap-xs" style={{ fontSize: 12.5, alignItems: "center", border: "1px solid var(--rule)", borderRadius: 6, padding: "4px 8px" }}>
                  <input type="checkbox" checked={p.papeis.includes(papel)} onChange={() => togglePapel(p, papel)} /> {papel}
                </label>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Dados essenciais</div>
            <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div>
                <label className="label">Nome</label>
                <input className="input" value={p.nome} onChange={(e) => atualizarPessoa(p.id, { nome: e.target.value })} placeholder="Nome completo" />
              </div>
              <div>
                <label className="label">CPF</label>
                <input className="input" value={p.cpf} onChange={(e) => atualizarPessoa(p.id, { cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input className="input" type="email" value={p.email} onChange={(e) => atualizarPessoa(p.id, { email: e.target.value })} placeholder="nome@email.com" />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input className="input" value={p.telefone} onChange={(e) => atualizarPessoa(p.id, { telefone: e.target.value })} placeholder="(11) 90000-0000" />
              </div>
              <div>
                <label className="label">Empresa</label>
                <input className="input" value={p.empresa} onChange={(e) => atualizarPessoa(p.id, { empresa: e.target.value })} placeholder="Empresa/escritório" />
              </div>
              <div>
                <label className="label">Cargo / especialidade</label>
                <input className="input" value={p.cargoEspecialidade} onChange={(e) => atualizarPessoa(p.id, { cargoEspecialidade: e.target.value })} placeholder="Arquiteta responsável" />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Registro profissional</div>
            <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div>
                <label className="label">Conselho</label>
                <input className="input" value={p.conselho} onChange={(e) => atualizarPessoa(p.id, { conselho: e.target.value })} placeholder="CAU, CREA, CFT..." />
              </div>
              <div>
                <label className="label">Número do registro</label>
                <input className="input" value={p.numeroRegistro} onChange={(e) => atualizarPessoa(p.id, { numeroRegistro: e.target.value })} />
              </div>
              <div>
                <label className="label">UF</label>
                <input className="input" value={p.ufRegistro} maxLength={2} onChange={(e) => atualizarPessoa(p.id, { ufRegistro: e.target.value.toUpperCase() })} placeholder="SP" />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={p.statusRegistro} onChange={(e) => atualizarPessoa(p.id, { statusRegistro: e.target.value as StatusRegistroProfissional })}>
                  {STATUS_REGISTRO.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Contato / cliente</div>
            <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Endereço</label>
                <input className="input" value={p.endereco} onChange={(e) => atualizarPessoa(p.id, { endereco: e.target.value })} placeholder="Rua, número, cidade/UF" />
              </div>
              <div>
                <label className="label">Estado civil</label>
                <input className="input" value={p.estadoCivil} onChange={(e) => atualizarPessoa(p.id, { estadoCivil: e.target.value })} placeholder="Se necessário contratualmente" />
              </div>
              <div>
                <label className="label">Canal de contato preferencial</label>
                <input className="input" value={p.canalContatoPreferencial} onChange={(e) => atualizarPessoa(p.id, { canalContatoPreferencial: e.target.value })} placeholder="WhatsApp, e-mail, telefone..." />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Observações</div>
            <div style={{ marginBottom: 14 }}>
              <textarea
                className="input"
                rows={2}
                style={{ resize: "vertical", fontFamily: "inherit" }}
                value={p.observacoes}
                onChange={(e) => atualizarPessoa(p.id, { observacoes: e.target.value })}
              />
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>Uploads</div>
            <div style={{ marginBottom: 14 }}>
              {META_ARQUIVOS_PESSOA.map((m) => (
                <UploadCompactRow
                  key={m.key}
                  label={m.label}
                  accept={m.accept}
                  arquivos={p.arquivos[m.key]}
                  onAdd={(list) => {
                    if (!list?.length) return;
                    const incoming = Array.from(list).map((f) => ({ id: `${m.key}-${Date.now()}-${f.name}`, name: f.name, size: f.size }));
                    atualizarPessoa(p.id, { arquivos: { ...p.arquivos, [m.key]: [...p.arquivos[m.key], ...incoming] } });
                  }}
                  onClear={() => atualizarPessoa(p.id, { arquivos: { ...p.arquivos, [m.key]: [] } })}
                />
              ))}
            </div>

            <button
              type="button"
              style={{ border: "none", background: "none", color: "var(--red-ink)", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}
              onClick={() => removerPessoa(p.id)}
            >
              <Trash2 className="sidebar-nav-icon" style={{ width: 13, height: 13, marginRight: 4 }} /> Remover pessoa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
