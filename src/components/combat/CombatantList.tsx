"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Trash2, Plus, Check, X } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import type { DmCombat, MonsterCombatant } from "@/lib/types";

// ── Shared helpers ─────────────────────────────────────────────────────────

function hpBarColor(hp: number, hpMax: number): string {
  if (hp <= 0) return "linear-gradient(90deg, #2a0a0a, #1a0505)";
  const pct = hp / Math.max(1, hpMax);
  if (pct > 0.5) return "linear-gradient(90deg, #22c55e, #16a34a)";
  if (pct > 0.25) return "linear-gradient(90deg, #eab308, #ca8a04)";
  return "linear-gradient(90deg, #f47b5f, #e04a3a)";
}

function HpBar({ hp, hpMax, tempHp = 0 }: { hp: number; hpMax: number; tempHp?: number }) {
  const safeTemp = Math.max(0, tempHp);
  const total = Math.max(1, hpMax + safeTemp);
  const hpPct = Math.max(0, Math.min(100, (hp / total) * 100));
  const tempPct = safeTemp > 0 ? (safeTemp / total) * 100 : 0;
  return (
    <div
      className="relative h-[5px] rounded-full overflow-hidden flex-1 flex"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${hpPct}%`,
          background: hpBarColor(hp, hpMax),
          ...(safeTemp > 0 && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
        }}
      />
      {safeTemp > 0 && (
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${tempPct}%`, background: "linear-gradient(90deg, #818cf8, #60a5fa)" }}
        />
      )}
    </div>
  );
}

function rowBase(isCurrent: boolean, isDead: boolean): string {
  let cls = "rounded-[22px] px-5 py-4 transition-all duration-150 ";
  if (isDead) cls += "opacity-50 ";
  if (isCurrent && !isDead) cls += "ring-2 ring-[var(--color-coral)] ";
  return cls;
}

