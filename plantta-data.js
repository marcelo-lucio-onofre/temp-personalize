export const empreendimento = {
  nome: "Residencial Aurora", construtora: "Prado Engenharia", unidade: "Apto 1204",
  torre: "Torre B", comprador: "Marina Alves", cpf: "•••.•••.•••-89",
  totalUnidades: 300, prazoPersonalizacao: "01/11/2026"
};

export const ambientes = [
  { id: "sala", nome: "Sala de Estar", itens: [
    { id: "piso_sala", nome: "Piso", nivel: 1, padrao: "Porcelanato Standard 60×60", valorPadrao: 6000, prazo: "20/10/2026",
      opcoes: [
        { id: "p1", nome: "Porcelanato Standard 60×60", preco: 6000, padrao: true },
        { id: "p2", nome: "Porcelanato Portobello Premium 80×80", preco: 8500 },
        { id: "p3", nome: "Porcelanato Marmorizado Extra", preco: 9800 },
        { id: "p0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "rodape_sala", nome: "Rodapé", nivel: 1, padrao: "MDF Branco 7 cm", valorPadrao: 1200, prazo: "20/10/2026",
      opcoes: [
        { id: "r1", nome: "MDF Branco 7 cm", preco: 1200, padrao: true },
        { id: "r2", nome: "MDF Amadeirado 10 cm", preco: 1600 },
        { id: "r0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "eletrica_sala", nome: "Pontos Elétricos", nivel: 2, padrao: "8 pontos (padrão sala)", valorPadrao: 0, prazo: "05/10/2026",
      parametrico: true, qtdPadrao: 8,
      custoPorUnidade: { conduiteM: 12.50, fioM: 8.30, disjuntor: 45.00, maoDeObra: 85.00, total: 150.80 },
      opcoes: [] },
    { id: "parede_sala", nome: "Parede divisória cozinha/sala", nivel: 3, padrao: "Alvenaria estrutural", valorPadrao: 0, prazo: null,
      motivoBloqueio: "Parede estrutural — remoção não permitida conforme laudo técnico RT-2024/087.", opcoes: [] }
  ]},
  { id: "cozinha", nome: "Cozinha", itens: [
    { id: "bancada", nome: "Bancada", nivel: 1, padrao: "Granito Cinza Corumbá", valorPadrao: 3200, prazo: "20/10/2026",
      opcoes: [
        { id: "b1", nome: "Granito Cinza Corumbá", preco: 3200, padrao: true },
        { id: "b2", nome: "Quartzo Branco Ibiza", preco: 4900 },
        { id: "b3", nome: "Dekton Sirius", preco: 6100 },
        { id: "b0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "cuba", nome: "Cuba e Torneira", nivel: 1, padrao: "Cuba simples inox + monocomando", valorPadrao: 900, prazo: "20/10/2026",
      opcoes: [
        { id: "c1", nome: "Cuba simples inox + monocomando", preco: 900, padrao: true },
        { id: "c2", nome: "Cuba dupla + torneira gourmet", preco: 1750 },
        { id: "c0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "hidraulica", nome: "Pontos Hidráulicos", nivel: 2, padrao: "3 pontos (padrão cozinha)", valorPadrao: 0, prazo: "01/10/2026",
      parametrico: true, qtdPadrao: 3,
      custoPorUnidade: { tubulacao: 35.00, conexoes: 22.00, maoDeObra: 120.00, total: 177.00 },
      opcoes: [] }
  ]},
  { id: "banheiro", nome: "Banheiro Suíte", itens: [
    { id: "revestimento", nome: "Revestimento", nivel: 1, padrao: "Porcelanato Acetinado Bege", valorPadrao: 2400, prazo: "20/10/2026",
      opcoes: [
        { id: "rv1", nome: "Porcelanato Acetinado Bege", preco: 2400, padrao: true },
        { id: "rv2", nome: "Porcelanato Off-White Grande Formato", preco: 3600 },
        { id: "rv0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "loucas", nome: "Louças e Metais", nivel: 1, padrao: "Deca Aspen + Deca Link", valorPadrao: 2100, prazo: "20/10/2026",
      opcoes: [
        { id: "l1", nome: "Deca Aspen + Deca Link", preco: 2100, padrao: true },
        { id: "l2", nome: "Docol Benefit Black", preco: 3400 },
        { id: "l0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "viga_banheiro", nome: "Viga estrutural", nivel: 3, padrao: "Concreto armado", valorPadrao: 0, prazo: null,
      motivoBloqueio: "Elemento estrutural (viga) — alteração proibida por norma NBR 16280.", opcoes: [] }
  ]},
  { id: "varanda", nome: "Varanda", itens: [
    { id: "piso_varanda", nome: "Piso", nivel: 1, padrao: "Porcelanato Externo Cinza", valorPadrao: 3800, prazo: "20/10/2026",
      opcoes: [
        { id: "pv1", nome: "Porcelanato Externo Cinza", preco: 3800, padrao: true },
        { id: "pv2", nome: "Porcelanato Amadeirado Deck", preco: 5200 },
        { id: "pv0", nome: "Remover item (gera crédito)", preco: 0, remocao: true }
      ] },
    { id: "integracao", nome: "Integração varanda/sala", nivel: 2, padrao: "Esquadria padrão (fechada)", valorPadrao: 0, prazo: "01/10/2026",
      opcoes: [
        { id: "iv1", nome: "Esquadria padrão (fechada)", preco: 0, padrao: true },
        { id: "iv2", nome: "Abertura total com esquadria retrátil", preco: 8500 }
      ] }
  ]}
];

export const solicitacoes = [
  { id: "SOL-001", unidade: "Apto 1204", torre: "B", cliente: "Marina Alves", item: "Piso Sala", de: "Standard 60×60", para: "Portobello Premium 80×80", diferenca: 2500, status: "pendente", nivel: 1, data: "12/09/2026", responsavel: null },
  { id: "SOL-002", unidade: "Apto 1204", torre: "B", cliente: "Marina Alves", item: "Bancada Cozinha", de: "Granito Cinza Corumbá", para: "Quartzo Branco Ibiza", diferenca: 1700, status: "pendente", nivel: 1, data: "12/09/2026", responsavel: null },
  { id: "SOL-003", unidade: "Apto 812", torre: "A", cliente: "Ricardo Nogueira", item: "Pontos Elétricos +12", de: "20 pontos", para: "32 pontos", diferenca: 1809.60, status: "em_analise", nivel: 2, data: "10/09/2026", responsavel: "Eng. Carlos Medeiros" },
  { id: "SOL-004", unidade: "Apto 305", torre: "A", cliente: "Fernanda Lima", item: "Louças e Metais", de: "Deca Aspen", para: "Docol Benefit Black", diferenca: 1300, status: "aprovado", nivel: 1, data: "08/09/2026", responsavel: null },
  { id: "SOL-005", unidade: "Apto 1104", torre: "B", cliente: "Bruno Castro", item: "Integração Varanda", de: "Esquadria fechada", para: "Retrátil total", diferenca: 8500, status: "em_analise", nivel: 2, data: "05/09/2026", responsavel: "Arq. Lívia Duarte" },
  { id: "SOL-006", unidade: "Apto 601", torre: "A", cliente: "Larissa Prado", item: "Remoção viga banheiro", de: "—", para: "Remoção solicitada", diferenca: null, status: "recusado", nivel: 3, data: "02/09/2026", responsavel: null },
  { id: "SOL-007", unidade: "Apto 903", torre: "B", cliente: "André Souza", item: "Piso Varanda", de: "Externo Cinza", para: "Amadeirado Deck", diferenca: 1400, status: "aprovado", nivel: 1, data: "01/09/2026", responsavel: null },
  { id: "SOL-008", unidade: "Apto 1507", torre: "B", cliente: "Camila Reis", item: "Pontos Hidráulicos +2", de: "3 pontos", para: "5 pontos", diferenca: 354, status: "pendente", nivel: 2, data: "14/09/2026", responsavel: null },
  { id: "SOL-009", unidade: "Apto 702", torre: "A", cliente: "Thiago Martins", item: "Revestimento Banheiro", de: "Acetinado Bege", para: "Off-White Grande Formato", diferenca: 1200, status: "pendente", nivel: 1, data: "15/09/2026", responsavel: null },
  { id: "SOL-010", unidade: "Apto 410", torre: "A", cliente: "Juliana Rocha", item: "Cuba Cozinha", de: "Cuba simples", para: "Cuba dupla + gourmet", diferenca: 850, status: "aprovado", nivel: 1, data: "03/09/2026", responsavel: null }
];

export const dashboard = {
  unidadesTotal: 300, unidadesPersonalizando: 121,
  receitaUpgrade: 612000, ticketMedioUpgrade: 5060,
  taxaAdesao: 0.403, tempoMedioAprovacao: 1.8,
  solicitacoesMes: 187, creditoGerado: 284000, creditoUtilizado: 198000,
  topUpgrades: [
    { nome: "Porcelanato Premium", pct: 0.62, receita: 186000 },
    { nome: "Bancada Quartzo/Dekton", pct: 0.48, receita: 142000 },
    { nome: "Metais Black/Gold", pct: 0.31, receita: 98000 },
    { nome: "Integração Varanda", pct: 0.22, receita: 89000 },
    { nome: "Pontos Elétricos Extra", pct: 0.18, receita: 54000 },
    { nome: "Automação/Iluminação", pct: 0.12, receita: 43000 }
  ],
  porMes: [
    { mes: "Abr", valor: 78000, sol: 28 }, { mes: "Mai", valor: 95000, sol: 32 },
    { mes: "Jun", valor: 121000, sol: 38 }, { mes: "Jul", valor: 108000, sol: 29 },
    { mes: "Ago", valor: 134000, sol: 35 }, { mes: "Set", valor: 76000, sol: 25 }
  ],
  porNivel: { simples: 142, tecnico: 38, proibido: 7 }
};
