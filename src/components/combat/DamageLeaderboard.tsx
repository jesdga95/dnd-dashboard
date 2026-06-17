"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { aggregateLeaderboard, type LeaderboardRow } from "@/lib/combatDamage";
import { UNATTRIBUTED_KEY } from "@/lib/types";
import type { AttackerType, Combatant, DamageEvent } from "@/lib/types";

// Players and offline allies share the blue accent used by their combat badges;
// monsters use coral; the Unattributed bucket is neutral grey.
const TYPE_COLOR: Record<AttackerType, string> = {
  player: "#7aaee8",
  offline: "#7aaee8",
  monster: "var(--color-coral)",
  unattributed: "rgba(255,255,255,0.45)",
};
const TYPE_BAR: Record<AttackerType, string> = {
  player: "linear-gradient(90deg, #6395e1, #4a7ac0)",
  offline: "linear-gradient(90deg, #6395e1, #4a7ac0)",
  monster: "linear-gradient(90deg, #f47b5f, #e04a3a)",
  unattributed: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.16))",
};

export function DamageLeaderboard({
  combatants,
  events,
  viewerIsDm,
  finished,
}: {
  combatants: Combatant[];
  events: DamageEvent[];
  viewerIsDm: boolean;
  finished: boolean;
}) {
  const dict = useDict();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const rows = aggregateLeaderboard(events, combatants).filter((r) => r.dealt > 0 || r.taken > 0);
  const maxDealt = Math.max(1, ...rows.map((r) => r.dealt));

  // Hidden monsters stay masked from players during the fight; revealed once it ends.
  const hiddenMonsters = new Set<string>();
  for (const c of combatants) {
    if (c.type === "monster" && (c.visibility ?? 0) === 0) hiddenMonsters.add(c.id);
  }
  const label = (key: string, name: string, type: AttackerType): string => {
    if (key === UNATTRIBUTED_KEY) return dict.combatDamage.unattributed;
    if (!viewerIsDm && !finished && type === "monster" && hiddenMonsters.has(key)) {
      return dict.dmCombat.unknown;
    }
    return name;
  };

  if (rows.length === 0) {
    return (
      <p className="text-[13px] italic text-white/25 text-center py-8">{dict.combatDamage.noDamage}</p>
    );
  }

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row: LeaderboardRow, i) => {
        const color = TYPE_COLOR[row.type];
        const open = expanded.has(row.key);
        const canExpand = row.byTarget.length > 0;
        return (
          <div
            key={row.key}
            className="rounded-[16px] px-3.5 py-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <button
              onClick={() => canExpand && toggle(row.key)}
              className={`w-full flex items-center gap-2.5 text-left bg-transparent border-none p-0 font-[inherit] ${
                canExpand ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="text-[12px] font-bold tabular-nums text-white/30 w-5 shrink-0">
                {i + 1}
              </span>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span
                className={`flex-1 min-w-0 truncate text-[14px] font-bold ${
                  row.orphan ? "text-white/40 italic" : "text-white/85"
                }`}
              >
                {label(row.key, row.name, row.type)}
              </span>
              <span className="text-[17px] font-extrabold tabular-nums shrink-0" style={{ color }}>
                {row.dealt}
              </span>
              {canExpand &&
                (open ? (
                  <ChevronUp size={14} className="text-white/30 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-white/30 shrink-0" />
                ))}
            </button>

            {/* Damage-dealt bar (relative to the top dealer) */}
            <div
              className="h-[6px] rounded-full overflow-hidden mt-2"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(row.dealt / maxDealt) * 100}%`, background: TYPE_BAR[row.type] }}
              />
            </div>

            {row.taken > 0 && (
              <div className="mt-1.5 text-[11px] font-semibold text-white/30">
                {dict.combatDamage.taken} {row.taken}
              </div>
            )}

            {open && (
              <div className="mt-2.5 flex flex-col gap-1 pl-7">
                {row.byTarget.map((t) => (
                  <div key={t.key} className="flex items-center gap-2 text-[12px]">
                    <span className="text-white/30 shrink-0">→</span>
                    <span className="flex-1 min-w-0 truncate text-white/55">
                      {label(t.key, t.name, t.type)}
                    </span>
                    <span className="font-bold tabular-nums text-white/60 shrink-0">{t.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
