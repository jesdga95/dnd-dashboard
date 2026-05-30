"use client";

import { StatMiniCard } from "./StatMiniCard";
import { SparkleBackground } from "@/components/ui/SparkleBackground";
import { useDict } from "@/lib/DictContext";
import { abilityMod } from "@/lib/utils";
import type { Character, Abilities, SkillProficiency } from "@/lib/types";

interface StatBentoRowProps {
  char: Pick<Character, "ac" | "speed" | "initiative" | "proficiency" | "hitDice" | "inspiration">;
  abilities: Abilities;
  skills: Record<string, SkillProficiency>;
  onUpdate: (patch: Partial<Character>) => void;
  onToggleInspiration: () => void;
}

export function StatBentoRow({ char, abilities, skills, onUpdate, onToggleInspiration }: StatBentoRowProps) {
  const dict = useDict();
  const inspired = char.inspiration ?? false;

  // Passive Perception = 10 + Perception skill bonus
  const wisScore = abilities?.Wisdom?.score ?? 10;
  const wisMod = abilityMod(wisScore).val;
  const percProf = skills?.["Perception"] ?? "none";
  const profBonus = char.proficiency ?? 0;
  const passivePerc = 10 + wisMod + (percProf === "expert" ? profBonus * 2 : percProf === "proficient" ? profBonus : 0);

  // DEX mod hint for initiative
  const dexMod = abilityMod(abilities?.Dexterity?.score ?? 10).str;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1: AC, Speed, Initiative, Proficiency */}
      <div className="grid grid-cols-4 gap-2.5 max-[1024px]:grid-cols-2">
        <StatMiniCard
          label={dict.stats.armor}
          tint="mint"
          type="number"
          numValue={char.ac}
          onChangeNum={(v) => onUpdate({ ac: v })}
        />
        <StatMiniCard
          label={dict.stats.speed}
          tint="peach"
          type="number"
          numValue={char.speed}
          onChangeNum={(v) => onUpdate({ speed: v })}
          suffix={char.speed !== null ? dict.stats.speedSuffix.replace("{squares}", String(Math.round(char.speed / 5))) : undefined}
        />
        <StatMiniCard
          label={dict.stats.initiative}
          tint="blue"
          type="number"
          numValue={char.initiative}
          onChangeNum={(v) => onUpdate({ initiative: v })}
          prefix={(char.initiative ?? 0) >= 0 ? "+" : "−"}
          numFormat={(v) => String(Math.abs(v))}
          signed
          suffix={char.initiative === null ? `DEX ${dexMod}` : undefined}
        />
        <StatMiniCard
          label={dict.stats.proficiency}
          tint="lavender"
          type="number"
          numValue={char.proficiency}
          onChangeNum={(v) => onUpdate({ proficiency: v })}
          prefix="+"
        />
      </div>

      {/* Row 2: Hit Dice, Passive Perception, Inspiration */}
      <div className="grid grid-cols-3 gap-2.5 max-[600px]:grid-cols-2">
        <StatMiniCard
          label={dict.stats.hitDice}
          tint="sand"
          type="text"
          textValue={char.hitDice}
          textMaxLength={20}
          onChangeText={(v) => onUpdate({ hitDice: v })}
        />

        {/* Passive Perception — read-only computed */}
        <div className="bg-[var(--color-peach)] rounded-[16px] px-4 py-[14px] shadow-[var(--shadow-sm)] border border-black/[0.02]">
          <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-[var(--color-peach-deep)]">
            {dict.stats.passivePerc}
          </div>
          <div className="mt-1 text-[26px] font-extrabold tracking-tight leading-none text-[var(--color-ink)]">
            {passivePerc}
          </div>
        </div>

        {/* Inspiration toggle */}
        <button
          onClick={onToggleInspiration}
          title={inspired ? dict.stats.inspiredTitle : dict.stats.notInspiredTitle}
          className={`max-[600px]:col-span-2 rounded-[16px] px-4 py-[14px] text-left w-full cursor-pointer relative overflow-hidden
            transition-all duration-200 active:translate-y-px border
            shadow-[var(--shadow-sm)]
            ${inspired
              ? "border-[#c8a84b]/40 hover:brightness-105"
              : "bg-[var(--color-sand)] border-black/[0.02] hover:brightness-[0.97]"
            }`}
          style={inspired ? {
            background: "linear-gradient(135deg, #f7e3a8 0%, #e8c878 100%)",
          } : {}}
        >
          <div className={`text-[12px] font-bold tracking-[0.1em] uppercase
            ${inspired ? "text-[#8c6a1a]" : "text-[var(--color-sand-deep)]"}`}>
            {dict.stats.inspiration}
          </div>

          <div className="mt-1 text-[30px] font-extrabold tracking-tight leading-none select-none relative z-10"
            style={{ color: inspired ? "#8c6a1a" : "var(--color-muted)" }}>
            {inspired ? "★" : "—"}
          </div>

          <SparkleBackground color={inspired ? "#c8a84b" : "var(--color-muted)"} chars={["✦", "✧"]} dim={!inspired} />
        </button>
      </div>
    </div>
  );
}
