"use client";

import { Shield, ShieldCheck, Zap } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useDict } from "@/lib/DictContext";
import { abilityMod } from "@/lib/utils";
import type { Abilities, AbilityKey } from "@/lib/types";

const ABILITY_KEYS: AbilityKey[] = [
  "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma",
];

interface AbilityScoresProps {
  abilities: Abilities;
  proficiency: number | null;
  onUpdate: (key: AbilityKey, val: number | null) => void;
  onToggleSave: (key: AbilityKey) => void;
}

export function AbilityScores({ abilities, proficiency, onUpdate, onToggleSave }: AbilityScoresProps) {
  const dict = useDict();
  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="lavender"><Zap size={14} /></IconPill>}
        title={dict.abilities.title}
        sub={dict.abilities.subtitle}
      />
      <div className="grid grid-cols-6 gap-1 max-[1100px]:grid-cols-3 max-[460px]:grid-cols-2">
        {ABILITY_KEYS.map((key) => {
          const { score, saveProficient } = abilities[key];
          const { val: modVal, str: modStr } = abilityMod(score ?? 10);
          const saveBonus = modVal + (saveProficient ? (proficiency ?? 0) : 0);
          const saveBonusStr = saveBonus >= 0 ? `+${saveBonus}` : String(saveBonus);
          return (
            <div key={key}
              className="text-center px-2 py-3 rounded-[12px] hover:bg-[var(--color-bg-warm)] transition-colors duration-150">
              <div className="text-[10px] font-bold tracking-[0.1em] text-[var(--color-muted)] uppercase">
                {dict.abilities.abbr[key]}
              </div>
              <div className="text-[28px] font-extrabold tracking-tight leading-none my-1.5 text-[var(--color-ink)] max-[460px]:text-[24px]">
                <EditableNumber
                  value={score}
                  onChange={(v) => onUpdate(key, v)}
                  style={{ width: 52, textAlign: "center", fontWeight: 800 }}
                />
              </div>
              <span className="inline-block bg-[var(--color-bg-warm)] rounded-full px-2 py-0.5 text-[12px] font-bold text-[var(--color-ink)]">
                {modStr}
              </span>
              <button
                onClick={() => onToggleSave(key)}
                title={saveBonusStr}
                className={`flex items-center justify-center gap-1 mt-2 mx-auto cursor-pointer transition-colors duration-150
                  ${saveProficient ? "text-[var(--color-lavender-deep)]" : "text-[var(--color-line)]"}`}
              >
                {saveProficient ? <ShieldCheck size={13} /> : <Shield size={13} />}
                <span className={`text-[10px] font-bold font-mono ${saveProficient ? "text-[var(--color-lavender-deep)]" : "text-[var(--color-muted-soft)]"}`}>
                  {saveBonusStr}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
