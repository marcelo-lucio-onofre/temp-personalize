import type { ICatalogoRepository } from "../data/repositories/types";
import type { MaterialCatalogItem } from "./types";

/** Categoria/Marca só podem ser excluídas se nenhum Material da biblioteca
 * as referencia — evita quebrar material já cadastrado. */
export function categoriaEmUso(categoriaId: string, materiais: MaterialCatalogItem[]): boolean {
  return materiais.some((m) => m.categoriaId === categoriaId);
}

export function marcaEmUso(marcaId: string, materiais: MaterialCatalogItem[]): boolean {
  return materiais.some((m) => m.marcaId === marcaId);
}

/** Fornecedor só pode ser excluído se nenhum Material da biblioteca o
 * referencia como origem — mesma regra de Categoria/Marca. */
export function fornecedorEmUso(fornecedorId: string, materiais: MaterialCatalogItem[]): boolean {
  return materiais.some((m) => m.fornecedorId === fornecedorId);
}

/** Varre o catálogo inteiro do construtora (todos os empreendimentos,
 * plantas, ambientes, itens) atrás de Opcao.materialCatalogItemId — só
 * assim sabemos se um material da biblioteca já foi anexado a alguma
 * opção real antes de deixar excluir. */
export function materiaisEmUsoIds(catalogo: ICatalogoRepository, construtoraId: string): Set<string> {
  const emUso = new Set<string>();
  for (const emp of catalogo.listEmpreendimentosByConstrutora(construtoraId)) {
    for (const planta of catalogo.listPlantas(emp.empreendimentoId)) {
      for (const ambiente of catalogo.getAmbientesByPlanta(emp.empreendimentoId, planta.id)) {
        for (const item of ambiente.itens) {
          for (const opcao of item.opcoes) {
            if (opcao.materialCatalogItemId) emUso.add(opcao.materialCatalogItemId);
          }
        }
      }
    }
  }
  return emUso;
}
