// Shared laurel-sprig corner ornament geometry for the Certificate of
// Self-Commitment — used by both the landing page's HTML preview and the
// generated PDF, so the two stay visually identical. Coordinates are in a
// 44x44 unit box with the corner at (0,0), branches growing toward (+x,+y).

export const LEAF_PATH = "M0,0 C-3,-4 -3,-11 0,-16 C3,-11 3,-4 0,0 Z";

export const SPRIG_STEMS = [
  "M3,3 C 14,8 26,15 42,34",
  "M3,3 C 7,15 11,25 19,37",
] as const;

export interface SprigLeaf {
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

export const SPRIG_LEAVES: SprigLeaf[] = [
  { x: 7, y: 5, rotate: 48, scale: 0.7 },
  { x: 10, y: 7, rotate: -45, scale: 0.8 },
  { x: 15, y: 10, rotate: 52, scale: 0.95 },
  { x: 19, y: 13, rotate: -38, scale: 0.85 },
  { x: 25, y: 18, rotate: 55, scale: 0.8 },
  { x: 30, y: 23, rotate: -35, scale: 0.7 },
  { x: 36, y: 29, rotate: 50, scale: 0.55 },
  { x: 4, y: 8, rotate: 95, scale: 0.65 },
  { x: 6, y: 13, rotate: 150, scale: 0.85 },
  { x: 9, y: 20, rotate: 105, scale: 0.8 },
  { x: 13, y: 28, rotate: 160, scale: 0.65 },
];

export const SPRIG_DOTS: { x: number; y: number; r: number }[] = [
  { x: 40, y: 33, r: 0.8 },
  { x: 18, y: 35, r: 0.7 },
];
