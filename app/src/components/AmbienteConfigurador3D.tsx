import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { SRGBColorSpace, type Texture } from "three";
import { Box } from "lucide-react";

const ROOM_W = 5;
const ROOM_D = 3.6;
const ROOM_H = 2.6;

export interface SuperficieMaterial {
  imagemUrl: string;
  roughness?: number;
  metalness?: number;
  /** Nome do material — vira legenda na cena, não usado no render em si. */
  nome: string;
}

function onTextureLoad(texture: Texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
}

/** Piso/parede com a foto real do material — componente próprio (não
 * condicional dentro de outro) porque useTexture não pode ser chamado
 * condicionalmente; só monta quando a superfície tem material vinculado. */
function SuperficieComFoto({
  args,
  position,
  rotation,
  material,
  repeatScale,
}: {
  args: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  material: SuperficieMaterial;
  repeatScale: number;
}) {
  const texture = useTexture(material.imagemUrl, (t) => {
    onTextureLoad(t);
    t.repeat.set(repeatScale, repeatScale * (args[1] / args[0]));
  });
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial map={texture} roughness={material.roughness ?? 0.5} metalness={material.metalness ?? 0} />
    </mesh>
  );
}

function SuperficieNeutra({
  args,
  position,
  rotation,
}: {
  args: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial color="#efece3" roughness={0.92} />
    </mesh>
  );
}

function Superficie(props: {
  args: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  material?: SuperficieMaterial;
  repeatScale?: number;
}) {
  const { material, repeatScale = 4, ...rest } = props;
  return material ? <SuperficieComFoto {...rest} material={material} repeatScale={repeatScale} /> : <SuperficieNeutra {...rest} />;
}

/** Peça de mobília genérica só pra dar escala/contexto ao ambiente — não é
 * um modelo real, é um placeholder até existir um .glb por ambiente (ver
 * plano de implementação, Fase 2 -> Fase 3). */
function MobiliaDeReferencia({ tipo }: { tipo: "quarto" | "banheiro" | "cozinha" | "sala" | "generico" }) {
  const cinza = "#d8d4c6";
  const branco = "#ffffff";
  if (tipo === "quarto") {
    return (
      <group>
        <mesh position={[-0.9, 0.16, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.32, 2.0]} />
          <meshStandardMaterial color={cinza} roughness={0.9} />
        </mesh>
        <mesh position={[-0.9, 0.39, -1.0]} castShadow>
          <boxGeometry args={[1.5, 0.14, 0.5]} />
          <meshStandardMaterial color={branco} roughness={0.7} />
        </mesh>
      </group>
    );
  }
  if (tipo === "banheiro") {
    return (
      <mesh position={[-1.7, 0.4, -1.4]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 0.5]} />
        <meshStandardMaterial color={branco} roughness={0.3} />
      </mesh>
    );
  }
  if (tipo === "cozinha") {
    return (
      <mesh position={[-1.7, 0.45, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.9, 0.6]} />
        <meshStandardMaterial color={cinza} roughness={0.6} />
      </mesh>
    );
  }
  if (tipo === "sala") {
    return (
      <mesh position={[-1.2, 0.25, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.5, 0.7]} />
        <meshStandardMaterial color={cinza} roughness={0.85} />
      </mesh>
    );
  }
  return null;
}

/** Deriva o "tipo" de ambiente pelo nome pra escolher a peça de referência —
 * heurística de texto, não um campo do domínio (Ambiente não modela tipo). */
export function tipoAmbientePorNome(nome: string): "quarto" | "banheiro" | "cozinha" | "sala" | "generico" {
  const n = nome.toLowerCase();
  if (n.includes("quarto") || n.includes("suíte") || n.includes("suite")) return "quarto";
  if (n.includes("banheiro") || n.includes("lavabo")) return "banheiro";
  if (n.includes("cozinha") || n.includes("gourmet")) return "cozinha";
  if (n.includes("sala")) return "sala";
  return "generico";
}

function Cena({
  tipo,
  piso,
  revestimento,
  bancada,
}: {
  tipo: ReturnType<typeof tipoAmbientePorNome>;
  piso?: SuperficieMaterial;
  revestimento?: SuperficieMaterial;
  bancada?: SuperficieMaterial;
}) {
  return (
    <>
      <hemisphereLight intensity={0.7} color="#f3f3ec" groundColor="#3a3a34" />
      <directionalLight position={[4, 6, 3]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <ambientLight intensity={0.25} />

      <Superficie args={[ROOM_W, ROOM_D]} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={piso} repeatScale={4} />
      <Superficie args={[ROOM_W, ROOM_H]} position={[0, ROOM_H / 2, -ROOM_D / 2]} material={revestimento} repeatScale={5} />
      <SuperficieNeutra args={[ROOM_D, ROOM_H]} position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} />

      {bancada && (
        <mesh position={[1.4, 0.5, -1.2]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.06, 0.7]} />
          <Suspense fallback={<meshStandardMaterial color="#d8d4c6" />}>
            <TextureMaterial material={bancada} />
          </Suspense>
        </mesh>
      )}

      <MobiliaDeReferencia tipo={tipo} />
    </>
  );
}

function TextureMaterial({ material }: { material: SuperficieMaterial }) {
  const texture = useTexture(material.imagemUrl, onTextureLoad);
  return <meshStandardMaterial map={texture} roughness={material.roughness ?? 0.4} metalness={material.metalness ?? 0.05} />;
}

/** Configurador 3D do ambiente inteiro — mostra piso/parede/bancada juntos,
 * refletindo as opções já escolhidas pelo cliente em todos os itens do
 * ambiente (não só o item que está sendo editado). O cômodo em si é
 * genérico (placeholder): um modelo .glb real por planta é a Fase 3. */
export function AmbienteConfigurador3D({
  ambienteNome,
  piso,
  revestimento,
  bancada,
  height = 280,
}: {
  ambienteNome: string;
  piso?: SuperficieMaterial;
  revestimento?: SuperficieMaterial;
  bancada?: SuperficieMaterial;
  height?: number;
}) {
  const tipo = tipoAmbientePorNome(ambienteNome);
  const legendas = [piso && `Piso: ${piso.nome}`, revestimento && `Revestimento: ${revestimento.nome}`, bancada && `Bancada: ${bancada.nome}`].filter(Boolean);

  if (!piso && !revestimento && !bancada) {
    return (
      <div
        className="text-soft"
        style={{
          height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          borderRadius: 10,
          border: "1px dashed var(--rule-strong)",
          background: "var(--paper)",
          fontSize: 12.5,
          textAlign: "center",
          padding: 12,
        }}
      >
        <Box size={20} />
        Nenhum item deste ambiente tem material com foto cadastrada ainda.
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
      <div style={{ height }}>
        <Canvas camera={{ position: [3.4, 2.0, 4.2], fov: 42 }} shadows>
          <Suspense fallback={null}>
            <Cena tipo={tipo} piso={piso} revestimento={revestimento} bancada={bancada} />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2.5} maxDistance={8} maxPolarAngle={Math.PI / 2.05} target={[0, 1, -0.3]} />
        </Canvas>
      </div>
      {legendas.length > 0 && (
        <div className="mono" style={{ display: "flex", flexWrap: "wrap", gap: 0, borderTop: "1px solid var(--rule)", fontSize: 11.5 }}>
          {legendas.map((l, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRight: i < legendas.length - 1 ? "1px solid var(--rule)" : undefined, color: "var(--ink-soft)" }}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
