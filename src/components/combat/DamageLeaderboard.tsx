"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Skull, Crown, User, Ghost, Shield, RotateCcw, Swords } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { aggregateLeaderboard, type LeaderboardRow } from "@/lib/combatDamage";
import { UNATTRIBUTED_KEY } from "@/lib/types";
import type { AttackerType, Combatant, DamageEvent } from "@/lib/types";

// Players + offline allies share blue (their combat-badge colour); monsters
// coral; the Unattributed bucket is neutral grey.
const TYPE: Record<AttackerType, { color: string; bg: string; ring: string }> = {
  player: { color: "#8fbaf0", bg: "rgba(99,149,225,0.16)", ring: "rgba(99,149,225,0.45)" },
  offline: { color: "#8fbaf0", bg: "rgba(99,149,225,0.16)", ring: "rgba(99,149,225,0.45)" },
  monster: { color: "var(--color-coral)", bg: "rgba(244,123,95,0.16)", ring: "rgba(244,123,95,0.45)" },
  unattributed: { color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.06)", ring: "rgba(255,255,255,0.18)" },
};
const MEDAL = ["#f5c451", "#cdd2d8", "#d08b52"]; // gold / silver / bronze

const GOLD = "#f5c451";
const SELF = "#d8a657";
const TAKEN = "#9fb3c8";

function Avatar({ type, mvp }: { type: AttackerType; mvp: boolean }) {
  const t = TYPE[type];
  const Icon = type === "monster" ? Ghost : type === "unattributed" ? null : User;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: t.bg,
        border: `1.5px solid ${mvp ? GOLD : t.ring}`,
        boxShadow: mvp ? "0 0 12px rgba(245,196,81,0.45)" : undefined,
      }}
    >
      {Icon ? (
        <Icon size={17} style={{ color: t.color }} />
      ) : (
        <span className="text-[15px] font-bold" style={{ color: t.color }}>?</span>
      )}
    </div>
  );
}

