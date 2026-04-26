"use client";

import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { clampInteger, clampNumber, normalizeShapeProfile } from "@/lib/shapeProfiles";
import type { ProductShape, ShapeConfig, ShapeProfilePoint } from "@/types/simulation";

export function ProductGeometry({ shape, shapeConfig }: { shape: ProductShape; shapeConfig?: ShapeConfig | null }) {
  if (shape === "cylinder") {
    return <cylinderGeometry args={[0.5, 0.5, 1, clampInteger(shapeConfig?.radial_segments ?? 24, 3, 64)]} />;
  }

  if (shape === "pyramid") {
    return <TaperedBoxGeometry topWidthRatio={0.05} topDepthRatio={0.05} />;
  }

  if (shape === "custom") {
    if (shapeConfig?.profile?.length) {
      return <ProfileBoxGeometry profile={shapeConfig.profile} />;
    }

    return (
      <TaperedBoxGeometry
        topWidthRatio={clampNumber(shapeConfig?.top_width_ratio ?? 0.55, 0.05, 1)}
        topDepthRatio={clampNumber(shapeConfig?.top_depth_ratio ?? 0.55, 0.05, 1)}
      />
    );
  }

  return <boxGeometry args={[1, 1, 1]} />;
}

function ProfileBoxGeometry({ profile }: { profile: ShapeProfilePoint[] }) {
  const normalizedProfile = useMemo(() => normalizeShapeProfile(profile), [profile]);
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    for (const point of normalizedProfile) {
      const halfWidth = clampNumber(point.width_ratio, 0.05, 1) / 2;
      const halfDepth = clampNumber(point.depth_ratio, 0.05, 1) / 2;
      const y = clampNumber(point.height_ratio, 0, 1) - 0.5;

      vertices.push(
        -halfWidth, y, -halfDepth,
        halfWidth, y, -halfDepth,
        halfWidth, y, halfDepth,
        -halfWidth, y, halfDepth,
      );
    }

    for (let level = 0; level < normalizedProfile.length - 1; level += 1) {
      const current = level * 4;
      const next = current + 4;

      indices.push(
        current, next, next + 1,
        current, next + 1, current + 1,
        current + 1, next + 1, next + 2,
        current + 1, next + 2, current + 2,
        current + 2, next + 2, next + 3,
        current + 2, next + 3, current + 3,
        current + 3, next + 3, next,
        current + 3, next, current,
      );
    }

    const top = (normalizedProfile.length - 1) * 4;
    indices.push(
      0, 2, 1,
      0, 3, 2,
      top, top + 1, top + 2,
      top, top + 2, top + 3,
    );

    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [normalizedProfile]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <primitive object={geometry} attach="geometry" />;
}

function TaperedBoxGeometry({ topWidthRatio, topDepthRatio }: { topWidthRatio: number; topDepthRatio: number }) {
  const geometry = useMemo(() => {
    const topX = clampNumber(topWidthRatio, 0.05, 1) / 2;
    const topZ = clampNumber(topDepthRatio, 0.05, 1) / 2;
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([
      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,
      0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,
      -topX, 0.5, -topZ,
      topX, 0.5, -topZ,
      topX, 0.5, topZ,
      -topX, 0.5, topZ,
    ]);

    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setIndex([
      0, 2, 1,
      0, 3, 2,
      4, 5, 6,
      4, 6, 7,
      0, 1, 5,
      0, 5, 4,
      1, 2, 6,
      1, 6, 5,
      2, 3, 7,
      2, 7, 6,
      3, 0, 4,
      3, 4, 7,
    ]);
    geometry.computeVertexNormals();
    return geometry;
  }, [topDepthRatio, topWidthRatio]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <primitive object={geometry} attach="geometry" />;
}
