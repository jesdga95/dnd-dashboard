"use client";

import { Heart, RotateCcw, Shield } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useDict } from "@/lib/DictContext";

interface HpCardProps {
  hp: number | null;
  hpMax: number | null;
  tempHp: number;
  onAdjust: (delta: number) => void;
  onUpdate: (patch: { hp?: number | null; hpMax?: number | null }) => void;
  onTempHpChange: (val: number) => void;
}

export function HpCard({ hp, hpMax, tempHp, onAdjust, onUpdate, onTempHpChange }: HpCardProps) {
  const dict = useDict();
  const hpVal = hp ?? 0;
  const hpMaxVal = hpMax ?? 0;
  const total = Math.max(1, hpMaxVal + tempHp);
  const hpPct = (hpVal / total) * 100;
  const tempPct = (tempHp / total) * 100;

  return (
    <div className="rounded-[22px] px-5 py-[18px] shadow-[var(--shadow-md)] border border-black/[0.025]"
      style={{
        background: "radial-gradient(ellipse at top right, rgba(244,123,95,0.15), transparent 60%), var(--color-card)",
      }}
    >
      {/* Label + HP numbers */}
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[13px] font-bold text-[var(--color-ink)] flex items-center gap-2">
          <IconPill tint="peach"><Heart size={14} /></IconPill>
          {dict.hp.title}
        </span>
        <span className="flex items-baseline leading-none gap-1">
          <EditableNumber
            value={hp}
            onChange={(v) => onUpdate({ hp: v })}
            min={0}
            style={{ width: 56, textAlign: "right", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}
          />
          {tempHp > 0 && (
            <span style={{ fontSize: 14, fontWeight: 700, color: "#818cf8", letterSpacing: "-0.01em" }}>
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
          className="hp-fill h-full transition-all duration-300"
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
              className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                font-semibold font-[inherit] cursor-pointer text-[var(--color-ink-soft)]
                hover:bg-[rgba(224,74,58,0.12)] hover:text-[var(--color-coral-deep)] transition-colors duration-150"
              onClick={() => onAdjust(-n)}
            >
              −{n}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[var(--color-bg-warm)] rounded-full p-[3px]">
          {[1, 5, 10].map((n) => (
            <button key={"h" + n}
              className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                font-semibold font-[inherit] cursor-pointer text-[var(--color-ink-soft)]
                hover:bg-[rgba(74,122,58,0.12)] hover:text-[var(--color-mint-deep)] transition-colors duration-150"
              onClick={() => onAdjust(n)}
            >
              +{n}
            </button>
          ))}
        </div>
      </div>

      {/* Temp HP */}
      <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-[12px] font-semibold text-[#818cf8] flex items-center gap-1 shrink-0">
          <Shield size={12} />
          {dict.hp.tempHp}
        </span>
        <EditableNumber
          value={tempHp}
          onChange={(v) => onTempHpChange(v ?? 0)}
          min={0}
          style={{ width: 40, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#818cf8" }}
        />
        <div className="flex gap-1 bg-[var(--color-bg-warm)] rounded-full p-[3px]">
          {[1, 5, 10].map((n) => (
            <button key={"t" + n}
              className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                font-semibold font-[inherit] cursor-pointer text-[var(--color-ink-soft)]
                hover:bg-[rgba(129,140,248,0.15)] hover:text-[#818cf8] transition-colors duration-150"
              onClick={() => onTempHpChange(tempHp + n)}

            >
              +{n}
            </button>
          ))}
          {tempHp > 0 && (
            <button
              onClick={() => onTempHpChange(0)}
              title={dict.hp.clear}
              className="border-none bg-transparent rounded-full px-2 py-[5px]
                font-[inherit] cursor-pointer text-[var(--color-ink-soft)]
                hover:bg-[rgba(224,74,58,0.12)] hover:text-[var(--color-coral-deep)]
                transition-colors duration-150 inline-flex items-center"
            >
              <RotateCcw size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
