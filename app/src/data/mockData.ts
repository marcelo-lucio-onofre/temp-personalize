// Seed data for the prototype. Ported 1:1 from the original dc-runtime
// mockup (plantta-data.js) so behavior and numbers stay identical.
import type {
  AllowanceGroup,
  Ambiente,
  Brand,
  DashboardData,
  Empreendimento,
  MaterialCatalogItem,
  Solicitacao,
  Vinculo,
} from "../domain/types";

// Plain-data deep clone (Ambiente/Item/Opcao are all JSON-safe: no
// functions/Dates) — used so each empreendimento gets its own independent
// catalog object instead of aliasing the same array, which would make
// editing one empreendimento's catalog silently edit every other's too.
function clonar<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// The construtora's own brand — used only in the "white-label" client flow
// (branded login → branded portal). Editable on the Marca screen.
export const initialBrand: Brand = {
  nome: "Alliance",
  color: "#fd3541",
  logo: "https://alliance.com.br/wp-content/uploads/2026/01/logo-alliance-ok.png",
};

// plantta's own brand — used everywhere the client portal is NOT
// white-labeled: the default client login/portal and the whole
// construtora back-office.
export const planttaBrand: Brand = {
  nome: "plantta",
  color: "#2e9e68",
  logo: null,
};

export const empreendimento: Empreendimento = {
  nome: "Residencial Aurora",
  construtora: "Prado Engenharia",
  unidade: "Apto 1204",
  torre: "Torre B",
  comprador: "Marina Alves",
  cpf: "•••.•••.•••-89",
  totalUnidades: 300,
  prazoPersonalizacao: "01/11/2026",
  valorImovel: 850000,
};

// Second empreendimento for the same client, at a different construtora —
// demonstrates the multi-vínculo sidebar. Reuses the Aurora item catalog
// below (same finishes/options) since this is a prototype; a real backend
// would give each empreendimento its own catalog.
export const empreendimentoVistaVerde: Empreendimento = {
  nome: "Vista Verde Residence",
  construtora: "Horizonte Construções",
  unidade: "Apto 2201",
  torre: "Torre C",
  comprador: "Marina Alves",
  cpf: "•••.•••.•••-89",
  totalUnidades: 180,
  prazoPersonalizacao: "15/12/2026",
  valorImovel: 720000,
};

// A third construtora — Alliance itself (its real brand, not a demo
// overlay on someone else's). Two empreendimentos: Boulevard has two of
// the client's units, Jardins has one. All three already have finished
// personalization history (see solicitacoesIniciais below).
// Two units, same empreendimento — each needs its own record since
// `unidade`/`torre` differ (PortalPage etc. read them directly).
export const empreendimentoAllianceBoulevard501: Empreendimento = {
  nome: "Alliance Boulevard",
  construtora: "Alliance",
  unidade: "Apto 501",
  torre: "A",
  comprador: "Marina Alves",
  cpf: "•••.•••.•••-89",
  totalUnidades: 220,
  prazoPersonalizacao: "20/10/2026",
  valorImovel: 980000,
};

export const empreendimentoAllianceBoulevard1502: Empreendimento = {
  nome: "Alliance Boulevard",
  construtora: "Alliance",
  unidade: "Apto 1502",
  torre: "B",
  comprador: "Marina Alves",
  cpf: "•••.•••.•••-89",
  totalUnidades: 220,
  prazoPersonalizacao: "20/10/2026",
  valorImovel: 1050000,
};

export const empreendimentoAllianceJardins: Empreendimento = {
  nome: "Alliance Jardins",
  construtora: "Alliance",
  unidade: "Apto 302",
  torre: "Única",
  comprador: "Marina Alves",
  cpf: "•••.•••.•••-89",
  totalUnidades: 96,
  prazoPersonalizacao: "05/02/2027",
  valorImovel: 690000,
};

