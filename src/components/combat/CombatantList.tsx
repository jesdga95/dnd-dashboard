"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2, Plus, Check, X, Shield, ShieldPlus, ChevronUp, ChevronDown } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import type { DmCombat, MonsterCombatant, OfflinePlayerCombatant } from "@/lib/types";

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
  color,
  fontSize,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  width?: number;
  color?: string;
  fontSize?: number;
}) {
  const [local, setLocal] = useState(value);
  // Resync local edit state when the committed value changes externally
  // (adjust-state-during-render — preferred over a setState-in-effect).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }
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
      style={{ width: width ?? 40, fontSize: fontSize ?? 13, color: color ?? "rgba(255,255,255,0.45)" }}
    />
  );
}

// ── Armor Class (with temporary modifier) ───────────────────────────────────
// Temp AC is a combat-only buff/debuff. Sky accent keeps it distinct from the
// indigo used for temp HP. Effective AC = base + temp.
const TEMP_AC_COLOR = "#7dd3fc";
const TEMP_AC_BG = "rgba(125,211,252,0.16)";

// Read-only readout: shows the effective AC, flagging any temp modifier.
function AcBadge({ base, temp }: { base?: number | null; temp?: number | null }) {
  const dict = useDict();
  const t = temp ?? 0;
  const hasBase = base !== null && base !== undefined;
  if (!hasBase && t === 0) return null;
  const eff = (base ?? 0) + t;
  if (t === 0) {
    return (
      <span className="text-[12px] text-white/40 shrink-0 flex items-center gap-1">
        <Shield size={11} />
        {dict.dmCombat.acLabel} {eff}
      </span>
    );
  }
  return (
    <span
      className="text-[12px] shrink-0 flex items-center gap-1"
      title={dict.combatMode.tempAcTitle}
      style={{ color: TEMP_AC_COLOR }}
    >
      <ShieldPlus size={11} />
      <span className="text-white/40">{dict.dmCombat.acLabel}</span>
      <span className="font-bold">{eff}</span>
      <span
        className="text-[10px] px-1 py-px rounded-full font-bold leading-none"
        style={{ background: TEMP_AC_BG }}
      >
        {t > 0 ? `+${t}` : t}
      </span>
    </span>
  );
}

// DM-editable: base AC stays inline-editable; the sky field sets the temp modifier.
function AcEditor({
  base,
  temp,
  onBase,
  onTemp,
}: {
  base?: number;
  temp?: number;
  onBase: (v: string) => void;
  onTemp: (v: string) => void;
}) {
  const dict = useDict();
  const t = temp ?? 0;
  const eff = (base ?? 0) + t;
  return (
    <span className="flex items-center gap-1 text-[12px] text-white/35 shrink-0">
      <Shield size={11} />
      {dict.dmCombat.acLabel}
      <InlineEdit
        value={base !== undefined ? String(base) : ""}
        onCommit={onBase}
        placeholder="—"
        width={36}
      />
      <span className="flex items-center" title={dict.combatMode.tempAcTitle}>
        <ShieldPlus size={10} style={{ color: TEMP_AC_COLOR, opacity: 0.85 }} />
        <InlineEdit
          value={t !== 0 ? String(t) : ""}
          onCommit={onTemp}
          placeholder="+"
          width={42}
          color={TEMP_AC_COLOR}
        />
      </span>
      {t !== 0 && (
        <span className="text-white/30">
          = <span className="font-bold" style={{ color: TEMP_AC_COLOR }}>{eff}</span>
        </span>
      )}
    </span>
  );
}

