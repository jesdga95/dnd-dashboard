"use client";

import { SkipForward, Crosshair } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { AttackerChip } from "./AttackerChip";
import { combatantKey, resolveAttacker } from "@/lib/combatDamage";
import type { DmCombat } from "@/lib/types";

// Floating, thumb-reachable command bar pinned to the bottom of the combat
// panel. Keeps the busy top header clean. DM gets attribution + Next Turn +
// End/Close; players get a read-only readout of who's currently acting.
const SHELL: React.CSSProperties = {
  background: "rgba(20,13,9,0.86)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 10px 34px rgba(0,0,0,0.5)",
};

const actionBtn =
  "flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12.5px] font-semibold cursor-pointer " +
  "font-[inherit] transition-colors bg-[rgba(244,123,95,0.14)] text-[var(--color-coral)] " +
  "border border-[rgba(244,123,95,0.25)] hover:bg-[rgba(244,123,95,0.24)] hover:border-[rgba(244,123,95,0.4)]";

export function CombatCommandBar({
  combat,
  finished,
  viewerIsDm,
  endLabel,
  downedKeys,
  onSelectAttacker,
  onNextTurn,
  onEnd,
}: {
  combat: DmCombat;
  finished: boolean;
  viewerIsDm: boolean;
  endLabel: string;
  downedKeys?: Set<string>;
  onSelectAttacker?: (key: string | null) => void;
  onNextTurn?: () => void;
  onEnd?: () => void;
}) {
  const dict = useDict();
  const attacker = resolveAttacker(combat);

  // Players never see a hidden monster's real name, even as the active attacker.
  const activeName = (() => {
    if (attacker.type === "unattributed") return dict.combatDamage.unattributed;
    if (!viewerIsDm) {
      const c = combat.combatants.find((x) => combatantKey(x) === attacker.key);
      if (c && c.type === "monster" && (c.visibility ?? 0) === 0) return dict.dmCombat.unknown;
    }
    return attacker.name;
  })();
  const activeColor =
    attacker.type === "unattributed"
      ? "rgba(255,255,255,0.5)"
      : attacker.type === "monster"
        ? "var(--color-coral)"
        : "#7aaee8";

  return (
    <div className="shrink-0 z-20 px-3 pt-2 pb-3">
      <div
        className="mx-auto max-w-[680px] rounded-[16px] px-3 py-2.5 flex flex-col gap-2"
        style={SHELL}
      >
        {viewerIsDm && finished ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/35 px-1">
              {dict.combatDamage.results}
            </span>
            <div className="flex-1" />
            {/* Wrapped, not passed directly: onEnd's first arg is the combat
                outcome, and React would hand it the click event. */}
            <button onClick={() => onEnd?.()} className={actionBtn}>
              {endLabel}
            </button>
          </div>
        ) : viewerIsDm ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/30 shrink-0">
                {dict.combatDamage.creditingTo}
              </span>
              <div className="flex-1 min-w-0 flex">
                <AttackerChip
                  combat={combat}
                  downedKeys={downedKeys ?? new Set()}
                  onSelect={onSelectAttacker!}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-white/30 px-1 shrink-0">
                {dict.dmCombat.round} {combat.round}
              </span>
              <div className="flex-1" />
              <button onClick={onNextTurn} className={actionBtn}>
                <SkipForward size={13} />
                {dict.dmCombat.nextTurn}
              </button>
              <button onClick={() => onEnd?.()} className={actionBtn}>
                {endLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white/30 px-1 shrink-0">
              {dict.dmCombat.round} {combat.round}
            </span>
            <div className="flex-1" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/25 shrink-0">
              {dict.combatDamage.active}
            </span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[12.5px] font-semibold min-w-0 max-w-[55%]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: activeColor }}
            >
              <Crosshair size={12} className="shrink-0" />
              <span className="truncate">{activeName}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
