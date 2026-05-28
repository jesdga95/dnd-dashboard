import { StatMiniCard } from "./StatMiniCard";
import type { Character } from "@/lib/types";

interface StatBentoRowProps {
  char: Pick<Character, "ac" | "speed" | "initiative" | "proficiency" | "hitDice" | "inspiration">;
  onUpdate: (patch: Partial<Character>) => void;
  onToggleInspiration: () => void;
}

export function StatBentoRow({ char, onUpdate, onToggleInspiration }: StatBentoRowProps) {
  const inspired = char.inspiration ?? false;

  return (
    <div className="grid grid-cols-6 gap-2.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2">
      <StatMiniCard
        label="Armor"
        tint="mint"
        type="number"
        numValue={char.ac}
        onChangeNum={(v) => onUpdate({ ac: v })}
      />
      <StatMiniCard
        label="Speed"
        tint="peach"
        type="number"
        numValue={char.speed}
        onChangeNum={(v) => onUpdate({ speed: v })}
        suffix={`ft · ${Math.round(char.speed / 5)} sq`}
      />
      <StatMiniCard
        label="Initiative"
        tint="blue"
        type="number"
        numValue={char.initiative}
        onChangeNum={(v) => onUpdate({ initiative: v })}
        prefix="+"
      />
      <StatMiniCard
        label="Proficiency"
        tint="lavender"
        type="number"
        numValue={char.proficiency}
        onChangeNum={(v) => onUpdate({ proficiency: v })}
        prefix="+"
      />
      <StatMiniCard
        label="Hit Dice"
        tint="sand"
        type="text"
        textValue={char.hitDice}
        onChangeText={(v) => onUpdate({ hitDice: v })}
      />

      {/* Inspiration toggle */}
      <button
        onClick={onToggleInspiration}
        title={inspired ? "Inspired — click to spend" : "No inspiration — click to gain"}
        className={`rounded-[16px] px-4 py-[14px] text-left w-full cursor-pointer
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
        <div className={`text-[10px] font-bold tracking-[0.1em] uppercase
          ${inspired ? "text-[#8c6a1a]" : "text-[var(--color-sand-deep)]"}`}>
          Inspiration
        </div>
        <div className="mt-1 text-[30px] font-extrabold tracking-tight leading-none select-none"
          style={{ color: inspired ? "#8c6a1a" : "var(--color-muted)" }}>
          {inspired ? "★" : "—"}
        </div>
      </button>
    </div>
  );
}