// ── Initiative gutter ────────────────────────────────────────────────────────
// Big initiative value with up/down reorder arrows. Editing the number re-sorts
// the order; arrows nudge / break ties. Both are DM-only — when onMove/onSet are
// absent (player view) it renders a read-only number.
function InitiativeControl({
  value,
  index,
  isFirst,
  isLast,
  isCurrent,
  onMove,
  onSet,
}: {
  value: number;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isCurrent: boolean;
  onMove?: (index: number, dir: -1 | 1) => void;
  onSet?: (index: number, value: number) => void;
}) {
  const dict = useDict();
  const tint = isCurrent ? "var(--color-coral)" : "rgba(255,255,255,0.6)";
  const arrowCls =
    "flex items-center justify-center w-8 h-7 rounded-lg cursor-pointer transition-colors " +
    "text-white/30 hover:text-white/80 hover:bg-white/[0.08] " +
    "disabled:opacity-20 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-white/30";
  return (
    <div className="flex flex-col items-center shrink-0 w-10 gap-0.5 pt-3">
      {onMove && (
        <button onClick={() => onMove(index, -1)} disabled={isFirst} title={dict.dmCombat.moveUp} className={arrowCls}>
          <ChevronUp size={18} />
        </button>
      )}
      {onSet ? (
        <InlineEdit
          value={String(value)}
          onCommit={(v) => { const n = parseInt(v, 10); if (!isNaN(n)) onSet(index, n); }}
          width={38}
          fontSize={19}
          color={tint}
        />
      ) : (
        <span className="text-[19px] font-extrabold tabular-nums text-center leading-none" style={{ color: tint }}>
          {value}
        </span>
      )}
      {onMove && (
        <button onClick={() => onMove(index, 1)} disabled={isLast} title={dict.dmCombat.moveDown} className={arrowCls}>
          <ChevronDown size={18} />
        </button>
      )}
    </div>
  );
}

// ── Prop types ─────────────────────────────────────────────────────────────

export interface MemberLiveData {
  hp: number | null;
  hpMax: number | null;
  tempHp?: number | null;
  ac?: number | null;
  tempAc?: number | null;
  conditions?: string[];
}

/** All DM-only monster controls; absence → read-only render. */
export interface MonsterControls {
  onAdjustHp: (id: string, delta: number) => void;
  onToggleReveal: (id: string) => void;
  onAddCondition: (id: string, cond: string) => void;
  onRemoveCondition: (id: string, cond: string) => void;
  onRemove: (id: string) => void;
  /** Allows real-time stat edits (AC, temp AC, hpMax) for buffs/debuffs. */
  onUpdateMonster: (id: string, patch: { ac?: number; hpMax?: number; tempAc?: number }) => void;
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
  myTempAc?: number | null;
  /** Live data keyed by UID (DM mode: from party hook). */
  memberData?: Record<string, MemberLiveData>;
  /** When provided, monster rows render full DM controls. */
  monsterControls?: MonsterControls;
  /** When provided, each row gets up/down controls to reorder initiative (DM only). */
  reorder?: (index: number, dir: -1 | 1) => void;
  /** When provided, the initiative number is editable and re-sorts on commit (DM only). */
  onSetInitiative?: (index: number, value: number) => void;
}

// ── Monster / offline-player row ─────────────────────────────────────────────
// Both are DM-managed (manual HP/AC/conditions). Monsters can be hidden from
// players; offline players are allies, so they're always fully visible.

