# plantta — protótipo navegável (React + TypeScript)

Reescrita do mockup `.dc.html` original em React + TypeScript + Vite, mantendo nome e marca atuais (plantta, símbolo de 3 pontos, cor `#fd3541` como padrão da construtora "Alliance") até a decisão final de branding.

## Rodar

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de produção em dist/
npm run lint       # oxlint
```

## Arquitetura

- `src/domain/` — tipos e funções de cálculo puras (sem React, sem I/O). `calculations.ts` centraliza toda a matemática de crédito/custo — usada por Portal, Seleção e Carrinho, então os três telas sempre concordam sobre o saldo.
- `src/data/` — dados mock (`mockData.ts`, portado 1:1 do `plantta-data.js` original) e repositórios em memória (`repositories/`). As páginas dependem das *interfaces* dos repositórios, não das classes concretas — trocar por uma API real no futuro é implementar uma nova classe que satisfaça a mesma interface, sem tocar nas páginas.
- `src/state/AppContext.tsx` — um `useReducer` central com toda a persistência em memória da sessão (marca, papel logado, escolhas de personalização, solicitações, empreendimentos cadastrados). Reseta ao recarregar a página — é o comportamento esperado de um protótipo sem backend.
- `src/components/` — primitivos reutilizáveis (nav responsiva com menu gaveta no mobile, badge de nível, marca da plataforma).
- `src/pages/` — uma página por tela do mockup original, uma rota cada (`react-router-dom`).

## Diferenças propositais em relação ao mockup original

- **Carrinho é derivado do estado real de escolhas** (via `resumirAlteracoes`), não mais uma lista hardcoded — ficou funcional de ponta a ponta: personalizar um item no Portal/Seleção reflete no Carrinho.
- **Responsivo**: nav vira menu gaveta abaixo de 860px, grids empilham em coluna única abaixo de 720px, tabelas largas (Painel, Termo) rolam horizontalmente em vez de quebrar layout.

## O que ainda é mock

Sem backend — tudo em memória (contexto React). Upload de arquivo (Cadastro, Marca) lê o arquivo real do dispositivo mas não persiste em disco/servidor. Login aceita qualquer valor, como no protótipo original.