// The logged-in client's own unit↔construtora relationships. The portal's
// left sidebar builds its Construtora → Empreendimento → Unidade tree from
// this list. Only Alliance opted into white-label (brand: initialBrand) —
// Prado and Horizonte fall back to plantta's own colors (brand: null).
export const vinculos: Vinculo[] = [
  {
    id: "v-aurora-1204",
    construtoraId: "00001",
    construtoraNome: "Prado Engenharia",
    empreendimentoId: "00001",
    empreendimentoNome: "Residencial Aurora",
    unidadeLabel: "Apto 1204",
    torre: "B",
    brand: null,
  },
  {
    id: "v-vistaverde-2201",
    construtoraId: "00002",
    construtoraNome: "Horizonte Construções",
    empreendimentoId: "00002",
    empreendimentoNome: "Vista Verde Residence",
    unidadeLabel: "Apto 2201",
    torre: "C",
    brand: null,
  },
  {
    id: "v-boulevard-501",
    construtoraId: "00003",
    construtoraNome: "Alliance",
    empreendimentoId: "00003",
    empreendimentoNome: "Alliance Boulevard",
    unidadeLabel: "Apto 501",
    torre: "A",
    brand: initialBrand,
  },
  {
    id: "v-boulevard-1502",
    construtoraId: "00003",
    construtoraNome: "Alliance",
    empreendimentoId: "00003",
    empreendimentoNome: "Alliance Boulevard",
    unidadeLabel: "Apto 1502",
    torre: "B",
    brand: initialBrand,
  },
  {
    id: "v-jardins-302",
    construtoraId: "00003",
    construtoraNome: "Alliance",
    empreendimentoId: "00004",
    empreendimentoNome: "Alliance Jardins",
    unidadeLabel: "Apto 302",
    torre: "Única",
    brand: initialBrand,
  },
];

