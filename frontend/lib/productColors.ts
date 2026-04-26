export const productPalette = [
  "#0f766e",
  "#2563eb",
  "#be123c",
  "#7c3aed",
  "#ca8a04",
  "#15803d",
  "#c2410c",
  "#475569",
  "#0891b2",
  "#a16207",
];

export function getProductColor(index: number) {
  return productPalette[index % productPalette.length];
}
