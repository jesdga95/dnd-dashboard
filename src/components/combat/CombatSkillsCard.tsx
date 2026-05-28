"use client";

import { Shield } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict } from "@/lib/DictContext";
import type { Abilities, AbilityKey, SkillProficiency } from "@/lib/types";

interface SkillDef {
  name: string;
  ability: AbilityKey;
}

const COMBAT_SKILLS: SkillDef[] = [
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

interface CombatSkillsCardProps {
  combatSkills: Record<string, SkillProficiency>;
  abilities: Abilities;
  proficiency: number;
  onUpdate: (skill: string, prof: SkillProficiency) => void;
}

export function CombatSkillsCard({
  combatSkills,
  abilities,
  proficiency,
  onUpdate,
}: CombatSkillsCardProps) {
  const dict = useDict();
  const skills = combatSkills ?? {};

  const cycle = (name: string) => {
    const current: SkillProficiency = skills[name] ?? "none";
    const next = PROF_CYCLE[(PROF_CYCLE.indexOf(current) + 1) % PROF_CYCLE.length];
    onUpdate(name, next);
  };

  const calcMod = (skill: SkillDef): number => {
    const abilMod = abilities[skill.ability].mod;
    const prof: SkillProficiency = skills[skill.name] ?? "none";
    if (prof === "expert") return abilMod + proficiency * 2;
    if (prof === "proficient") return abilMod + proficiency;
    return abilMod;
  };

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="mint"><Shield size={14} /></IconPill>}
        title={dict.skills.title}
        sub={dict.skills.subtitle}
      />

      <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 max-[700px]:grid-cols-2">
        {COMBAT_SKILLS.map((skill) => {
          const prof: SkillProficiency = skills[skill.name] ?? "none";
          const mod = calcMod(skill);
          return (
            <div key={skill.name}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-[12px]
                hover:bg-[var(--color-bg-warm)] transition-colors duration-150">

              {/* Proficiency badge */}
              <button
                onClick={() => cycle(skill.name)}
                title={dict.skills.profTitles[prof]}
                className={`w-6 h-6 rounded-full border text-[10px] font-bold flex-shrink-0
                  flex items-center justify-center cursor-pointer transition-all duration-150
                  ${PROF_STYLES[prof]}`}
              >
                {dict.skills.profLabels[prof]}
              </button>

              {/* Modifier */}
              <span className="font-mono text-[13px] font-bold w-8 text-right flex-shrink-0
                text-[var(--color-ink)]">
                {fmtMod(mod)}
              </span>

              {/* Name + ability stacked on mobile, inline on desktop */}
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold block truncate">
                  {dict.skills.names[skill.name as keyof typeof dict.skills.names] ?? skill.name}
                </span>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase
                  text-[var(--color-muted-soft)] max-[700px]:block hidden">
                  {dict.abilities.abbr[skill.ability]}
                </span>
              </div>

              {/* Ability abbr — desktop only, right-aligned */}
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase
                text-[var(--color-muted-soft)] flex-shrink-0 max-[700px]:hidden">
                {dict.abilities.abbr[skill.ability]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
