"use client";
import { useMemo } from "react";

interface SparkleBackgroundProps {
  color: string;
  chars: string[];
  dim?: boolean;
}

// Deterministic pseudo-random in [0,1) seeded by `n` — pure (no Math.random),
// so the layout is stable across renders and matches between SSR and client.
function seeded(n: number) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

export function SparkleBackground({ color, chars, dim = false }: SparkleBackgroundProps) {
  const stars = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      char: chars[Math.floor(seeded(i * 12.9898 + 1.7) * chars.length)],
      size: seeded(i * 78.233 + 4.1) * 30 + 7,
      top: seeded(i * 37.719 + 9.3) * 90 + 5,
      left: seeded(i * 24.113 + 6.5) * 90 + 5,
      opacity: seeded(i * 53.317 + 2.9) * 0.4 + 0.08,
      rotate: seeded(i * 93.989 + 8.2) * 40 - 20,
    })), [chars]);

  return (
    <>
      {stars.map((s, i) => (
        <span key={i} className="absolute select-none pointer-events-none transition-all duration-300"
          style={{
            top: `${s.top}%`, left: `${s.left}%`,
            fontSize: `${s.size}px`, lineHeight: 1,
            color,
            opacity: dim ? s.opacity * 0.25 : s.opacity,
            transform: `rotate(${s.rotate}deg)`,
          }}>
          {s.char}
        </span>
      ))}
    </>
  );
}