function ManualCombatantRow({
  combatant,
  isCurrent,
  controls,
}: {
  combatant: MonsterCombatant | OfflinePlayerCombatant;
  isCurrent: boolean;
  controls?: MonsterControls;
}) {
  const dict = useDict();
  const [condInput, setCondInput] = useState("");
  const [showCondInput, setShowCondInput] = useState(false);
  const [customDelta, setCustomDelta] = useState("");

  const isOffline = combatant.type === "offline";
  const isDead = combatant.hp <= 0;
  const isDm = !!controls;
  const vis = isOffline ? 2 : (combatant.visibility ?? 0);
  const nameVisible = isDm || vis >= 1;
  const statsVisible = isDm || vis >= 2;

  const handleCustom = (sign: 1 | -1) => {
    const n = parseInt(customDelta, 10);
    if (!isNaN(n) && n > 0 && controls) {
      controls.onAdjustHp(combatant.id, sign * n);
      setCustomDelta("");
    }
  };

  const commitAc = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0 && controls) controls.onUpdateMonster(combatant.id, { ac: n });
  };

  // Temp AC is signed (buff or penalty); blanking the field clears it back to 0.
  const commitTempAc = (v: string) => {
    if (!controls) return;
    const n = parseInt(v, 10);
    controls.onUpdateMonster(combatant.id, { tempAc: isNaN(n) ? 0 : n });
  };

  const commitHpMax = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0 && controls) controls.onUpdateMonster(combatant.id, { hpMax: n });
  };

  return (
    <div className={rowBase(isCurrent, isDead)} style={rowStyle(isCurrent, isDead)}>
      {/* Line 1 — badge/eye + name + visibility/offline chips + remove */}
      <div className="flex items-center gap-2">
        {isDm && !isOffline ? (
          <button
            onClick={() => controls.onToggleReveal(combatant.id)}
            title={vis === 0 ? dict.dmCombat.revealName : vis === 1 ? dict.dmCombat.revealStats : dict.dmCombat.hide}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150"
            style={
              vis === 2
                ? { background: "rgba(72,200,160,0.18)", color: "var(--color-mint-deep)" }
                : vis === 1
                ? { background: "rgba(251,191,36,0.18)", color: "#fbbf24" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }
            }
          >
            {vis === 0 ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        ) : (
          <span
            className="text-[12px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={
              isOffline
                ? { background: "rgba(99,149,225,0.15)", color: "#7aaee8" }
                : { background: "rgba(244,123,95,0.12)", color: "var(--color-coral)" }
            }
          >
            {isOffline ? dict.combatMode.playerBadge : dict.combatMode.monsterBadge}
          </span>
        )}

        <span
          className={`text-[15px] font-bold truncate min-w-0 ${
            !nameVisible
              ? "text-white/25 tracking-[0.25em]"
              : isDead
              ? "text-white/30 line-through"
              : "text-white"
          }`}
        >
          {!nameVisible ? dict.dmCombat.unknown : combatant.name}
        </span>

        {isOffline && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-[0.08em]"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
          >
            {dict.dmCombat.offlineTag}
          </span>
        )}
        {isDm && !isOffline && vis === 1 && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
          >
            {dict.dmCombat.visName}
          </span>
        )}
        {isDm && !isOffline && vis === 2 && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
            style={{ background: "rgba(72,200,160,0.15)", color: "var(--color-mint-deep)" }}
          >
            {dict.dmCombat.visStats}
          </span>
        )}

        <div className="flex-1" />

        {isDm && (
          <button
            onClick={() => controls.onRemove(combatant.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shrink-0
              text-white/20 hover:text-[var(--color-coral)] hover:bg-white/[0.05] transition-colors duration-150"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Line 2 — AC on its own line (room for the temp modifier) */}
      {statsVisible && (
        <div className="mt-2.5">
          {isDm ? (
            <AcEditor
              base={combatant.ac}
              temp={combatant.tempAc}
              onBase={commitAc}
              onTemp={commitTempAc}
            />
          ) : (
            <AcBadge base={combatant.ac} temp={combatant.tempAc} />
          )}
        </div>
      )}

      {/* Line 3 — HP bar + numbers */}
      {statsVisible && (
        <div className="flex items-center gap-2 mt-2">
          <HpBar hp={combatant.hp} hpMax={combatant.hpMax} />
          <span className="text-[12px] font-semibold text-white/55 shrink-0 flex items-center gap-0.5">
            {combatant.hp}
            <span className="text-white/30">/</span>
            {isDm ? (
              <InlineEdit value={String(combatant.hpMax)} onCommit={commitHpMax} width={44} />
            ) : (
              <span>{combatant.hpMax}</span>
            )}
          </span>
        </div>
      )}

      {/* Conditions — read-only (player view) */}
      {!isDm && vis >= 2 && combatant.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {combatant.conditions.map((cond) => (
            <span
              key={cond}
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}
            >
              {cond}
            </span>
          ))}
        </div>
      )}

      {/* ── DM-only HP controls ── */}
      {isDm && (
        <>
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            <div className="flex gap-0.5 rounded-full p-[3px]" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[10, 5, 1].map((n) => (
                <button
                  key={"d" + n}
                  onClick={() => controls.onAdjustHp(combatant.id, -n)}
                  className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
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
                  onClick={() => controls.onAdjustHp(combatant.id, n)}
                  className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/45 hover:bg-[rgba(74,180,58,0.2)] hover:text-[#6aba4e]"
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              value={customDelta}
              onChange={(e) => setCustomDelta(e.target.value)}
              placeholder={dict.combatMode.amountPlaceholder}
              className="w-[88px] px-3 py-[5px] rounded-full text-[12px] font-semibold font-[inherit]
                text-center text-white/60 border-none outline-none"
              style={{ background: "rgba(255,255,255,0.07)" }}
              onKeyDown={(e) => { if (e.key === "Enter") handleCustom(-1); }}
            />
            <button
              onClick={() => handleCustom(-1)}
              className="px-3 py-[5px] rounded-full text-[12px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(224,74,58,0.14)", color: "var(--color-coral)" }}
            >
              {dict.combat.modal.damage}
            </button>
            <button
              onClick={() => handleCustom(1)}
              className="px-3 py-[5px] rounded-full text-[12px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(74,180,58,0.14)", color: "#6aba4e" }}
            >
              {dict.combatMode.heal}
            </button>
          </div>

          {combatant.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 mb-1">
              {combatant.conditions.map((c) => (
                <button
                  key={c}
                  onClick={() => controls.onRemoveCondition(combatant.id, c)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium
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

          <div className="mt-1">
            {showCondInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  value={condInput}
                  onChange={(e) => setCondInput(e.target.value)}
                  placeholder={dict.combatMode.statusPlaceholder}
                  className="flex-1 text-[12px] px-3 py-1.5 rounded-full outline-none"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && condInput.trim()) {
                      controls.onAddCondition(combatant.id, condInput.trim());
                      setCondInput("");
                      setShowCondInput(false);
                    }
                    if (e.key === "Escape") { setShowCondInput(false); setCondInput(""); }
                  }}
                />
                <button
                  onClick={() => {
                    if (condInput.trim()) controls.onAddCondition(combatant.id, condInput.trim());
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
                className="flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer
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
  myTempAc,
  liveData,
}: {
  combatant: Extract<DmCombat["combatants"][number], { type: "player" }>;
  isCurrent: boolean;
  myUid?: string;
  myHp?: number | null;
  myHpMax?: number | null;
  myTempHp?: number | null;
  myAc?: number | null;
  myTempAc?: number | null;
  liveData?: MemberLiveData;
}) {
  const dict = useDict();
  const isMe = myUid !== undefined && combatant.uid === myUid;
  const isDmMode = myUid === undefined;

  const hp = isMe ? (myHp ?? null) : (liveData?.hp ?? null);
  const hpMax = isMe ? (myHpMax ?? null) : (liveData?.hpMax ?? null);
  const tempHp = isMe ? (myTempHp ?? 0) : (liveData?.tempHp ?? 0);
  const ac = isMe ? (myAc ?? null) : (liveData?.ac ?? null);
  const tempAc = isMe ? (myTempAc ?? 0) : (liveData?.tempAc ?? 0);
  const conditions = isDmMode ? (liveData?.conditions ?? []) : [];
  const isDead = hp !== null && hp <= 0;

  return (
    <div className={rowBase(isCurrent, isDead)} style={rowStyle(isCurrent, isDead)}>
      {/* Line 1 — badge + name */}
      <div className="flex items-center gap-2">
        <span
          className="text-[12px] px-2 py-0.5 rounded-full font-semibold shrink-0"
          style={{ background: "rgba(99,149,225,0.15)", color: "#7aaee8" }}
        >
          {dict.combatMode.playerBadge}
        </span>
        <span className={`text-[15px] font-bold truncate min-w-0 ${isDead ? "text-white/30 line-through" : "text-white"}`}>
          {combatant.name || combatant.uid}
        </span>
      </div>

      {/* Line 2 — AC */}
      {(ac !== null || tempAc !== 0) && (
        <div className="mt-2.5">
          <AcBadge base={ac} temp={tempAc} />
        </div>
      )}

      {/* Line 3 — HP */}
      {hp !== null && hpMax !== null && hpMax > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <HpBar hp={hp} hpMax={hpMax} tempHp={tempHp ?? 0} />
          <span className="text-[12px] font-semibold text-white/55 shrink-0">
            {hp}/{hpMax}
          </span>
        </div>
      )}

      {/* Conditions (DM view) */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {conditions.map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
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
  myTempAc,
  memberData,
  monsterControls,
  reorder,
  onSetInitiative,
}: CombatantListProps) {
  const last = combat.combatants.length - 1;
  return (
    <div className="flex flex-col gap-2">
      {combat.combatants.map((c, i) => {
        const isCurrent = i === combat.currentTurnIndex;
        const key = c.type === "player" ? c.uid : c.id;
        const row =
          c.type === "player" ? (
            <PlayerRow
              combatant={c}
              isCurrent={isCurrent}
              myUid={myUid}
              myHp={myHp}
              myHpMax={myHpMax}
              myTempHp={myTempHp}
              myAc={myAc}
              myTempAc={myTempAc}
              liveData={memberData?.[c.uid]}
            />
          ) : (
            <ManualCombatantRow combatant={c} isCurrent={isCurrent} controls={monsterControls} />
          );
        return (
          <div key={key} className="flex items-start gap-2">
            <InitiativeControl
              value={c.initiativeRoll}
              index={i}
              isFirst={i === 0}
              isLast={i === last}
              isCurrent={isCurrent}
              onMove={reorder}
              onSet={onSetInitiative}
            />
            <div className="flex-1 min-w-0">{row}</div>
          </div>
        );
      })}
    </div>
  );
}
