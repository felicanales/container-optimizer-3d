"use client";

import { Edges, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Lamp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ProductGeometry } from "@/components/ProductGeometry";
import {
  clampNumber,
  defaultShapeConfig,
  normalizeShapeProfile,
  profilePresets,
} from "@/lib/shapeProfiles";
import type { ShapeConfig, ShapeProfilePoint } from "@/types/simulation";

type ShapeProfileEditorProps = {
  config: ShapeConfig;
  onChange: (config: ShapeConfig) => void;
};

type DragMode = "width" | "depth";

type DragState = {
  index: number;
  mode: DragMode;
  x: number;
  y: number;
};

const minPointGap = 0.04;

export function ShapeProfileEditor({ config, onChange }: ShapeProfileEditorProps) {
  const dragRef = useRef<DragState | null>(null);
  const [active, setActive] = useState<{ index: number; mode: DragMode } | null>(null);
  const profile = useMemo(() => normalizeShapeProfile(config.profile), [config.profile]);

  function emitProfile(nextProfile: ShapeProfilePoint[]) {
    onChange({
      ...defaultShapeConfig,
      ...config,
      profile: normalizeShapeProfile(nextProfile),
    });
  }

  function updatePoint(index: number, patch: Partial<ShapeProfilePoint>) {
    const nextProfile = profile.map((point, pointIndex) => {
      if (pointIndex !== index) return point;

      const minHeight = index <= 0 ? 0 : profile[index - 1].height_ratio + minPointGap;
      const maxHeight = index >= profile.length - 1 ? 1 : profile[index + 1].height_ratio - minPointGap;
      const heightRatio =
        index === 0
          ? 0
          : index === profile.length - 1
            ? 1
            : clampNumber(patch.height_ratio ?? point.height_ratio, minHeight, maxHeight);

      return {
        height_ratio: heightRatio,
        width_ratio: clampNumber(patch.width_ratio ?? point.width_ratio, 0.05, 1),
        depth_ratio: clampNumber(patch.depth_ratio ?? point.depth_ratio, 0.05, 1),
      };
    });

    emitProfile(nextProfile);
  }

  function beginDrag(index: number, mode: DragMode, event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (event.target instanceof Element) {
      event.target.setPointerCapture(event.pointerId);
    }
    dragRef.current = { index, mode, x: event.clientX, y: event.clientY };
    setActive({ index, mode });
  }

  function continueDrag(event: ThreeEvent<PointerEvent>) {
    const drag = dragRef.current;
    if (!drag) return;

    event.stopPropagation();
    const point = profile[drag.index];
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };

    const sizeDelta = deltaX / 180;
    const heightDelta = -deltaY / 170;
    const nextHeight = point.height_ratio + heightDelta;

    if (drag.mode === "width") {
      updatePoint(drag.index, {
        height_ratio: nextHeight,
        width_ratio: point.width_ratio + sizeDelta,
      });
      return;
    }

    updatePoint(drag.index, {
      height_ratio: nextHeight,
      depth_ratio: point.depth_ratio + sizeDelta,
    });
  }

  function endDrag() {
    dragRef.current = null;
    setActive(null);
  }

  function addPoint() {
    if (profile.length >= 10) return;

    let gapIndex = 0;
    let largestGap = 0;
    for (let index = 0; index < profile.length - 1; index += 1) {
      const gap = profile[index + 1].height_ratio - profile[index].height_ratio;
      if (gap > largestGap) {
        largestGap = gap;
        gapIndex = index;
      }
    }

    const before = profile[gapIndex];
    const after = profile[gapIndex + 1];
    emitProfile([
      ...profile.slice(0, gapIndex + 1),
      {
        height_ratio: (before.height_ratio + after.height_ratio) / 2,
        width_ratio: (before.width_ratio + after.width_ratio) / 2,
        depth_ratio: (before.depth_ratio + after.depth_ratio) / 2,
      },
      ...profile.slice(gapIndex + 1),
    ]);
  }

  function removePoint(index: number) {
    if (profile.length <= 3 || index === 0 || index === profile.length - 1) return;
    emitProfile(profile.filter((_, pointIndex) => pointIndex !== index));
    endDrag();
  }

  return (
    <div className="mt-3 border border-[var(--line)] bg-[#fbfcfb] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {profilePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => emitProfile(preset.profile)}
            className="inline-flex min-h-8 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-2.5 text-xs font-semibold"
            title={`Usar perfil ${preset.label}`}
          >
            {preset.id === "lamp" ? <Lamp size={14} aria-hidden="true" /> : <Pencil size={14} aria-hidden="true" />}
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addPoint}
          disabled={profile.length >= 10}
          className="inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--line)] bg-white px-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          title="Agregar punto"
        >
          <Plus size={15} aria-hidden="true" />
        </button>
        <span className="inline-flex min-h-8 items-center gap-1.5 px-1 text-xs text-[var(--muted)]">
          <span className="h-2.5 w-2.5 bg-[#0f766e]" />
          Ancho
        </span>
        <span className="inline-flex min-h-8 items-center gap-1.5 px-1 text-xs text-[var(--muted)]">
          <span className="h-2.5 w-2.5 bg-[#2563eb]" />
          Prof.
        </span>
      </div>

      <div className="mt-3 h-64 overflow-hidden border border-[var(--line)] bg-[#e9eeea]">
        <Canvas camera={{ position: [2.2, 1.7, 3.1], fov: 38 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
          <color attach="background" args={["#e9eeea"]} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[3, 5, 4]} intensity={1.25} />
          <CustomShapeEditorScene
            active={active}
            config={config}
            onDragEnd={endDrag}
            onDragMove={continueDrag}
            onDragStart={beginDrag}
            profile={profile}
          />
          <OrbitControls makeDefault enableDamping enabled={active === null} target={[0, 0, 0]} />
        </Canvas>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {profile.map((point, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border border-[var(--line)] bg-white px-2 py-1.5 text-xs"
          >
            <span className="min-w-0 flex-1 truncate">
              N{index + 1} A{Math.round(point.width_ratio * 100)} P{Math.round(point.depth_ratio * 100)}
            </span>
            <button
              type="button"
              onClick={() => removePoint(index)}
              disabled={index === 0 || index === profile.length - 1 || profile.length <= 3}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--line)] text-[#9f1239] disabled:cursor-not-allowed disabled:opacity-40"
              title="Eliminar punto"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomShapeEditorScene({
  active,
  config,
  onDragEnd,
  onDragMove,
  onDragStart,
  profile,
}: {
  active: { index: number; mode: DragMode } | null;
  config: ShapeConfig;
  onDragEnd: () => void;
  onDragMove: (event: ThreeEvent<PointerEvent>) => void;
  onDragStart: (index: number, mode: DragMode, event: ThreeEvent<PointerEvent>) => void;
  profile: ShapeProfilePoint[];
}) {
  return (
    <group onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd} onPointerMissed={onDragEnd}>
      <mesh scale={[1.35, 1.8, 1.35]} castShadow receiveShadow>
        <ProductGeometry shape="custom" shapeConfig={{ ...config, profile }} />
        <meshStandardMaterial color="#0f766e" roughness={0.58} metalness={0.03} transparent opacity={0.9} />
        <Edges color="#17201c" scale={1.003} threshold={15} />
      </mesh>

      <mesh scale={[1.35, 1.8, 1.35]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.22} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]}>
        <planeGeometry args={[1.85, 1.85]} />
        <meshStandardMaterial color="#d7ded8" roughness={0.9} />
      </mesh>

      {profile.map((point, index) => (
        <group key={index}>
          <ControlHandle
            active={active?.index === index && active.mode === "width"}
            color="#0f766e"
            mode="width"
            onDragStart={(event) => onDragStart(index, "width", event)}
            position={[point.width_ratio * 0.68 + 0.14, point.height_ratio * 1.8 - 0.9, 0.76]}
          />
          <ControlHandle
            active={active?.index === index && active.mode === "depth"}
            color="#2563eb"
            mode="depth"
            onDragStart={(event) => onDragStart(index, "depth", event)}
            position={[0.76, point.height_ratio * 1.8 - 0.9, point.depth_ratio * 0.68 + 0.14]}
          />
        </group>
      ))}
    </group>
  );
}

function ControlHandle({
  active,
  color,
  mode,
  onDragStart,
  position,
}: {
  active: boolean;
  color: string;
  mode: DragMode;
  onDragStart: (event: ThreeEvent<PointerEvent>) => void;
  position: [number, number, number];
}) {
  return (
    <mesh position={position} onPointerDown={onDragStart} scale={active ? 1.25 : 1} userData={{ mode }}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}