export const ambientes: Ambiente[] = [
  {
    id: "sala",
    nome: "Sala de Estar",
    itens: [
      {
        id: "piso_sala",
        nome: "Piso",
        nivel: 1,
        padrao: "Porcelanato Standard 60×60",
        valorPadrao: 6000,
        prazo: "20/10/2026",
        opcoes: [
          { id: "p1", nome: "Porcelanato Standard 60×60", preco: 6000, padrao: true },
          { id: "p2", nome: "Porcelanato Portobello Premium 80×80", preco: 8500 },
          { id: "p3", nome: "Porcelanato Marmorizado Extra", preco: 9800 },
          { id: "p0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "rodape_sala",
        nome: "Rodapé",
        nivel: 1,
        padrao: "MDF Branco 7 cm",
        valorPadrao: 1200,
        prazo: "20/10/2026",
        opcoes: [
          { id: "r1", nome: "MDF Branco 7 cm", preco: 1200, padrao: true },
          { id: "r2", nome: "MDF Amadeirado 10 cm", preco: 1600 },
          { id: "r0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "eletrica_sala",
        nome: "Pontos Elétricos",
        nivel: 2,
        padrao: "8 pontos (padrão sala)",
        valorPadrao: 0,
        prazo: "05/10/2026",
        parametrico: true,
        qtdPadrao: 8,
        custoPorUnidade: { conduiteM: 12.5, fioM: 8.3, disjuntor: 45.0, maoDeObra: 85.0, total: 150.8 },
        opcoes: [],
      },
      {
        id: "parede_sala",
        nome: "Parede divisória cozinha/sala",
        nivel: 3,
        padrao: "Alvenaria estrutural",
        valorPadrao: 0,
        prazo: null,
        motivoBloqueio: "Parede estrutural — remoção não permitida conforme laudo técnico RT-2024/087.",
        opcoes: [],
      },
    ],
  },
  {
    id: "cozinha",
    nome: "Cozinha",
    itens: [
      {
        id: "bancada",
        nome: "Bancada",
        nivel: 1,
        padrao: "Granito Cinza Corumbá",
        valorPadrao: 3200,
        prazo: "20/10/2026",
        opcoes: [
          { id: "b1", nome: "Granito Cinza Corumbá", preco: 3200, padrao: true },
          { id: "b2", nome: "Quartzo Branco Ibiza", preco: 4900 },
          { id: "b3", nome: "Dekton Sirius", preco: 6100 },
          { id: "b0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "cuba",
        nome: "Cuba e Torneira",
        nivel: 1,
        padrao: "Cuba simples inox + monocomando",
        valorPadrao: 900,
        prazo: "20/10/2026",
        opcoes: [
          { id: "c1", nome: "Cuba simples inox + monocomando", preco: 900, padrao: true },
          { id: "c2", nome: "Cuba dupla + torneira gourmet", preco: 1750 },
          { id: "c0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "hidraulica",
        nome: "Pontos Hidráulicos",
        nivel: 2,
        padrao: "3 pontos (padrão cozinha)",
        valorPadrao: 0,
        prazo: "01/10/2026",
        parametrico: true,
        qtdPadrao: 3,
        custoPorUnidade: { tubulacao: 35.0, conexoes: 22.0, maoDeObra: 120.0, total: 177.0 },
        opcoes: [],
      },
    ],
  },
  {
    id: "banheiro",
    nome: "Banheiro Suíte",
    itens: [
      {
        id: "revestimento",
        nome: "Revestimento",
        nivel: 1,
        padrao: "Porcelanato Acetinado Bege",
        valorPadrao: 2400,
        prazo: "20/10/2026",
        opcoes: [
          { id: "rv1", nome: "Porcelanato Acetinado Bege", preco: 2400, padrao: true },
          { id: "rv2", nome: "Porcelanato Off-White Grande Formato", preco: 3600 },
          { id: "rv0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "loucas",
        nome: "Louças e Metais",
        nivel: 1,
        padrao: "Deca Aspen + Deca Link",
        valorPadrao: 2100,
        prazo: "20/10/2026",
        opcoes: [
          { id: "l1", nome: "Deca Aspen + Deca Link", preco: 2100, padrao: true },
          { id: "l2", nome: "Docol Benefit Black", preco: 3400 },
          { id: "l0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "viga_banheiro",
        nome: "Viga estrutural",
        nivel: 3,
        padrao: "Concreto armado",
        valorPadrao: 0,
        prazo: null,
        motivoBloqueio: "Elemento estrutural (viga) — alteração proibida por norma NBR 16280.",
        opcoes: [],
      },
    ],
  },
  {
    id: "varanda",
    nome: "Varanda",
    itens: [
      {
        id: "piso_varanda",
        nome: "Piso",
        nivel: 1,
        padrao: "Porcelanato Externo Cinza",
        valorPadrao: 3800,
        prazo: "20/10/2026",
        opcoes: [
          { id: "pv1", nome: "Porcelanato Externo Cinza", preco: 3800, padrao: true },
          { id: "pv2", nome: "Porcelanato Amadeirado Deck", preco: 5200 },
          { id: "pv0", nome: "Remover item (gera crédito)", preco: 0, remocao: true },
        ],
      },
      {
        id: "integracao",
        nome: "Integração varanda/sala",
        nivel: 2,
        padrao: "Esquadria padrão (fechada)",
        valorPadrao: 0,
        prazo: "01/10/2026",
        opcoes: [
          { id: "iv1", nome: "Esquadria padrão (fechada)", preco: 0, padrao: true },
          { id: "iv2", nome: "Abertura total com esquadria retrátil", preco: 8500 },
        ],
      },
    ],
  },
];

// Aurora's catalog (empreendimentoId "00001") — verba compartilhada de
// demonstração: revestimento + louças do Banheiro Suíte dividem uma única
// verba, ao vivo (gastar mais num item reduz o saldo visível no outro).
const banheiroAurora = ambientes.find((a) => a.id === "banheiro")!;
banheiroAurora.itens.find((i) => i.id === "revestimento")!.allowanceGroupId = "ag-banheiro-aurora";
banheiroAurora.itens.find((i) => i.id === "loucas")!.allowanceGroupId = "ag-banheiro-aurora";

// Every empreendimento gets its own independent catalog object — cloned
// from the same starting point, but editing one via CatalogoPage must never
// touch another's. Keyed by empreendimentoId (not vinculoId): Boulevard's
// two units correctly share one catalog since they're the same building.
export const ambientesPorEmpreendimento: Record<string, Ambiente[]> = {
  "00001": ambientes, // Aurora — the original array IS this empreendimento's catalog
  "00002": clonar(ambientes), // Vista Verde
  "00003": clonar(ambientes), // Alliance Boulevard
  "00004": clonar(ambientes), // Alliance Jardins
};

export const allowanceGroupsPorEmpreendimento: Record<string, AllowanceGroup[]> = {
  "00001": [
    { id: "ag-banheiro-aurora", nome: "Verba Banheiro Suíte", ambienteId: "banheiro", valorTotal: 4500, itemIds: ["revestimento", "loucas"] },
  ],
  "00002": [],
  "00003": [],
  "00004": [],
};

// Biblioteca de materiais reutilizável por construtora — o que a autoria de
// catálogo (CatalogoPage) anexa às opções de item em vez de digitar marca/
// SKU/preço de novo em cada item.
export const materialCatalogInicial: MaterialCatalogItem[] = [
  { id: "mc-001", construtoraId: "00001", categoria: "Piso", marca: "Portobello", modelo: "Premium 80×80", sku: "PTB-PREM-8080", fornecedor: "Portobello Distribuidora SP", precoCliente: 8500, custoConstrutora: 6200, leadTimeDias: 15, imagemUrl: null },
  { id: "mc-002", construtoraId: "00001", categoria: "Bancada", marca: "Dekton", modelo: "Sirius", sku: "DKT-SIRIUS", fornecedor: "Cosentino Brasil", precoCliente: 6100, custoConstrutora: 4550, leadTimeDias: 30, imagemUrl: null },
  { id: "mc-003", construtoraId: "00001", categoria: "Louças e Metais", marca: "Docol", modelo: "Benefit Black", sku: "DOC-BEN-BLK", fornecedor: "Docol SP", precoCliente: 3400, custoConstrutora: 2380, leadTimeDias: 20, imagemUrl: null },
  { id: "mc-004", construtoraId: "00001", categoria: "Cuba", marca: "Tramontina", modelo: "Morgana Dupla + Gourmet", sku: "TRAM-MORG-DP", fornecedor: "Tramontina Distribuidora", precoCliente: 1750, custoConstrutora: 1190, leadTimeDias: 10, imagemUrl: null },
  { id: "mc-005", construtoraId: "00003", categoria: "Piso", marca: "Portobello", modelo: "Marmorizado Extra", sku: "PTB-MARM-EX", fornecedor: "Portobello Distribuidora SP", precoCliente: 9800, custoConstrutora: 7100, leadTimeDias: 18, imagemUrl: null },
  { id: "mc-006", construtoraId: "00003", categoria: "Revestimento", marca: "Portobello", modelo: "Off-White Grande Formato", sku: "PTB-OFFW-GF", fornecedor: "Portobello Distribuidora SP", precoCliente: 3600, custoConstrutora: 2520, leadTimeDias: 15, imagemUrl: null },
  { id: "mc-007", construtoraId: "00003", categoria: "Bancada", marca: "Quartzo", modelo: "Branco Ibiza", sku: "QRTZ-IBIZA", fornecedor: "Silestone Brasil", precoCliente: 4900, custoConstrutora: 3430, leadTimeDias: 25, imagemUrl: null },
  { id: "mc-008", construtoraId: "00003", categoria: "Louças e Metais", marca: "Docol", modelo: "Benefit Black", sku: "DOC-BEN-BLK", fornecedor: "Docol SP", precoCliente: 3400, custoConstrutora: 2380, leadTimeDias: 20, imagemUrl: null },
  { id: "mc-009", construtoraId: "00002", categoria: "Piso", marca: "Portobello", modelo: "Marmorizado Extra", sku: "PTB-MARM-EX", fornecedor: "Portobello Distribuidora SP", precoCliente: 9800, custoConstrutora: 7100, leadTimeDias: 18, imagemUrl: null },
  { id: "mc-010", construtoraId: "00002", categoria: "Bancada", marca: "Dekton", modelo: "Sirius", sku: "DKT-SIRIUS", fornecedor: "Cosentino Brasil", precoCliente: 6100, custoConstrutora: 4550, leadTimeDias: 30, imagemUrl: null },
];

export const solicitacoesIniciais: Solicitacao[] = [
  {
    id: "SOL-001",
    vinculoId: "v-aurora-1204",
    itemId: "piso_sala",
    unidade: "Apto 1204", torre: "B", cliente: "Marina Alves",
    item: "Piso Sala", de: "Standard 60×60", para: "Portobello Premium 80×80", diferenca: 2500,
    status: "pendente", nivel: 1, data: "12/09/2026", abertoEm: "2026-09-12T09:14:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-001-t1", data: "2026-09-12T09:14:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de piso da sala para Portobello Premium 80×80.", tipo: "criacao" },
      { id: "SOL-001-t2", data: "2026-09-12T09:15:00-03:00", autor: "Sistema", papel: "Automático", texto: "Nível Simples — aguardando triagem inicial da construtora.", tipo: "info" },
    ],
  },
  {
    id: "SOL-002",
    vinculoId: "v-aurora-1204",
    itemId: "bancada",
    unidade: "Apto 1204", torre: "B", cliente: "Marina Alves",
    item: "Bancada Cozinha", de: "Granito Cinza Corumbá", para: "Quartzo Branco Ibiza", diferenca: 1700,
    status: "pendente", nivel: 1, data: "12/09/2026", abertoEm: "2026-09-12T09:22:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-002-t1", data: "2026-09-12T09:22:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de bancada da cozinha para Quartzo Branco Ibiza.", tipo: "criacao" },
      { id: "SOL-002-t2", data: "2026-09-12T09:23:00-03:00", autor: "Sistema", papel: "Automático", texto: "Nível Simples — aguardando triagem inicial da construtora.", tipo: "info" },
    ],
  },
  {
    id: "SOL-003",
    vinculoId: "v-outro-812-a",
    itemId: "eletrica_sala",
    unidade: "Apto 812", torre: "A", cliente: "Ricardo Nogueira",
    item: "Pontos Elétricos +12", de: "20 pontos", para: "32 pontos", diferenca: 1809.6,
    status: "em_analise", nivel: 2, data: "10/09/2026", abertoEm: "2026-09-10T14:32:00-03:00", responsavel: "Eng. Carlos Medeiros",
    timeline: [
      { id: "SOL-003-t1", data: "2026-09-10T14:32:00-03:00", autor: "Ricardo Nogueira", papel: "Cliente", texto: "Solicitação criada pelo cliente.", tipo: "criacao" },
      { id: "SOL-003-t2", data: "2026-09-10T16:10:00-03:00", autor: "Sistema", papel: "Automático", texto: "Roteada para engenharia (nível técnico detectado).", tipo: "roteamento" },
      { id: "SOL-003-t3", data: "2026-09-11T09:45:00-03:00", autor: "Eng. Carlos Medeiros", papel: "Responsável técnico", texto: "Assumiu a análise.", tipo: "assumido" },
    ],
  },
  {
    id: "SOL-004",
    vinculoId: "v-outro-305-a",
    itemId: "loucas",
    unidade: "Apto 305", torre: "A", cliente: "Fernanda Lima",
    item: "Louças e Metais", de: "Deca Aspen", para: "Docol Benefit Black", diferenca: 1300,
    status: "aprovado", nivel: 1, data: "08/09/2026", abertoEm: "2026-09-08T10:05:00-03:00", encerradoEm: "2026-09-08T15:40:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-004-t1", data: "2026-09-08T10:05:00-03:00", autor: "Fernanda Lima", papel: "Cliente", texto: "Solicitação criada: troca de louças e metais.", tipo: "criacao" },
      { id: "SOL-004-t2", data: "2026-09-08T15:40:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples, sem impacto estrutural.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-005",
    vinculoId: "v-outro-1104-b",
    itemId: "integracao",
    unidade: "Apto 1104", torre: "B", cliente: "Bruno Castro",
    item: "Integração Varanda", de: "Esquadria fechada", para: "Retrátil total", diferenca: 8500,
    status: "em_analise", nivel: 2, data: "05/09/2026", abertoEm: "2026-09-05T11:00:00-03:00", responsavel: "Arq. Lívia Duarte",
    timeline: [
      { id: "SOL-005-t1", data: "2026-09-05T11:00:00-03:00", autor: "Bruno Castro", papel: "Cliente", texto: "Solicitação criada: abertura total da varanda com esquadria retrátil.", tipo: "criacao" },
      { id: "SOL-005-t2", data: "2026-09-05T13:20:00-03:00", autor: "Sistema", papel: "Automático", texto: "Roteada para arquitetura (impacto na fachada).", tipo: "roteamento" },
      { id: "SOL-005-t3", data: "2026-09-06T08:15:00-03:00", autor: "Arq. Lívia Duarte", papel: "Responsável técnico", texto: "Assumiu a análise — verificando compatibilidade com o memorial de fachada.", tipo: "assumido" },
    ],
  },
  {
    id: "SOL-006",
    vinculoId: "v-outro-601-a",
    itemId: "viga_banheiro",
    unidade: "Apto 601", torre: "A", cliente: "Larissa Prado",
    item: "Remoção viga banheiro", de: "—", para: "Remoção solicitada", diferenca: null,
    status: "recusado", nivel: 3, data: "02/09/2026", abertoEm: "2026-09-02T16:00:00-03:00", encerradoEm: "2026-09-02T16:05:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-006-t1", data: "2026-09-02T16:00:00-03:00", autor: "Larissa Prado", papel: "Cliente", texto: "Solicitação criada: remoção de viga estrutural do banheiro.", tipo: "criacao" },
      { id: "SOL-006-t2", data: "2026-09-02T16:05:00-03:00", autor: "Sistema", papel: "Automático", texto: "Bloqueada automaticamente — elemento estrutural, alteração proibida por norma NBR 16280.", tipo: "recusa" },
    ],
  },
  {
    id: "SOL-007",
    vinculoId: "v-outro-903-b",
    itemId: "piso_varanda",
    unidade: "Apto 903", torre: "B", cliente: "André Souza",
    item: "Piso Varanda", de: "Externo Cinza", para: "Amadeirado Deck", diferenca: 1400,
    status: "aprovado", nivel: 1, data: "01/09/2026", abertoEm: "2026-09-01T09:00:00-03:00", encerradoEm: "2026-09-01T09:30:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-007-t1", data: "2026-09-01T09:00:00-03:00", autor: "André Souza", papel: "Cliente", texto: "Solicitação criada: troca de piso da varanda.", tipo: "criacao" },
      { id: "SOL-007-t2", data: "2026-09-01T09:30:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-008",
    vinculoId: "v-outro-1507-b",
    itemId: "hidraulica",
    unidade: "Apto 1507", torre: "B", cliente: "Camila Reis",
    item: "Pontos Hidráulicos +2", de: "3 pontos", para: "5 pontos", diferenca: 354,
    status: "pendente", nivel: 2, data: "14/09/2026", abertoEm: "2026-09-14T10:40:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-008-t1", data: "2026-09-14T10:40:00-03:00", autor: "Camila Reis", papel: "Cliente", texto: "Solicitação criada: 2 pontos hidráulicos extras na cozinha.", tipo: "criacao" },
      { id: "SOL-008-t2", data: "2026-09-14T10:41:00-03:00", autor: "Sistema", papel: "Automático", texto: "Nível Técnico — aguardando roteamento para engenharia.", tipo: "info" },
    ],
  },
  {
    id: "SOL-009",
    vinculoId: "v-outro-702-a",
    itemId: "revestimento",
    unidade: "Apto 702", torre: "A", cliente: "Thiago Martins",
    item: "Revestimento Banheiro", de: "Acetinado Bege", para: "Off-White Grande Formato", diferenca: 1200,
    status: "pendente", nivel: 1, data: "15/09/2026", abertoEm: "2026-09-15T08:50:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-009-t1", data: "2026-09-15T08:50:00-03:00", autor: "Thiago Martins", papel: "Cliente", texto: "Solicitação criada: troca de revestimento do banheiro.", tipo: "criacao" },
    ],
  },
  {
    id: "SOL-010",
    vinculoId: "v-outro-410-a",
    itemId: "cuba",
    unidade: "Apto 410", torre: "A", cliente: "Juliana Rocha",
    item: "Cuba Cozinha", de: "Cuba simples", para: "Cuba dupla + gourmet", diferenca: 850,
    status: "aprovado", nivel: 1, data: "03/09/2026", abertoEm: "2026-09-03T13:10:00-03:00", encerradoEm: "2026-09-03T13:40:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-010-t1", data: "2026-09-03T13:10:00-03:00", autor: "Juliana Rocha", papel: "Cliente", texto: "Solicitação criada: troca de cuba e torneira.", tipo: "criacao" },
      { id: "SOL-010-t2", data: "2026-09-03T13:40:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-011",
    vinculoId: "v-vistaverde-2201",
    itemId: "piso_sala",
    unidade: "Apto 2201", torre: "C", cliente: "Marina Alves",
    item: "Piso Sala", de: "Standard 60×60", para: "Marmorizado Extra", diferenca: 3800,
    status: "pendente", nivel: 1, data: "16/09/2026", abertoEm: "2026-09-16T18:05:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-011-t1", data: "2026-09-16T18:05:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de piso da sala para Marmorizado Extra.", tipo: "criacao" },
    ],
  },
  {
    id: "SOL-012",
    vinculoId: "v-vistaverde-2201",
    itemId: "bancada",
    unidade: "Apto 2201", torre: "C", cliente: "Marina Alves",
    item: "Bancada Cozinha", de: "Granito Cinza Corumbá", para: "Dekton Sirius", diferenca: 2900,
    status: "aprovado", nivel: 1, data: "09/09/2026", abertoEm: "2026-09-09T11:15:00-03:00", encerradoEm: "2026-09-09T16:00:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-012-t1", data: "2026-09-09T11:15:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de bancada da cozinha para Dekton Sirius.", tipo: "criacao" },
      { id: "SOL-012-t2", data: "2026-09-09T16:00:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-013",
    vinculoId: "v-boulevard-501",
    itemId: "revestimento",
    unidade: "Apto 501", torre: "A", cliente: "Marina Alves",
    item: "Revestimento Banheiro", de: "Acetinado Bege", para: "Off-White Grande Formato", diferenca: 1200,
    status: "aprovado", nivel: 1, data: "05/09/2026", abertoEm: "2026-09-05T10:20:00-03:00", encerradoEm: "2026-09-05T14:00:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-013-t1", data: "2026-09-05T10:20:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de revestimento do banheiro.", tipo: "criacao" },
      { id: "SOL-013-t2", data: "2026-09-05T14:00:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-014",
    vinculoId: "v-boulevard-501",
    itemId: "piso_varanda",
    unidade: "Apto 501", torre: "A", cliente: "Marina Alves",
    item: "Piso Varanda", de: "Externo Cinza", para: "Amadeirado Deck", diferenca: 1400,
    status: "aprovado", nivel: 1, data: "28/08/2026", abertoEm: "2026-08-28T09:00:00-03:00", encerradoEm: "2026-08-28T11:30:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-014-t1", data: "2026-08-28T09:00:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de piso da varanda.", tipo: "criacao" },
      { id: "SOL-014-t2", data: "2026-08-28T11:30:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-015",
    vinculoId: "v-boulevard-1502",
    itemId: "cuba",
    unidade: "Apto 1502", torre: "B", cliente: "Marina Alves",
    item: "Cuba Cozinha", de: "Cuba simples inox + monocomando", para: "Cuba dupla + torneira gourmet", diferenca: 850,
    status: "aprovado", nivel: 1, data: "02/09/2026", abertoEm: "2026-09-02T13:40:00-03:00", encerradoEm: "2026-09-02T15:10:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-015-t1", data: "2026-09-02T13:40:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de cuba e torneira.", tipo: "criacao" },
      { id: "SOL-015-t2", data: "2026-09-02T15:10:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-016",
    vinculoId: "v-boulevard-1502",
    itemId: "loucas",
    unidade: "Apto 1502", torre: "B", cliente: "Marina Alves",
    item: "Louças e Metais", de: "Deca Aspen + Deca Link", para: "Docol Benefit Black", diferenca: 1300,
    status: "pendente", nivel: 1, data: "17/09/2026", abertoEm: "2026-09-17T09:30:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-016-t1", data: "2026-09-17T09:30:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de louças e metais.", tipo: "criacao" },
    ],
  },
  {
    id: "SOL-017",
    vinculoId: "v-jardins-302",
    itemId: "piso_sala",
    unidade: "Apto 302", torre: "Única", cliente: "Marina Alves",
    item: "Piso Sala", de: "Standard 60×60", para: "Portobello Premium 80×80", diferenca: 2500,
    status: "aprovado", nivel: 1, data: "20/08/2026", abertoEm: "2026-08-20T10:00:00-03:00", encerradoEm: "2026-08-20T13:00:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-017-t1", data: "2026-08-20T10:00:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de piso da sala.", tipo: "criacao" },
      { id: "SOL-017-t2", data: "2026-08-20T13:00:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-018",
    vinculoId: "v-jardins-302",
    itemId: "bancada",
    unidade: "Apto 302", torre: "Única", cliente: "Marina Alves",
    item: "Bancada Cozinha", de: "Granito Cinza Corumbá", para: "Quartzo Branco Ibiza", diferenca: 1700,
    status: "aprovado", nivel: 1, data: "15/08/2026", abertoEm: "2026-08-15T15:20:00-03:00", encerradoEm: "2026-08-15T17:00:00-03:00", responsavel: null,
    timeline: [
      { id: "SOL-018-t1", data: "2026-08-15T15:20:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: troca de bancada da cozinha.", tipo: "criacao" },
      { id: "SOL-018-t2", data: "2026-08-15T17:00:00-03:00", autor: "Sistema", papel: "Automático", texto: "Aprovada automaticamente — item de nível Simples.", tipo: "aprovacao" },
    ],
  },
  {
    id: "SOL-019",
    vinculoId: "v-aurora-1204",
    itemId: "eletrica_sala",
    unidade: "Apto 1204", torre: "B", cliente: "Marina Alves",
    item: "Pontos Elétricos +4", de: "8 pontos", para: "12 pontos (+4)", diferenca: 603.2,
    status: "aprovado", nivel: 2, data: "11/09/2026", abertoEm: "2026-09-11T10:00:00-03:00", encerradoEm: "2026-09-12T09:00:00-03:00", responsavel: "Eng. Carlos Medeiros",
    timeline: [
      { id: "SOL-019-t1", data: "2026-09-11T10:00:00-03:00", autor: "Marina Alves", papel: "Cliente", texto: "Solicitação criada: 4 pontos elétricos extras na sala.", tipo: "criacao" },
      { id: "SOL-019-t2", data: "2026-09-11T10:05:00-03:00", autor: "Sistema", papel: "Automático", texto: "Roteada para engenharia (nível técnico detectado).", tipo: "roteamento" },
      { id: "SOL-019-t3", data: "2026-09-11T15:30:00-03:00", autor: "Eng. Carlos Medeiros", papel: "Responsável técnico", texto: "Quadro elétrico suporta adição de 4 pontos sem troca de disjuntor geral. Execução conforme projeto complementar.", tipo: "parecer" },
      { id: "SOL-019-t4", data: "2026-09-12T09:00:00-03:00", autor: "Eng. Carlos Medeiros", papel: "Responsável técnico", texto: "Solicitação aprovada com assinatura digital.", tipo: "aprovacao" },
    ],
  },
];

