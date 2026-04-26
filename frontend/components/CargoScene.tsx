"use client";

import { Edges, Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ProductGeometry } from "@/components/ProductGeometry";
import type { ContainerInput, Placement, ProductShape, ShapeConfig } from "@/types/simulation";

type CargoSceneProps = {
  container: ContainerInput;
  placements: Placement[];
  productColors: Record<string, string>;
  productLabels: Record<string, string>;
};

export function CargoScene({ container, placements, productColors, productLabels }: CargoSceneProps) {
  const maxDimension = Math.max(container.width, container.height, container.depth);
  const scale = maxDimension > 0 ? 7 / maxDimension : 0.01;
  const scaled = {
    width: container.width * scale,
    height: container.height * scale,
    depth: container.depth * scale,
  };
  const scenePadding = Math.max(180 * scale, 1.4);
  const peopleX = scaled.width / 2 + Math.max(48 * scale, 0.55);
  const peopleZ = -scaled.depth / 2 + Math.max(120 * scale, 1.2);
  const peopleSpacing = Math.max(42 * scale, 0.48);

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
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
            <planeGeometry args={[scaled.width + scenePadding * 2, scaled.depth + scenePadding * 2]} />
            <meshStandardMaterial color="#e0e8e1" roughness={0.9} />
          </mesh>

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
            const color = productColors[placement.product_id] ?? "#0f766e";
            const label = productLabels[placement.product_id] ?? "";

            return (
              <CargoItem
                key={placement.item_id}
                color={color}
                depth={depth}
                height={height}
                label={label}
                position={[x, y, z]}
                shape={placement.shape ?? "box"}
                shapeConfig={placement.shape_config}
                width={width}
              />
            );
          })}

          <ScalePerson
            height={171 * scale}
            label="Hombre 171 cm"
            position={[peopleX, 0, peopleZ - peopleSpacing / 2]}
            variant="man"
          />
          <ScalePerson
            height={160 * scale}
            label="Mujer 160 cm"
            position={[peopleX, 0, peopleZ + peopleSpacing / 2]}
            variant="woman"
          />
        </group>

        <OrbitControls makeDefault enableDamping target={[0, scaled.height / 2, 0]} />
      </Canvas>
    </div>
  );
}

type CargoItemProps = {
  color: string;
  depth: number;
  height: number;
  label: string;
  position: [number, number, number];
  shape: ProductShape;
  shapeConfig?: ShapeConfig | null;
  width: number;
};

function CargoItem({ color, depth, height, label, position, shape, shapeConfig, width }: CargoItemProps) {
  const transform = shape === "cylinder" ? cylinderTransform(width, height, depth) : null;

  return (
    <mesh
      position={position}
      rotation={transform?.rotation ?? [0, 0, 0]}
      scale={transform?.scale ?? [width, height, depth]}
      castShadow
      receiveShadow
    >
      <ProductGeometry shape={shape} shapeConfig={shapeConfig} />
      <meshStandardMaterial color={color} roughness={0.56} metalness={0.04} transparent opacity={0.9} />
      <Edges color="#17201c" scale={1.002} threshold={15} />
      {label ? (
        <Html center distanceFactor={10}>
          <span className="pointer-events-none rounded-sm bg-white/90 px-1 py-px text-[8px] font-bold leading-none text-[#17201c] shadow-sm">
            {label}
          </span>
        </Html>
      ) : null}
    </mesh>
  );
}

function cylinderTransform(width: number, height: number, depth: number) {
  if (width >= height && width >= depth) {
    return {
      rotation: [0, 0, -Math.PI / 2] as [number, number, number],
      scale: [height, width, depth] as [number, number, number],
    };
  }

  if (depth >= width && depth >= height) {
    return {
      rotation: [Math.PI / 2, 0, 0] as [number, number, number],
      scale: [width, depth, height] as [number, number, number],
    };
  }

  return {
    rotation: [0, 0, 0] as [number, number, number],
    scale: [width, height, depth] as [number, number, number],
  };
}

type ScalePersonProps = {
  height: number;
  label: string;
  position: [number, number, number];
  variant: "man" | "woman";
};

