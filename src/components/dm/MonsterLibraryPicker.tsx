"use client";

import { useState } from "react";
import { Search, Plus, Skull } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import type { MonsterTemplate } from "@/lib/types";

/**
 * Bestiary picker for the combat views: type a card's name (or scan the list) and
 * either drop the monster straight into the fight or load it into the stat-block
 * form to set an exact initiative and quantity.
 */
export function MonsterLibraryPicker({
  monsters,
  onPick,
  onQuickAdd,
}: {
  monsters: MonsterTemplate[];
  /** Load the card into the form for tweaking. */
  onPick: (t: MonsterTemplate) => void;
  /** Add it now, with a rolled initiative. */
  onQuickAdd: (t: MonsterTemplate) => void;
}) {
  const dict = useDict();
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const matches = monsters
    .filter((m) => (q ? m.name.toLowerCase().includes(q) : true))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      className="w-full rounded-[16px] px-4 py-3 flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2">
        <Skull size={12} style={{ color: "var(--color-coral)" }} className="shrink-0" />
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/30">
          {dict.bestiary.fromBestiary}
        </span>
      </div>

      {monsters.length === 0 ? (
        <p className="text-[12.5px] text-white/30 italic">{dict.bestiary.emptyInCombat}</p>
      ) : (
        <>
          <div
            className="flex items-center gap-2 px-3 py-[7px] rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <Search size={12} className="text-white/30 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.bestiary.searchPlaceholder}
              maxLength={50}
              className="flex-1 min-w-0 bg-transparent border-none outline-none font-[inherit]
                text-[13px] font-semibold text-white/70 placeholder:text-white/25 placeholder:font-medium"
              // Enter on a name is the fastest path: it adds the top match.
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches.length > 0) {
                  onQuickAdd(matches[0]);
                  setSearch("");
                }
              }}
            />
          </div>

          {matches.length === 0 ? (
            <p className="text-[12.5px] text-white/25 italic">{dict.bestiary.noMatches}</p>
          ) : (
            <div className="flex flex-col gap-1 max-h-[196px] overflow-y-auto">
              {matches.map((m) => (
                <div key={m.id} className="flex items-center gap-1">
                  <button
                    onClick={() => onPick(m)}
                    title={dict.bestiary.pickTitle}
                    className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-[12px]
                      cursor-pointer text-left border border-transparent transition-colors
                      hover:bg-white/[0.05] hover:border-white/[0.08]"
                  >
                    <span className="text-[13.5px] font-semibold text-white truncate flex-1 min-w-0">
                      {m.name || dict.combatMode.unnamed}
                    </span>
                    <span className="text-[11.5px] font-semibold shrink-0 flex items-baseline gap-1">
                      <span className="text-white/30 font-medium">{dict.dmCombat.hpLabel}</span>
                      <span style={{ color: "#6ee7a0" }}>{m.hp}</span>
                    </span>
                    {m.ac !== undefined && (
                      <span className="text-[11.5px] font-semibold shrink-0 flex items-baseline gap-1">
                        <span className="text-white/30 font-medium">{dict.dmCombat.acLabel}</span>
                        <span style={{ color: "#7dd3fc" }}>{m.ac}</span>
                      </span>
                    )}
                    {!!m.initBonus && (
                      <span className="text-[11.5px] font-semibold shrink-0 flex items-baseline gap-1">
                        <span className="text-white/30 font-medium">{dict.dmCombat.initiativeAbbr}</span>
                        <span style={{ color: "var(--color-coral)" }}>
                          {m.initBonus > 0 ? `+${m.initBonus}` : m.initBonus}
                        </span>
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onQuickAdd(m)}
                    title={dict.bestiary.quickAddTitle}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                      cursor-pointer border-none transition-colors"
                    style={{ background: "rgba(244,123,95,0.16)", color: "var(--color-coral)" }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
