import { LEAF_PATH, SPRIG_STEMS, SPRIG_LEAVES, SPRIG_DOTS } from "@/lib/cert-sprig";

const CORNER_POSITION: Record<string, string> = {
  topLeft: "top-2 left-2",
  topRight: "top-2 right-2 -scale-x-100",
  bottomLeft: "bottom-2 left-2 -scale-y-100",
  bottomRight: "bottom-2 right-2 -scale-x-100 -scale-y-100",
};

export function CertCorner({ at }: { at: keyof typeof CORNER_POSITION }) {
  return (
    <svg
      viewBox="0 0 44 44"
      className={`absolute h-14 w-14 ${CORNER_POSITION[at]}`}
      aria-hidden="true"
    >
      {SPRIG_STEMS.map((d) => (
        <path key={d} d={d} stroke="var(--champagne)" strokeWidth={0.6} fill="none" />
      ))}
      {SPRIG_LEAVES.map((leaf, i) => (
        <path
          key={i}
          d={LEAF_PATH}
          fill="var(--champagne)"
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
        />
      ))}
      {SPRIG_DOTS.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill="var(--champagne)" />
      ))}
    </svg>
  );
}