function Chip({
  icon: Icon,
  value,
  color,
  bg,
  title,
}: {
  icon: typeof Skull;
  value: number;
  color: string;
  bg: string;
  title: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums"
      style={{ color, background: bg }}
    >
      <Icon size={11} />
      {value}
    </span>
  );
}

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

  const rows = aggregateLeaderboard(events, combatants).filter(
    (r) => r.dealt > 0 || r.taken > 0 || r.selfInflicted > 0,
  );
  // Per-side denominators: players measure against the party, monsters against
  // the monster total. Keeps each side's share meaningful on one mixed board.
  const sum = (pred: (r: LeaderboardRow) => boolean) =>
    Math.max(1, rows.reduce((s, r) => (pred(r) ? s + r.dealt : s), 0));
  const allyTotal = sum((r) => r.type === "player" || r.type === "offline");
  const foeTotal = sum((r) => r.type === "monster");
  const grandTotal = sum(() => true);

  // Hidden monsters stay masked from players during the fight; revealed once over.
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
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/20">
        <Swords size={28} />
        <p className="text-[13px] italic">{dict.combatDamage.noDamage}</p>
      </div>
    );
  }

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  let dealerRank = 0; // medal/rank counts only damage dealers

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row: LeaderboardRow) => {
        const t = TYPE[row.type];
        const isDealer = row.dealt > 0;
        const rank = isDealer ? ++dealerRank : null;
        const mvp = rank === 1;
        const medal = rank && rank <= 3 ? MEDAL[rank - 1] : null;
        const open = expanded.has(row.key);
        const log = events.filter((e) => e.attackerKey === row.key);
        const canExpand = log.length > 0;

        const sideTotal = row.type === "monster" ? foeTotal : row.type === "unattributed" ? grandTotal : allyTotal;
        const sideLabel =
          row.type === "monster" ? dict.combatDamage.ofFoes : row.type === "unattributed" ? dict.combatDamage.share : dict.combatDamage.ofAllies;
        const pct = Math.round((row.dealt / sideTotal) * 100);

        return (
          <div
            key={row.key}
            className="rounded-[16px] px-3 py-2.5"
            style={
              mvp
                ? {
                    background:
                      "radial-gradient(ellipse 90% 80% at 0% 0%, rgba(245,196,81,0.10), transparent 60%), rgba(255,255,255,0.035)",
                    border: "1px solid rgba(245,196,81,0.35)",
                    boxShadow: "0 6px 22px rgba(0,0,0,0.28)",
                  }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
            }
          >
            <button
              onClick={() => canExpand && toggle(row.key)}
              className={`w-full flex items-center gap-2.5 text-left bg-transparent border-none p-0 font-[inherit] ${
                canExpand ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className="w-4 text-center text-[12px] font-extrabold tabular-nums shrink-0"
                style={{ color: medal ?? "rgba(255,255,255,0.25)" }}
              >
                {rank ?? "–"}
              </span>

              <Avatar type={row.type} mvp={mvp} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`min-w-0 truncate text-[14px] font-bold ${row.orphan ? "italic text-white/45" : "text-white/90"}`}
                  >
                    {label(row.key, row.name, row.type)}
                  </span>
                  {mvp && <Crown size={13} style={{ color: GOLD }} className="shrink-0" />}
                </div>

                {(row.kills > 0 || row.taken > 0 || row.selfInflicted > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {row.kills > 0 && (
                      <Chip icon={Skull} value={row.kills} color="#f4a89a" bg="rgba(244,123,95,0.14)" title={dict.combatDamage.killTitle} />
                    )}
                    {row.taken > 0 && (
                      <Chip icon={Shield} value={row.taken} color={TAKEN} bg="rgba(255,255,255,0.05)" title={dict.combatDamage.taken} />
                    )}
                    {row.selfInflicted > 0 && (
                      <Chip icon={RotateCcw} value={row.selfInflicted} color={SELF} bg="rgba(216,166,87,0.13)" title={dict.combatDamage.self} />
                    )}
                  </div>
                )}
              </div>

              {/* Damage total — the hero of the card */}
              {isDealer && (
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1 leading-none">
                    <span
                      className="font-extrabold tabular-nums"
                      style={{ color: t.color, fontSize: mvp ? 26 : 22 }}
                    >
                      {row.dealt}
                    </span>
                    <span className="text-[9.5px] font-bold tracking-[0.08em] text-white/30">
                      {dict.combatDamage.dmgAbbr}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold text-white/35 mt-1 tabular-nums">
                    {pct}% {sideLabel}
                  </div>
                </div>
              )}

              {canExpand &&
                (open ? (
                  <ChevronUp size={14} className="text-white/30 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-white/30 shrink-0" />
                ))}
            </button>

            {open && (
              <div
                className="mt-2.5 ml-[30px] pl-3 flex flex-col gap-1.5"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Chronological hit log: this combatant's blows, blow by blow. */}
                {log.map((e) => {
                  const isSelf = e.attackerKey === e.targetKey;
                  return (
                    <div key={e.id} className="flex items-center gap-2 text-[12px]">
                      <span className="text-[10px] font-bold tabular-nums text-white/30 shrink-0 w-6">
                        {dict.combatDamage.roundAbbr}
                        {e.round}
                      </span>
                      {isSelf ? (
                        <RotateCcw size={11} className="shrink-0" style={{ color: SELF }} />
                      ) : (
                        <span className="text-white/30 shrink-0">→</span>
                      )}
                      <span
                        className="flex-1 min-w-0 truncate"
                        style={{ color: isSelf ? SELF : "rgba(255,255,255,0.6)" }}
                      >
                        {isSelf ? dict.combatDamage.self : label(e.targetKey, e.targetName, e.targetType)}
                      </span>
                      {e.kill && <Skull size={11} className="shrink-0" style={{ color: "#f4a89a" }} />}
                      <span
                        className="font-bold tabular-nums shrink-0 w-7 text-right"
                        style={{ color: isSelf ? SELF : "rgba(255,255,255,0.78)" }}
                      >
                        {e.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
