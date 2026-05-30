"use client";
import { useMemo } from "react";

interface SparkleBackgroundProps {
  color: string;
  chars: string[];
  dim?: boolean;
}

export function SparkleBackground({ color, chars, dim = false }: SparkleBackgroundProps) {
  const stars = useMemo(() =>
    Array.from({ length: 18 }, () => ({
      char: chars[Math.floor(Math.random() * chars.length)],
      size: Math.random() * 30 + 7,
      top: Math.random() * 90 + 5,
      left: Math.random() * 90 + 5,
      opacity: Math.random() * 0.4 + 0.08,
      rotate: Math.random() * 40 - 20,
    })), []);

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
