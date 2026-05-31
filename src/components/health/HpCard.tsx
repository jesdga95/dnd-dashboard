"use client";

import { useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useDict } from "@/lib/DictContext";

interface HpCardProps {
  hp: number | null;
  hpMax: number | null;
  tempHp: number;
  onAdjust: (delta: number) => void;
  onUpdate: (patch: { hp?: number | null; hpMax?: number | null }) => void;
}

export function HpCard({ hp, hpMax, tempHp, onAdjust, onUpdate }: HpCardProps) {
  const dict = useDict();
  const hpVal = hp ?? 0;
  const hpMaxVal = hpMax ?? 0;
  const total = Math.max(1, hpMaxVal + tempHp);
  const hpPct = (hpVal / total) * 100;
  const tempPct = (tempHp / total) * 100;
  // "Bloodied" = at or below half of max HP (5e parlance). Measured against hpMax, not total, so temp HP doesn't flicker it.
  const bloodied = hpVal > 0 && hpVal <= hpMaxVal / 2;
  const barRef = useRef<HTMLDivElement>(null);
  const prevBloodied = useRef(bloodied);
  useEffect(() => {
    const el = barRef.current;
    if (el && bloodied && !prevBloodied.current) {
      el.classList.remove("hp-flinch");
      void el.offsetWidth; // force reflow so the animation restarts on each crossing
      el.classList.add("hp-flinch");
    }
    prevBloodied.current = bloodied;
  }, [bloodied]);

  return (
    <div className="rounded-[22px] px-5 py-[18px] shadow-[var(--shadow-md)] border border-black/[0.025]"
      style={{
        background: "radial-gradient(ellipse at top right, rgba(244,123,95,0.15), transparent 60%), var(--color-card)",
      }}
    >
      {/* Label + HP numbers */}
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[14px] font-bold text-[var(--color-ink)] flex items-center gap-2">
          <IconPill tint="peach"><Heart size={14} /></IconPill>
          {dict.hp.title}
          {bloodied && (
            <span className="text-[11px] font-bold uppercase tracking-[0.06em]
              bg-[var(--color-peach)] text-[var(--color-coral-deep)] rounded-full px-2 py-[2px]">
              {dict.hp.bloodied}
            </span>
          )}
        </span>
        <span className="flex items-baseline leading-none gap-1">
          <EditableNumber
            value={hp}
            onChange={(v) => onUpdate({ hp: v })}
            min={0}
            style={{ width: 56, textAlign: "right", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em",
              color: bloodied ? "var(--color-coral-deep)" : undefined }}
          />
          {tempHp > 0 && (
            <span style={{ fontSize: 15, fontWeight: 700, color: "#818cf8", letterSpacing: "-0.01em" }}>
              (+{tempHp})
            </span>
          )}
          <em className="not-italic text-[var(--color-muted)] text-[18px] font-semibold mx-0.5">/</em>
          <EditableNumber
            value={hpMax}
            onChange={(v) => onUpdate({ hpMax: v })}
            min={1}
            style={{ width: 42, textAlign: "left", fontSize: 18, fontWeight: 600, color: "var(--color-muted)" }}
          />
        </span>
      </div>

      {/* Unified HP + temp HP bar */}
      <div className="h-[10px] bg-[var(--color-line-soft)] rounded-full mt-2.5 overflow-hidden flex">
        <div
          ref={barRef}
          className={`hp-fill h-full transition-all duration-300${bloodied ? " hp-bloodied-fill" : ""}`}
          style={{ width: `${hpPct}%`, ...(tempHp > 0 && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }) }}
        />
        {tempHp > 0 && (
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${tempPct}%`,
              background: "linear-gradient(90deg, #818cf8, #60a5fa)",
            }}
          />
        )}
      </div>

      {/* Quick buttons */}
      <div className="flex gap-1.5 mt-3">
        <div className="flex gap-1 bg-[var(--color-bg-warm)] rounded-full p-[3px]">
          {[1, 5, 10].map((n) => (
            <button key={"d" + n}
              className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                font-semibold font-[inherit] cursor-pointer text-[var(--color-ink-soft)]
                hover:bg-[rgba(224,74,58,0.12)] hover:text-[var(--color-coral-deep)]
                active:scale-95 transition-[background,color,transform] duration-150"
              onClick={() => onAdjust(-n)}
            >
              −{n}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[var(--color-bg-warm)] rounded-full p-[3px]">
          {[1, 5, 10].map((n) => (
            <button key={"h" + n}
              className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                font-semibold font-[inherit] cursor-pointer text-[var(--color-ink-soft)]
                hover:bg-[rgba(74,122,58,0.12)] hover:text-[var(--color-mint-deep)]
                active:scale-95 transition-[background,color,transform] duration-150"
              onClick={() => onAdjust(n)}
            >
              +{n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
