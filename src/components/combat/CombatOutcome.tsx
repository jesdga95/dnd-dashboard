"use client";

import { Trophy, Skull, Sparkles } from "lucide-react";
import { useDict } from "@/lib/DictContext";

// Full-panel flourish shown when combat ends decisively. Covers the combat
// panel (its `fixed` root is the positioning context) and gates the results.
// Victory = all foes down; defeat = the whole party down.
const SPARKS = [
  { top: "26%", left: "22%", size: 16, delay: "0s" },
  { top: "20%", left: "74%", size: 13, delay: "0.5s" },
  { top: "60%", left: "16%", size: 12, delay: "0.9s" },
  { top: "64%", left: "80%", size: 18, delay: "0.3s" },
  { top: "40%", left: "88%", size: 11, delay: "1.1s" },
  { top: "44%", left: "9%", size: 14, delay: "0.7s" },
];

export function CombatOutcome({
  variant,
  onOk,
  subtitle,
}: {
  variant: "victory" | "defeat";
  onOk: () => void;
  subtitle?: string;
}) {
  const dict = useDict();
  const victory = variant === "victory";
  const accent = victory ? "var(--color-coral)" : "#c96b6b";
  const Icon = victory ? Trophy : Skull;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center px-6 overflow-hidden"
      style={{
        background: victory
          ? "radial-gradient(ellipse 85% 65% at 50% 42%, rgba(244,123,95,0.22), rgba(8,5,3,0.94))"
          : "radial-gradient(ellipse 85% 65% at 50% 42%, rgba(120,22,22,0.28), rgba(6,4,4,0.96))",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        animation: "cvFade 0.35s ease-out",
      }}
    >
      <style>{`
        @keyframes cvFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cvPop {
          0% { opacity: 0; transform: scale(0.6) translateY(14px) }
          60% { transform: scale(1.07) }
          100% { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes cvGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(244,123,95,0.55)) }
          50% { filter: drop-shadow(0 0 24px rgba(244,123,95,0.95)) }
        }
        @keyframes cvRise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cvTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.6) rotate(0deg) }
          50% { opacity: 1; transform: scale(1) rotate(15deg) }
        }
      `}</style>

      {victory &&
        SPARKS.map((s, i) => (
          <Sparkles
            key={i}
            size={s.size}
            className="absolute"
            style={{ top: s.top, left: s.left, color: accent, animation: `cvTwinkle 2.2s ease-in-out ${s.delay} infinite` }}
          />
        ))}

      <div className="flex flex-col items-center text-center" style={{ animation: "cvPop 0.5s cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div
          className="mb-4"
          style={
            victory
              ? { color: accent, animation: "cvGlow 2s ease-in-out infinite" }
              : { color: accent, filter: "drop-shadow(0 0 14px rgba(201,107,107,0.6))" }
          }
        >
          <Icon size={56} />
        </div>
        <div className="text-[30px] font-extrabold tracking-tight text-white leading-none">
          {victory ? dict.combatDamage.victory : dict.combatDamage.defeat}
        </div>
        {subtitle && <div className="text-[14px] font-semibold text-white/55 mt-2">{subtitle}</div>}
        <button
          onClick={onOk}
          className="mt-6 px-8 py-2.5 rounded-full text-[14px] font-bold cursor-pointer font-[inherit] transition-transform hover:scale-[1.03]"
          style={{
            background: victory ? "var(--color-coral)" : "rgba(201,107,107,0.9)",
            color: "white",
            border: `1px solid ${victory ? "rgba(244,123,95,0.5)" : "rgba(201,107,107,0.5)"}`,
            animation: "cvRise 0.55s ease-out 0.2s both",
          }}
        >
          {dict.combatDamage.victoryOk}
        </button>
      </div>
    </div>
  );
}
