import { BoxGeometry, Mesh, MeshStandardMaterial, Scene, SRGBColorSpace, TextureLoader, type Texture } from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

/** Tamanho genérico da amostra em metros — não é a dimensão real do
 * produto (MaterialCatalogItem não guarda largura/altura), é um "corpo de
 * prova" do tamanho de uma amostra física comum, pra ficar em escala
 * plausível quando colocado no chão/parede via AR. */
const AMOSTRA_LARGURA_M = 0.5;
const AMOSTRA_ESPESSURA_M = 0.015;

function carregarTextura(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(
      url,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

/**
 * Gera um .glb de verdade — em memória, no navegador — a partir da foto de
 * um material: uma placa texturizada, no tamanho de uma amostra física.
 * É esse arquivo que o <model-viewer> abre em AR (Quick Look no iOS, Scene
 * Viewer no Android). Retorna uma blob: URL; quem chama é responsável por
 * `URL.revokeObjectURL` quando não precisar mais dela.
 */
export async function gerarGlbAmostraMaterial(imagemUrl: string, opts: { roughness?: number; metalness?: number } = {}): Promise<string> {
  const texture = await carregarTextura(imagemUrl);

  const scene = new Scene();
  const geometry = new BoxGeometry(AMOSTRA_LARGURA_M, AMOSTRA_ESPESSURA_M, AMOSTRA_LARGURA_M);
  const material = new MeshStandardMaterial({ map: texture, roughness: opts.roughness ?? 0.5, metalness: opts.metalness ?? 0 });
  scene.add(new Mesh(geometry, material));

  const exporter = new GLTFExporter();
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(scene, (result) => resolve(result as ArrayBuffer), reject, { binary: true });
  });

  return URL.createObjectURL(new Blob([arrayBuffer], { type: "model/gltf-binary" }));
}
