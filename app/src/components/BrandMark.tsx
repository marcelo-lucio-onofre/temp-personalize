interface BrandMarkProps {
  size?: number;
  color?: string;
  withLabel?: boolean;
  light?: boolean;
}

/** The plantta ascending-dots mark. Kept identical to the original prototype
 * per instruction: name/brand stay as-is until a final brand decision. */
export function BrandMark({ size = 22, color = "var(--green)", withLabel = true, light = true }: BrandMarkProps) {
  return (
    <span className="brandmark">
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="5" cy="17" r="2.3" fill={color} />
        <circle cx="11" cy="10.5" r="2.3" fill={color} />
        <circle cx="17" cy="4" r="2.3" fill={color} />
        <path d="M5 17 L11 10.5 L17 4" stroke={color} strokeWidth="1.8" fill="none" />
      </svg>
      {withLabel && <span style={{ color: light ? "#fff" : "var(--ink)" }}>plantta</span>}
    </span>
  );
}