export const dashboardData: DashboardData = {
  unidadesTotal: 300,
  unidadesPersonalizando: 121,
  receitaUpgrade: 612000,
  ticketMedioUpgrade: 5060,
  taxaAdesao: 0.403,
  tempoMedioAprovacao: 1.8,
  solicitacoesMes: 187,
  creditoGerado: 284000,
  creditoUtilizado: 198000,
  topUpgrades: [
    { nome: "Porcelanato Premium", pct: 0.62, receita: 186000 },
    { nome: "Bancada Quartzo/Dekton", pct: 0.48, receita: 142000 },
    { nome: "Metais Black/Gold", pct: 0.31, receita: 98000 },
    { nome: "Integração Varanda", pct: 0.22, receita: 89000 },
    { nome: "Pontos Elétricos Extra", pct: 0.18, receita: 54000 },
    { nome: "Automação/Iluminação", pct: 0.12, receita: 43000 },
  ],
  porMes: [
    { mes: "Abr", valor: 78000, sol: 28 },
    { mes: "Mai", valor: 95000, sol: 32 },
    { mes: "Jun", valor: 121000, sol: 38 },
    { mes: "Jul", valor: 108000, sol: 29 },
    { mes: "Ago", valor: 134000, sol: 35 },
    { mes: "Set", valor: 76000, sol: 25 },
  ],
  porNivel: { simples: 142, tecnico: 38, proibido: 7 },
};

