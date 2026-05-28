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
  none: "bg-[var(--color-bg-warm)] border-[var(--color-line)] text-[var(--color-muted-soft)]",
  proficient: "bg-[var(--color-mint)] border-[var(--color-mint-deep)]/30 text-[var(--color-mint-deep)]",
  expert: "bg-[var(--color-lavender)] border-[var(--color-lavender-deep)]/30 text-[var(--color-lavender-deep)]",
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
        sub={dict.skills.subtitle}
      />

      <div className="grid grid-cols-3 gap-x-1 gap-y-0 max-[700px]:grid-cols-2">
        {SKILLS.map((skill) => {
          const prof: SkillProficiency = skills[skill.name] ?? "none";
          const mod = calcMod(skill);
          return (
            <div key={skill.name}
              className="flex items-start gap-2 px-2 py-1.5 rounded-[10px]
                hover:bg-[var(--color-bg-warm)] transition-colors duration-150">

              {/* Proficiency badge */}
              <button
                onClick={() => cycle(skill.name)}
                title={dict.skills.profTitles[prof]}
                className={`w-6 h-6 mt-0.5 rounded-full border text-[10px] font-bold flex-shrink-0
                  flex items-center justify-center cursor-pointer transition-all duration-150
                  ${PROF_STYLES[prof]}`}
              >
                {dict.skills.profLabels[prof]}
              </button>

              {/* Name + modifier/ability row below */}
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-semibold block truncate leading-tight">
                  {dict.skills.names[skill.name as keyof typeof dict.skills.names] ?? skill.name}
                </span>
                <div className="flex items-center gap-1 mt-[1px]">
                  <span className="font-mono text-[11px] font-bold text-[var(--color-ink)]">
                    {fmtMod(mod)}
                  </span>
                  <span className="text-[10px] text-[var(--color-muted-soft)]">·</span>
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase
                    text-[var(--color-muted-soft)]">
                    {dict.abilities.abbr[skill.ability]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
