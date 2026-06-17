"use client";

import { useState } from "react";
import ReactDOM from "react-dom";
import { Crosshair, ChevronDown, AlertTriangle, X } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { combatantKey, resolveAttacker } from "@/lib/combatDamage";
import { UNATTRIBUTED_KEY } from "@/lib/types";
import type { Combatant, DmCombat } from "@/lib/types";

const TYPE_COLOR = (type: Combatant["type"]) =>
  type === "monster" ? "var(--color-coral)" : "#7aaee8";

/**
 * The "Crediting → name" control. Always visible beside the damage controls so
 * attribution is decoupled from Next Turn: the turn pre-fills it, but the DM can
 * reassign for reactions, and a glance catches a stale pick. Goes amber when the
 * attacker is down/removed or is a monster (crediting a monster for damaging
 * another combatant is the unusual case worth a second look).
 */
export function AttackerChip({
  combat,
  downedKeys,
  onSelect,
}: {
  combat: DmCombat;
  downedKeys: Set<string>;
  onSelect: (key: string | null) => void;
}) {
  const dict = useDict();
  const [open, setOpen] = useState(false);

  const attacker = resolveAttacker(combat);
  const isUnattributed = attacker.type === "unattributed";
  const isDowned = !isUnattributed && downedKeys.has(attacker.key);
  const isMonster = attacker.type === "monster";
  const warn = isDowned || isMonster;

  const chipStyle = isUnattributed
    ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }
    : warn
      ? { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }
      : { background: "rgba(244,123,95,0.12)", border: "1px solid rgba(244,123,95,0.25)", color: "var(--color-coral)" };

  const name = isUnattributed ? dict.combatDamage.unattributed : attacker.name;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={
          isDowned
            ? dict.combatDamage.downWarn
            : isMonster
              ? dict.combatDamage.monsterWarn
              : dict.combatDamage.creditingTo
        }
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[12.5px] font-semibold
          cursor-pointer font-[inherit] transition-colors w-full min-w-0"
        style={chipStyle}
      >
        {warn ? <AlertTriangle size={12} className="shrink-0" /> : <Crosshair size={12} className="shrink-0" />}
        <span className="truncate flex-1 text-left">{name}</span>
        <ChevronDown size={12} className="shrink-0 opacity-70" />
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center max-[600px]:items-end p-5 max-[600px]:p-0"
            onClick={() => setOpen(false)}
            style={{ background: "rgba(8,5,3,0.6)", backdropFilter: "blur(4px)" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] max-h-[80vh] overflow-y-auto rounded-[22px] max-[600px]:rounded-b-none
                p-4 max-[600px]:pb-9"
              style={{ background: "#15100c", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold tracking-[0.18em] uppercase text-white/35">
                  {dict.combatDamage.creditTitle}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full border-none bg-transparent cursor-pointer text-white/30 hover:text-white/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {combat.combatants.map((c) => {
                  const key = combatantKey(c);
                  const selected = key === attacker.key;
                  const down = downedKeys.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onSelect(key);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-left cursor-pointer font-[inherit] transition-colors"
                      style={{
                        background: selected ? "rgba(244,123,95,0.14)" : "rgba(255,255,255,0.04)",
                        border: selected ? "1px solid rgba(244,123,95,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR(c.type) }} />
                      <span className={`flex-1 min-w-0 truncate text-[14px] font-semibold ${down ? "text-white/40 line-through" : "text-white/85"}`}>
                        {c.name}
                      </span>
                      {down && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/30 shrink-0">
                          {dict.combatDamage.down}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-left cursor-pointer font-[inherit] transition-colors mt-1"
                  style={{
                    background: attacker.key === UNATTRIBUTED_KEY ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.4)" }} />
                  <span className="flex-1 text-[14px] font-semibold text-white/55">
                    {dict.combatDamage.unattributed}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