function rowStyle(isCurrent: boolean, isDead: boolean): React.CSSProperties {
  if (isDead)
    return { background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" };
  if (isCurrent)
    return { background: "rgba(244,123,95,0.06)", border: "1px solid rgba(244,123,95,0.25)" };
  return {
    background:
      "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244,123,95,0.03) 0%, transparent 70%), rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
  };
}

// Tiny inline editable number that looks like plain text until focused
function InlineEdit({
  value,
  onCommit,
  placeholder,
  width,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  width?: number;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      placeholder={placeholder}
      className="text-center font-semibold font-[inherit] bg-transparent border-none outline-none
        rounded-[6px] px-1 transition-colors hover:bg-white/[0.06] focus:bg-white/[0.09]"
      style={{ width: width ?? 40, fontSize: 11, color: "rgba(255,255,255,0.45)" }}
    />
  );
}

// ── Prop types ─────────────────────────────────────────────────────────────

export interface MemberLiveData {
  hp: number | null;
  hpMax: number | null;
  tempHp?: number | null;
  ac?: number | null;
  conditions?: string[];
}

/** All DM-only monster controls; absence → read-only render. */
export interface MonsterControls {
  onAdjustHp: (id: string, delta: number) => void;
  onToggleReveal: (id: string) => void;
  onAddCondition: (id: string, cond: string) => void;
  onRemoveCondition: (id: string, cond: string) => void;
  onRemove: (id: string) => void;
  /** Allows real-time stat edits (AC, hpMax) for buffs/debuffs. */
  onUpdateMonster: (id: string, patch: { ac?: number; hpMax?: number }) => void;
}

export interface CombatantListProps {
  combat: DmCombat;
  /**
   * Local player UID — restricts HP display to that player's own row.
   * Omit for DM mode.
   */
  myUid?: string;
  myHp?: number | null;
  myHpMax?: number | null;
  myTempHp?: number | null;
  myAc?: number | null;
  /** Live data keyed by UID (DM mode: from party hook). */
  memberData?: Record<string, MemberLiveData>;
  /** When provided, monster rows render full DM controls. */
  monsterControls?: MonsterControls;
}

// ── Monster row ─────────────────────────────────────────────────────────────

function MonsterRow({
  monster,
  isCurrent,
  controls,
}: {
  monster: MonsterCombatant;
  isCurrent: boolean;
  controls?: MonsterControls;
}) {
  const dict = useDict();
  const [condInput, setCondInput] = useState("");
  const [showCondInput, setShowCondInput] = useState(false);
  const [customDelta, setCustomDelta] = useState("");

  const isDead = monster.hp <= 0;
  const isDm = !!controls;
  const vis = monster.visibility ?? 0;
  const nameVisible = isDm || vis >= 1;
  const statsVisible = isDm || vis >= 2;

  const handleCustom = (sign: 1 | -1) => {
    const n = parseInt(customDelta, 10);
    if (!isNaN(n) && n > 0 && controls) {
      controls.onAdjustHp(monster.id, sign * n);
      setCustomDelta("");
    }
  };

  const commitAc = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0 && controls) controls.onUpdateMonster(monster.id, { ac: n });
  };

  const commitHpMax = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0 && controls) controls.onUpdateMonster(monster.id, { hpMax: n });
  };

  return (
    <div className={rowBase(isCurrent, isDead)} style={rowStyle(isCurrent, isDead)}>
      {/* ── Header row ── */}
      <div className="flex items-center gap-2.5" style={{ marginBottom: isDm ? "12px" : "0" }}>
        <span className="text-[11px] font-bold text-white/35 w-5 text-center shrink-0">
          {monster.initiativeRoll}
        </span>

        {isDm ? (
          <button
            onClick={() => controls.onToggleReveal(monster.id)}
            title={vis === 0 ? dict.dmCombat.revealName : vis === 1 ? dict.dmCombat.revealStats : dict.dmCombat.hide}
            className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150"
            style={
              vis === 2
                ? { background: "rgba(72,200,160,0.18)", color: "var(--color-mint-deep)" }
                : vis === 1
                ? { background: "rgba(251,191,36,0.18)", color: "#fbbf24" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }
            }
          >
            {vis === 0 ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        ) : (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{ background: "rgba(244,123,95,0.12)", color: "var(--color-coral)" }}
          >
            {dict.combatMode.monsterBadge}
          </span>
        )}

        <div className="flex-1 min-w-0">
          {/* Name + AC row */}
          <div className={`flex items-center gap-2 ${statsVisible ? "mb-1.5" : ""}`}>
            <span
              className={`text-[13px] font-bold truncate ${
                !nameVisible
                  ? "text-white/25 tracking-[0.25em]"
                  : isDead
                  ? "text-white/30 line-through"
                  : "text-white"
              }`}
            >
              {!nameVisible ? dict.dmCombat.unknown : monster.name}
            </span>
            {statsVisible && (
              isDm ? (
                <span className="flex items-center gap-0.5 text-[10px] text-white/35 shrink-0">
                  {dict.dmCombat.acLabel}
                  <InlineEdit
                    value={monster.ac !== undefined ? String(monster.ac) : ""}
                    onCommit={commitAc}
                    placeholder="—"
                    width={32}
                  />
                </span>
              ) : (
                monster.ac !== undefined && (
                  <span className="text-[10px] text-white/40 shrink-0">{dict.dmCombat.acLabel} {monster.ac}</span>
                )
              )
            )}
            {isDm && vis === 1 && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
              >
                {dict.dmCombat.visName}
              </span>
            )}
            {isDm && vis === 2 && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                style={{ background: "rgba(72,200,160,0.15)", color: "var(--color-mint-deep)" }}
              >
                {dict.dmCombat.visStats}
              </span>
            )}
          </div>

          {/* HP bar + numbers */}
          {statsVisible && (
            <div className="flex items-center gap-2">
              <HpBar hp={monster.hp} hpMax={monster.hpMax} />
              <span className="text-[11px] font-semibold text-white/55 shrink-0 flex items-center gap-0.5">
                {monster.hp}
                <span className="text-white/30">/</span>
                {isDm ? (
                  <InlineEdit
                    value={String(monster.hpMax)}
                    onCommit={commitHpMax}
                    width={44}
                  />
                ) : (
                  <span>{monster.hpMax}</span>
                )}
              </span>
            </div>
          )}

          {/* Conditions — read-only (player view) */}
          {!isDm && vis >= 2 && monster.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {monster.conditions.map((cond) => (
                <span
                  key={cond}
                  className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}
                >
                  {cond}
                </span>
              ))}
            </div>
          )}
        </div>

        {isDm && (
          <button
            onClick={() => controls.onRemove(monster.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer shrink-0
              text-white/20 hover:text-[var(--color-coral)] hover:bg-white/[0.05] transition-colors duration-150"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* ── DM-only HP controls ── */}
      {isDm && (
        <>
          <div className="flex flex-wrap gap-2 ml-[52px] mb-2">
            <div className="flex gap-0.5 rounded-full p-[3px]" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[10, 5, 1].map((n) => (
                <button
                  key={"d" + n}
                  onClick={() => controls.onAdjustHp(monster.id, -n)}
                  className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/45 hover:bg-[rgba(224,74,58,0.2)] hover:text-[var(--color-coral)]"
                >
                  −{n}
                </button>
              ))}
            </div>
            <div className="flex gap-0.5 rounded-full p-[3px]" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[1, 5, 10].map((n) => (
                <button
                  key={"h" + n}
                  onClick={() => controls.onAdjustHp(monster.id, n)}
                  className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/45 hover:bg-[rgba(74,180,58,0.2)] hover:text-[#6aba4e]"
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-[52px] mb-2">
            <input
              type="number"
              value={customDelta}
              onChange={(e) => setCustomDelta(e.target.value)}
              placeholder={dict.combatMode.amountPlaceholder}
              className="w-[88px] px-3 py-[5px] rounded-full text-[11px] font-semibold font-[inherit]
                text-center text-white/60 border-none outline-none"
              style={{ background: "rgba(255,255,255,0.07)" }}
              onKeyDown={(e) => { if (e.key === "Enter") handleCustom(-1); }}
            />
            <button
              onClick={() => handleCustom(-1)}
              className="px-3 py-[5px] rounded-full text-[11px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(224,74,58,0.14)", color: "var(--color-coral)" }}
            >
              {dict.combat.modal.damage}
            </button>
            <button
              onClick={() => handleCustom(1)}
              className="px-3 py-[5px] rounded-full text-[11px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(74,180,58,0.14)", color: "#6aba4e" }}
            >
              {dict.combatMode.heal}
            </button>
          </div>

          {monster.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-[52px] mt-1 mb-1">
              {monster.conditions.map((c) => (
                <button
                  key={c}
                  onClick={() => controls.onRemoveCondition(monster.id, c)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium
                    cursor-pointer transition-colors duration-150"
                  style={{
                    background: "rgba(244,123,95,0.12)",
                    color: "var(--color-coral)",
                    border: "1px solid rgba(244,123,95,0.18)",
                  }}
                >
                  {c} <X size={8} />
                </button>
              ))}
            </div>
          )}

          <div className="ml-[52px] mt-1">
            {showCondInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  value={condInput}
                  onChange={(e) => setCondInput(e.target.value)}
                  placeholder={dict.combatMode.statusPlaceholder}
                  className="flex-1 text-[11px] px-3 py-1.5 rounded-full outline-none"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && condInput.trim()) {
                      controls.onAddCondition(monster.id, condInput.trim());
                      setCondInput("");
                      setShowCondInput(false);
                    }
                    if (e.key === "Escape") { setShowCondInput(false); setCondInput(""); }
                  }}
                />
                <button
                  onClick={() => {
                    if (condInput.trim()) controls.onAddCondition(monster.id, condInput.trim());
                    setCondInput(""); setShowCondInput(false);
                  }}
                  className="p-1.5 rounded-full border-none cursor-pointer flex items-center
                    transition-colors text-[#6aba4e] hover:bg-[rgba(74,180,58,0.15)]"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => { setShowCondInput(false); setCondInput(""); }}
                  className="p-1.5 rounded-full border-none cursor-pointer flex items-center
                    transition-colors text-white/25 hover:bg-white/[0.08] hover:text-white/55"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCondInput(true)}
                className="flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer
                  transition-colors text-white/30 hover:text-white/60"
              >
                <Plus size={9} /> {dict.combatMode.addStatus}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Player row ──────────────────────────────────────────────────────────────

function PlayerRow({
  combatant,
  isCurrent,
  myUid,
  myHp,
  myHpMax,
  myTempHp,
  myAc,
  liveData,
}: {
  combatant: Extract<DmCombat["combatants"][number], { type: "player" }>;
  isCurrent: boolean;
  myUid?: string;
  myHp?: number | null;
  myHpMax?: number | null;
  myTempHp?: number | null;
  myAc?: number | null;
  liveData?: MemberLiveData;
}) {
  const dict = useDict();
  const isMe = myUid !== undefined && combatant.uid === myUid;
  const isDmMode = myUid === undefined;

  const hp = isDmMode ? (liveData?.hp ?? null) : isMe ? (myHp ?? null) : null;
  const hpMax = isDmMode ? (liveData?.hpMax ?? null) : isMe ? (myHpMax ?? null) : null;
  const tempHp = isDmMode ? (liveData?.tempHp ?? 0) : isMe ? (myTempHp ?? 0) : 0;
  const ac = isDmMode ? (liveData?.ac ?? null) : isMe ? (myAc ?? null) : null;
  const conditions = isDmMode ? (liveData?.conditions ?? []) : [];
  const isDead = hp !== null && hp <= 0;

  return (
    <div className={rowBase(isCurrent, isDead)} style={rowStyle(isCurrent, isDead)}>
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold text-white/35 w-5 text-center shrink-0">
          {combatant.initiativeRoll}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
          style={{ background: "rgba(99,149,225,0.15)", color: "#7aaee8" }}
        >
          {dict.combatMode.playerBadge}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[13px] font-bold truncate ${isDead ? "text-white/30 line-through" : "text-white"}`}>
              {combatant.name || combatant.uid}
            </span>
            {ac !== null && (
              <span className="text-[10px] text-white/40 shrink-0">{dict.dmCombat.acLabel} {ac}</span>
            )}
          </div>
          {hp !== null && hpMax !== null && hpMax > 0 && (
            <div className="flex items-center gap-2">
              <HpBar hp={hp} hpMax={hpMax} tempHp={tempHp ?? 0} />
              <span className="text-[11px] font-semibold text-white/55 shrink-0">
                {hp}/{hpMax}
              </span>
            </div>
          )}
          {conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {conditions.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                  style={{
                    background: "rgba(244,123,95,0.12)",
                    color: "var(--color-coral)",
                    border: "1px solid rgba(244,123,95,0.18)",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

export function CombatantList({
  combat,
  myUid,
  myHp,
  myHpMax,
  myTempHp,
  myAc,
  memberData,
  monsterControls,
}: CombatantListProps) {
  return (
    <div className="flex flex-col gap-2">
      {combat.combatants.map((c, i) => {
        const isCurrent = i === combat.currentTurnIndex;
        if (c.type === "player") {
          return (
            <PlayerRow
              key={c.uid}
              combatant={c}
              isCurrent={isCurrent}
              myUid={myUid}
              myHp={myHp}
              myHpMax={myHpMax}
              myTempHp={myTempHp}
              myAc={myAc}
              liveData={memberData?.[c.uid]}
            />
          );
        }
        return (
          <MonsterRow
            key={c.id}
            monster={c}
            isCurrent={isCurrent}
            controls={monsterControls}
          />
        );
      })}
    </div>
  );
}