// Ledger lançamentos that seed the cart/ledger screen — mirrors the
// hard-coded selections in the original Plantta-Carrinho.dc.html.
export const selecoesIniciais = [
  { id: "sel-1", item: "Piso", ambiente: "Sala", de: "Standard 60×60", para: "Portobello Premium 80×80", nivel: 1 as const, credito: 6000, custo: 8500 },
  { id: "sel-2", item: "Bancada", ambiente: "Cozinha", de: "Granito Cinza Corumbá", para: "Quartzo Branco Ibiza", nivel: 1 as const, credito: 3200, custo: 4900 },
  { id: "sel-3", item: "Louças e Metais", ambiente: "Banheiro", de: "Deca Aspen + Deca Link", para: "Docol Benefit Black", nivel: 1 as const, credito: 2100, custo: 3400 },
  { id: "sel-4", item: "Piso Varanda", ambiente: "Varanda", de: "Externo Cinza", para: "Removido (crédito)", nivel: 1 as const, credito: 3800, custo: 0 },
  { id: "sel-5", item: "Pontos Elétricos", ambiente: "Sala", de: "8 pontos", para: "14 pontos (+6)", nivel: 2 as const, credito: 0, custo: 904.8 },
];

export const ledgerInicial = [
  { id: "l1", data: "12/09 09:14", descricao: "Crédito: Piso Sala (padrão)", valor: 6000, tipo: "credito" as const },
  { id: "l2", data: "12/09 09:14", descricao: "Upgrade: Portobello Premium", valor: -8500, tipo: "debito" as const },
  { id: "l3", data: "12/09 09:22", descricao: "Crédito: Bancada (padrão)", valor: 3200, tipo: "credito" as const },
  { id: "l4", data: "12/09 09:22", descricao: "Upgrade: Quartzo Branco Ibiza", valor: -4900, tipo: "debito" as const },
  { id: "l5", data: "12/09 09:30", descricao: "Crédito: Louças (padrão)", valor: 2100, tipo: "credito" as const },
  { id: "l6", data: "12/09 09:30", descricao: "Upgrade: Docol Benefit Black", valor: -3400, tipo: "debito" as const },
  { id: "l7", data: "13/09 14:05", descricao: "Remoção: Piso Varanda (crédito)", valor: 3800, tipo: "credito" as const },
  { id: "l8", data: "13/09 15:20", descricao: "Pontos elétricos: 6 extras × R$ 150,80", valor: -904.8, tipo: "debito" as const },
];
