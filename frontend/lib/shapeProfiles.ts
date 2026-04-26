import type { ShapeConfig, ShapeProfilePoint } from "@/types/simulation";

const minPointGap = 0.04;

export const lampProfile: ShapeProfilePoint[] = [
  { height_ratio: 0, width_ratio: 0.64, depth_ratio: 0.64 },
  { height_ratio: 0.14, width_ratio: 0.64, depth_ratio: 0.64 },
  { height_ratio: 0.24, width_ratio: 0.24, depth_ratio: 0.24 },
  { height_ratio: 0.62, width_ratio: 0.2, depth_ratio: 0.2 },
  { height_ratio: 0.76, width_ratio: 0.92, depth_ratio: 0.92 },
  { height_ratio: 1, width_ratio: 0.58, depth_ratio: 0.58 },
];

export const vaseProfile: ShapeProfilePoint[] = [
  { height_ratio: 0, width_ratio: 0.48, depth_ratio: 0.48 },
  { height_ratio: 0.2, width_ratio: 0.74, depth_ratio: 0.74 },
  { height_ratio: 0.52, width_ratio: 0.88, depth_ratio: 0.88 },
  { height_ratio: 0.84, width_ratio: 0.4, depth_ratio: 0.4 },
  { height_ratio: 1, width_ratio: 0.34, depth_ratio: 0.34 },
];

export const irregularProfile: ShapeProfilePoint[] = [
  { height_ratio: 0, width_ratio: 0.72, depth_ratio: 0.72 },
  { height_ratio: 0.18, width_ratio: 0.46, depth_ratio: 0.46 },
  { height_ratio: 0.42, width_ratio: 0.82, depth_ratio: 0.82 },
  { height_ratio: 0.72, width_ratio: 0.5, depth_ratio: 0.5 },
  { height_ratio: 1, width_ratio: 0.66, depth_ratio: 0.66 },
];

export const defaultShapeConfig: ShapeConfig = {
  top_width_ratio: 0.55,
  top_depth_ratio: 0.55,
  radial_segments: 24,
  profile: lampProfile,
};

export const profilePresets = [
  { id: "lamp", label: "Lampara", profile: lampProfile },
  { id: "vase", label: "Jarron", profile: vaseProfile },
  { id: "free", label: "Libre", profile: irregularProfile },
];

export function normalizeShapeConfig(config?: ShapeConfig | null): ShapeConfig {
  return {
    top_width_ratio: clampNumber(config?.top_width_ratio ?? defaultShapeConfig.top_width_ratio, 0.05, 1),
    top_depth_ratio: clampNumber(config?.top_depth_ratio ?? defaultShapeConfig.top_depth_ratio, 0.05, 1),
    radial_segments: clampInteger(config?.radial_segments ?? defaultShapeConfig.radial_segments, 3, 64),
    profile: normalizeShapeProfile(config?.profile),
  };
}

export function normalizeShapeProfile(profile?: ShapeProfilePoint[] | null): ShapeProfilePoint[] {
  const source = profile?.length ? profile : lampProfile;
  const cleaned = source
    .map((point) => ({
      height_ratio: clampNumber(point.height_ratio, 0, 1),
      width_ratio: clampNumber(point.width_ratio, 0.05, 1),
      depth_ratio: clampNumber(point.depth_ratio, 0.05, 1),
    }))
    .sort((a, b) => a.height_ratio - b.height_ratio)
    .slice(0, 12);

  const points = cleaned.length >= 2 ? cleaned : lampProfile;
  const normalized: ShapeProfilePoint[] = [{ ...points[0], height_ratio: 0 }];

  for (let index = 1; index < points.length - 1; index += 1) {
    const remainingInteriorPoints = points.length - index - 1;
    const min = normalized[index - 1].height_ratio + minPointGap;
    const max = 1 - remainingInteriorPoints * minPointGap;
    normalized.push({ ...points[index], height_ratio: clampNumber(points[index].height_ratio, min, max) });
  }

  normalized.push({ ...points[points.length - 1], height_ratio: 1 });

  return normalized;
}

export function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampInteger(value: number, min: number, max: number) {
  return Math.round(clampNumber(value, min, max));
}
