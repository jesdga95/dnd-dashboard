"use client";

import { Shield } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict } from "@/lib/DictContext";
import { abilityMod } from "@/lib/utils";
import type { Abilities, AbilityKey, SkillProficiency } from "@/lib/types";

interface SkillDef {
  name: string;
  ability: AbilityKey;
}

const SKILLS: SkillDef[] = [
  { name: "Acrobatics", ability: "Dexterity" },
  { name: "Animal Handling", ability: "Wisdom" },
  { name: "Arcana", ability: "Intelligence" },
  { name: "Athletics", ability: "Strength" },
  { name: "Deception", ability: "Charisma" },
  { name: "History", ability: "Intelligence" },
  { name: "Insight", ability: "Wisdom" },
  { name: "Intimidation", ability: "Charisma" },
  { name: "Investigation", ability: "Intelligence" },
  { name: "Medicine", ability: "Wisdom" },
  { name: "Nature", ability: "Intelligence" },
  { name: "Perception", ability: "Wisdom" },
  { name: "Performance", ability: "Charisma" },
  { name: "Persuasion", ability: "Charisma" },
  { name: "Religion", ability: "Intelligence" },
  { name: "Sleight of Hand", ability: "Dexterity" },
  { name: "Stealth", ability: "Dexterity" },
  { name: "Survival", ability: "Wisdom" },
];

const PROF_CYCLE: SkillProficiency[] = ["none", "proficient", "expert"];

const PROF_STYLES: Record<SkillProficiency, string> = {
  none: "border-2 border-dashed border-[var(--color-muted-soft)]/50 text-[var(--color-muted-soft)] bg-transparent",
  proficient: "bg-[var(--color-mint)] border border-[var(--color-mint-deep)]/40 text-[var(--color-mint-deep)]",
  expert: "bg-[var(--color-lavender)] border border-[var(--color-lavender-deep)]/40 text-[var(--color-lavender-deep)]",
};

const ROW_STYLES: Record<SkillProficiency, string> = {
  none: "bg-white border border-[var(--color-line)] hover:bg-[var(--color-bg-warm)] active:bg-[var(--color-bg-warm)]",
  proficient: "bg-[var(--color-mint)]/25 border border-[var(--color-mint-deep)]/20 hover:bg-[var(--color-mint)]/35 active:bg-[var(--color-mint)]/35",
  expert: "bg-[var(--color-lavender)]/25 border border-[var(--color-lavender-deep)]/20 hover:bg-[var(--color-lavender)]/35 active:bg-[var(--color-lavender)]/35",
};

function fmtMod(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface SkillsCardProps {
  skills: Record<string, SkillProficiency>;
  abilities: Abilities;
  proficiency: number | null;
  onUpdate: (skill: string, prof: SkillProficiency) => void;
}

export function SkillsCard({
  skills: skillsMap,
  abilities,
  proficiency,
  onUpdate,
}: SkillsCardProps) {
  const dict = useDict();
  const skills = skillsMap ?? {};

  const cycle = (name: string) => {
    const current: SkillProficiency = skills[name] ?? "none";
    const next = PROF_CYCLE[(PROF_CYCLE.indexOf(current) + 1) % PROF_CYCLE.length];
    onUpdate(name, next);
  };

  const calcMod = (skill: SkillDef): number => {
    const abilModVal = abilityMod(abilities[skill.ability].score ?? 10).val;
    const prof: SkillProficiency = skills[skill.name] ?? "none";
    const profBonus = proficiency ?? 0;
    if (prof === "expert") return abilModVal + profBonus * 2;
    if (prof === "proficient") return abilModVal + profBonus;
    return abilModVal;
  };

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="mint"><Shield size={14} /></IconPill>}
        title={dict.skills.title}
      />

      <div className="grid grid-cols-3 gap-1.5 max-[1024px]:grid-cols-2">
        {SKILLS.map((skill) => {
          const prof: SkillProficiency = skills[skill.name] ?? "none";
          const mod = calcMod(skill);
          return (
            <button key={skill.name}
              onClick={() => cycle(skill.name)}
              title={dict.skills.profTitles[prof]}
              aria-label={`${dict.skills.names[skill.name as keyof typeof dict.skills.names] ?? skill.name}: ${dict.skills.profTitles[prof]}`}
              className={`flex items-start gap-2 px-2.5 py-2 rounded-[10px] w-full text-left cursor-pointer
                shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-150 ${ROW_STYLES[prof]}`}>

              {/* Proficiency badge */}
              <span className={`w-7 h-7 mt-0.5 rounded-full border flex-shrink-0 text-[12px] font-bold
                flex items-center justify-center transition-all duration-150
                ${PROF_STYLES[prof]}`}>
                {dict.skills.profLabels[prof]}
              </span>

              {/* Name + modifier/ability row below */}
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold block truncate leading-tight">
                  {dict.skills.names[skill.name as keyof typeof dict.skills.names] ?? skill.name}
                </span>
                <div className="flex items-center gap-1 mt-[1px]">
                  <span className="font-mono text-[12px] font-bold text-[var(--color-ink)]">
                    {fmtMod(mod)}
                  </span>
                  <span className="text-[12px] text-[var(--color-muted-soft)]">·</span>
                  <span className="text-[12px] font-bold tracking-[0.08em] uppercase
                    text-[var(--color-muted-soft)]">
                    {dict.abilities.abbr[skill.ability]}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
