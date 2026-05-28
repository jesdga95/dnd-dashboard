"use client";

import { Coins } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useDict } from "@/lib/DictContext";
import type { Character } from "@/lib/types";

interface CoinPurseProps {
  gold: number;
  silver: number;
  onUpdate: (patch: Partial<Character>) => void;
}

export function CoinPurse({ gold, silver, onUpdate }: CoinPurseProps) {
  const dict = useDict();
  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="sand"><Coins size={14} /></IconPill>}
        title={dict.coins.title}
      />
      <div className="flex gap-2.5 max-[700px]:flex-col">
        <div className="flex-1 rounded-[14px] px-[14px] py-3 flex items-center gap-2.5"
          style={{ background: "linear-gradient(135deg, #f7e3a8, #e8c878)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center
            bg-white/50 text-[13px] font-extrabold text-[#8c6a1a]">G</div>
          <div>
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-black/50">{dict.coins.gold}</div>
            <div className="text-[20px] font-extrabold tracking-tight leading-none">
              <EditableNumber
                value={gold}
                onChange={(v) => onUpdate({ gold: Math.max(0, v) })}
                min={0}
                style={{ width: 70, fontWeight: 800, fontSize: 20, textAlign: "left" }}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-[14px] px-[14px] py-3 flex items-center gap-2.5"
          style={{ background: "linear-gradient(135deg, #ece8df, #c8c2b4)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center
            bg-white/50 text-[13px] font-extrabold text-[#5a5650]">S</div>
          <div>
            <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-black/50">{dict.coins.silver}</div>
            <div className="text-[20px] font-extrabold tracking-tight leading-none">
              <EditableNumber
                value={silver}
                onChange={(v) => onUpdate({ silver: Math.max(0, v) })}
                min={0}
                style={{ width: 70, fontWeight: 800, fontSize: 20, textAlign: "left" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
