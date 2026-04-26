"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { ContainerInput, Placement } from "@/types/simulation";

type CargoSceneProps = {
  container: ContainerInput;
  placements: Placement[];
};

const palette = [
  "#0f766e",
  "#2563eb",
  "#be123c",
  "#7c3aed",
  "#ca8a04",
  "#15803d",
  "#c2410c",
  "#475569",
];

export function CargoScene({ container, placements }: CargoSceneProps) {
  const maxDimension = Math.max(container.width, container.height, container.depth);
  const scale = maxDimension > 0 ? 7 / maxDimension : 1;
  const scaled = {
    width: container.width * scale,
    height: container.height * scale,
    depth: container.depth * scale,
  };

  const productColor = new Map<string, string>();
  placements.forEach((placement) => {
    if (!productColor.has(placement.product_id)) {
      productColor.set(placement.product_id, palette[productColor.size % palette.length]);
    }
  });

  return (
    <div className="h-[440px] min-h-[320px] w-full overflow-hidden border border-[var(--line)] bg-[#e9eeea] md:h-[calc(100vh-260px)]">
      <Canvas
        camera={{ position: [6, 4.5, 8], fov: 42 }}
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        data-testid="cargo-canvas"
      >
        <color attach="background" args={["#e9eeea"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 8, 5]} intensity={1.5} castShadow />

        <group>
          <mesh position={[0, scaled.height / 2, 0]}>
            <boxGeometry args={[scaled.width, scaled.height, scaled.depth]} />
            <meshBasicMaterial color="#334155" wireframe transparent opacity={0.32} />
          </mesh>

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[scaled.width, scaled.depth]} />
            <meshStandardMaterial color="#d7ded8" roughness={0.85} />
          </mesh>

          {placements.map((placement) => {
            const width = placement.dimensions.width * scale;
            const height = placement.dimensions.height * scale;
            const depth = placement.dimensions.depth * scale;
            const x = (placement.position.x + placement.dimensions.width / 2 - container.width / 2) * scale;
            const y = (placement.position.y + placement.dimensions.height / 2) * scale;
            const z = (placement.position.z + placement.dimensions.depth / 2 - container.depth / 2) * scale;
            const color = productColor.get(placement.product_id) ?? palette[0];

            return (
              <mesh key={placement.item_id} position={[x, y, z]} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color={color} roughness={0.56} metalness={0.04} transparent opacity={0.9} />
              </mesh>
            );
          })}
        </group>

        <OrbitControls makeDefault enableDamping target={[0, scaled.height / 2, 0]} />
      </Canvas>
    </div>
  );
}