function ScalePerson({ height, label, position, variant }: ScalePersonProps) {
  const palette =
    variant === "man"
      ? { shirt: "#2563eb", pants: "#1f2937", shoes: "#111827", skin: "#c98f67", hair: "#2f241f" }
      : { shirt: "#b4233b", pants: "#334155", shoes: "#111827", skin: "#d7a078", hair: "#3b2a22" };
  const headRadius = height * 0.07;
  const neckHeight = height * 0.04;
  const torsoHeight = height * 0.34;
  const legHeight = height * 0.48;
  const shoeHeight = height * 0.025;
  const legCylinderHeight = legHeight - shoeHeight;
  const limbRadius = height * 0.018;
  const torsoWidth = height * (variant === "man" ? 0.2 : 0.17);
  const torsoDepth = height * 0.075;
  const hipWidth = height * 0.13;
  const shoulderWidth = height * (variant === "man" ? 0.22 : 0.19);
  const armLength = height * 0.32;
  const torsoY = legHeight + torsoHeight / 2;
  const neckY = legHeight + torsoHeight + neckHeight / 2;
  const headY = legHeight + torsoHeight + neckHeight + headRadius;

  return (
    <group position={position}>
      <mesh position={[-hipWidth / 4, shoeHeight + legCylinderHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[limbRadius, limbRadius, legCylinderHeight, 12]} />
        <meshStandardMaterial color={palette.pants} roughness={0.65} />
      </mesh>
      <mesh position={[hipWidth / 4, shoeHeight + legCylinderHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[limbRadius, limbRadius, legCylinderHeight, 12]} />
        <meshStandardMaterial color={palette.pants} roughness={0.65} />
      </mesh>
      <mesh position={[-hipWidth / 4, shoeHeight / 2, height * 0.018]} castShadow receiveShadow>
        <boxGeometry args={[limbRadius * 3, shoeHeight, height * 0.08]} />
        <meshStandardMaterial color={palette.shoes} roughness={0.72} />
      </mesh>
      <mesh position={[hipWidth / 4, shoeHeight / 2, height * 0.018]} castShadow receiveShadow>
        <boxGeometry args={[limbRadius * 3, shoeHeight, height * 0.08]} />
        <meshStandardMaterial color={palette.shoes} roughness={0.72} />
      </mesh>
      <mesh position={[0, torsoY, 0]} castShadow receiveShadow>
        <boxGeometry args={[torsoWidth, torsoHeight, torsoDepth]} />
        <meshStandardMaterial color={palette.shirt} roughness={0.62} />
      </mesh>
      <mesh position={[-shoulderWidth / 2, legHeight + torsoHeight * 0.5, 0]} rotation={[0, 0, -0.12]} castShadow receiveShadow>
        <cylinderGeometry args={[limbRadius, limbRadius, armLength, 12]} />
        <meshStandardMaterial color={palette.skin} roughness={0.65} />
      </mesh>
      <mesh position={[shoulderWidth / 2, legHeight + torsoHeight * 0.5, 0]} rotation={[0, 0, 0.12]} castShadow receiveShadow>
        <cylinderGeometry args={[limbRadius, limbRadius, armLength, 12]} />
        <meshStandardMaterial color={palette.skin} roughness={0.65} />
      </mesh>
      <mesh position={[0, neckY, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[headRadius * 0.28, headRadius * 0.28, neckHeight, 12]} />
        <meshStandardMaterial color={palette.skin} roughness={0.6} />
      </mesh>
      {variant === "woman" ? (
        <mesh position={[0, headY - headRadius * 0.18, -headRadius * 0.72]} castShadow receiveShadow>
          <boxGeometry args={[headRadius * 1.35, headRadius * 1.45, headRadius * 0.36]} />
          <meshStandardMaterial color={palette.hair} roughness={0.75} />
        </mesh>
      ) : null}
      <mesh position={[0, headY, 0]} castShadow receiveShadow>
        <sphereGeometry args={[headRadius, 20, 16]} />
        <meshStandardMaterial color={palette.skin} roughness={0.58} />
      </mesh>
      {variant === "man" ? (
        <mesh position={[0, headY + headRadius * 0.34, -headRadius * 0.12]} castShadow receiveShadow>
          <boxGeometry args={[headRadius * 1.25, headRadius * 0.28, headRadius * 0.9]} />
          <meshStandardMaterial color={palette.hair} roughness={0.74} />
        </mesh>
      ) : null}
      <mesh position={[torsoWidth / 2 + height * 0.05, height / 2, 0]}>
        <cylinderGeometry args={[height * 0.004, height * 0.004, height, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <Html center distanceFactor={8} position={[0, height + height * 0.08, 0]}>
        <span className="pointer-events-none whitespace-nowrap rounded-sm bg-white/90 px-1.5 py-px text-[8px] font-bold leading-none text-[#17201c] shadow-sm">
          {label}
        </span>
      </Html>
    </group>
  );
}
