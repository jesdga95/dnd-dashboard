"use client";

import { useState, useRef, useEffect } from "react";
import { usePlayerCombat } from "@/hooks/usePlayerCombat";
import { useCombatEvents } from "@/hooks/useCombatEvents";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDict } from "@/lib/DictContext";
import { usePartyId } from "@/hooks/usePartyId";
import { usePlayerParty } from "@/hooks/usePlayerParty";
import { Swords, X, Shield, ShieldPlus, HeartPlus, Plus, Check, Maximize2, Minimize2, Trophy } from "lucide-react";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { CombatantList, type MemberLiveData } from "@/components/combat/CombatantList";
import { DamageLeaderboard } from "@/components/combat/DamageLeaderboard";
import { CombatCommandBar } from "@/components/combat/CombatCommandBar";
import { CombatOutcome } from "@/components/combat/CombatOutcome";
import { aggregateLeaderboard } from "@/lib/combatDamage";
import type { DmCombat, Character } from "@/lib/types";

export interface PlayerCombatViewProps {
  uid: string;
  char: Pick<Character, "name" | "hp" | "hpMax" | "tempHp" | "ac" | "tempAc">;
  statuses: string[];
  onAdjustHp: (delta: number) => void;
  onUpdateHp: (patch: { hp?: number | null; hpMax?: number | null }) => void;
  onTempHpChange: (val: number) => void;
  onTempAcChange: (val: number) => void;
  onAddStatus: (status: string) => void;
  onRemoveStatus: (index: number) => void;
  onDismiss: () => void;
}

// Temporary AC accent — sky, distinct from the indigo used for temp HP.
const TEMP_AC_COLOR = "#7dd3fc";
const TEMP_AC_BG = "rgba(125,211,252,0.16)";

// Temp HP accent — indigo when it's a buffer, coral when it's a max-HP debuff.
const TEMP_HP_COLOR = "#818cf8";
const TEMP_HP_PENALTY_COLOR = "var(--color-coral)";

function PlayerCombatViewInner({
  uid,
  char,
  statuses,
  combat,
  dmUid,
  onAdjustHp,
  onUpdateHp,
  onTempHpChange,
  onTempAcChange,
  onAddStatus,
  onRemoveStatus,
  onDismiss,
}: PlayerCombatViewProps & { combat: DmCombat; dmUid: string | null }) {
  const dict = useDict();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const finished = combat.status === "finished";
  const events = useCombatEvents(dmUid, combat.combatId);
  const [tab, setTab] = useState<"combat" | "damage">("combat");
  // Reset to the combat tab on a new combat; jump to results when one ends.
  // Keyed on combatId+finished so manual tab switches are preserved.
  const [tabKey, setTabKey] = useState<string>();
  const curTabKey = `${combat.combatId ?? ""}:${finished}`;
  if (curTabKey !== tabKey) {
    setTabKey(curTabKey);
    setTab(finished ? "damage" : "combat");
  }
  // Victory/Defeat flourish — driven by the doc's outcome, so it pops the instant
  // the DM's client records it (no DM click needed). Shown once per combat.
  const [outcomeAckKey, setOutcomeAckKey] = useState<string>();
  const outcomeKey = combat.combatId ?? "fin";
  const showOutcome = !!combat.outcome && outcomeAckKey !== outcomeKey;
  const topName = aggregateLeaderboard(events, combat.combatants).find((r) => r.dealt > 0)?.name;
  const isSidebar = isDesktop && !isFullscreen;

  const [customAmount, setCustomAmount] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [showStatusInput, setShowStatusInput] = useState(false);

  const statusInputRef = useRef<HTMLInputElement>(null);
  // keep a fresh ref to onDismiss without adding it to the keydown effect's deps
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  const { partyId } = usePartyId();
  const { members: partyMembers } = usePlayerParty(partyId ?? null);
  const memberData: Record<string, MemberLiveData> = Object.fromEntries(
    partyMembers.map((m) => [m.uid, { hp: m.char.hp, hpMax: m.char.hpMax, tempHp: m.char.tempHp, ac: m.char.ac, tempAc: m.char.tempAc ?? 0 }])
  );

  const hp = char.hp ?? 0;
  const hpMax = char.hpMax ?? 0;
  const tempHp = char.tempHp ?? 0;
  const tempAc = char.tempAc ?? 0;
  const baseAc = char.ac;
  const effAc = (baseAc ?? 0) + tempAc;
  const showAc = (baseAc !== null && baseAc > 0) || tempAc !== 0;
  // Signed temp HP: positive extends the pool as a buffer; negative is a max-HP debuff.
  // The bar track spans the base max plus any positive buffer; a negative penalty is
  // drawn as a locked-off segment on the right so the shrunken ceiling reads visually.
  const posTemp = Math.max(0, tempHp);
  const negTemp = Math.max(0, -tempHp);
  const barMax = Math.max(1, hpMax + posTemp);
  const hpPct = Math.min(100, (hp / barMax) * 100);
  const tempPct = (posTemp / barMax) * 100;
  const penaltyPct = (negTemp / barMax) * 100;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismissRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isSidebar) {
      document.body.style.paddingRight = "420px";
      document.body.style.overflow = "";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [isSidebar]);



  const handleCustomApply = (sign: 1 | -1) => {
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      onAdjustHp(sign * val);
      setCustomAmount("");
    }
  };

  const handleAddStatus = () => {
    const trimmed = statusInput.trim();
    if (trimmed) {
      onAddStatus(trimmed);
      setStatusInput("");
      setShowStatusInput(false);
    }
  };

  const handleShowStatusInput = () => {
    setShowStatusInput(true);
    setTimeout(() => statusInputRef.current?.focus(), 50);
  };

  return (
    <div
      className={isSidebar
        ? "fixed top-0 right-0 bottom-0 z-[200] flex flex-col w-[420px] border-l border-white/[0.08]"
        : "fixed inset-0 z-[200] flex flex-col"
      }
      style={{
        background:
          "radial-gradient(ellipse 110% 55% at 50% -5%, rgba(160,25,8,0.3) 0%, transparent 65%), #0e0906",
      }}
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 z-10"
        style={{
          background: "rgba(14,9,6,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center px-3 py-2 gap-1">
          <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.22em] uppercase text-white/30 px-1.5">
            <Swords size={13} style={{ color: "var(--color-coral)" }} />
            {finished ? dict.combatDamage.results : dict.combat.title}
          </div>
          <div className="flex-1" />
          {isDesktop && (
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="flex items-center p-1.5 rounded-[7px] bg-transparent cursor-pointer
                transition-colors text-white/40 hover:text-white/65 hover:bg-white/[0.06]
                border border-white/15 hover:border-white/25"
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="flex items-center p-1.5 rounded-[7px] bg-transparent cursor-pointer
              transition-colors text-white/40 hover:text-white/65 hover:bg-white/[0.06]
              border border-white/15 hover:border-white/25"
          >
            <X size={12} />
          </button>
        </div>

        {/* Combat / Damage tabs — hidden once combat is over (results only) */}
        {!finished && (
        <div className="flex gap-1 px-3 pb-2">
          {([
            ["combat", dict.combatDamage.combatTab, Swords],
            ["damage", dict.combatDamage.damageTab, Trophy],
          ] as const).map(([key, label, Icon]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px]
                  font-semibold cursor-pointer font-[inherit] transition-colors border"
                style={
                  active
                    ? { background: "rgba(244,123,95,0.14)", color: "var(--color-coral)", borderColor: "rgba(244,123,95,0.25)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.08)" }
                }
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* ── Scrollable main content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-5 py-6 max-w-[740px] mx-auto">

        {finished ? (
          <>
            <p className="text-[12.5px] text-white/35 italic mb-3">{dict.combatDamage.resultsHint}</p>
            <DamageLeaderboard
              combatants={combat.combatants}
              events={events}
              viewerIsDm={false}
              finished
            />
            <button
              onClick={onDismiss}
              className="mt-3 w-full py-3 rounded-full text-[14px] font-bold cursor-pointer font-[inherit] transition-colors"
              style={{ background: "rgba(244,123,95,0.18)", color: "var(--color-coral)", border: "1px solid rgba(244,123,95,0.3)" }}
            >
              {dict.combatDamage.close}
            </button>
          </>
        ) : tab === "damage" ? (
          <DamageLeaderboard
            combatants={combat.combatants}
            events={events}
            viewerIsDm={false}
            finished={false}
          />
        ) : (
          <>
        {/* ── Character HP hero ── */}
        <div
          className="rounded-[22px] px-6 py-7 mb-4"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244,123,95,0.08) 0%, transparent 65%), rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Name + AC row */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[17px] font-extrabold text-white/75 tracking-tight truncate">
              {char.name || dict.combatMode.unnamed}
            </span>
            {showAc && (
              <span
                className="flex items-center gap-1.5 text-[13px] font-bold shrink-0 ml-3 px-2.5 py-1 rounded-full"
                style={
                  tempAc !== 0
                    ? { color: TEMP_AC_COLOR, background: TEMP_AC_BG }
                    : { color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }
                }
              >
                {tempAc !== 0 ? <ShieldPlus size={12} /> : <Shield size={12} />}
                {dict.dmCombat.acLabel} {effAc}
                {tempAc !== 0 && (
                  <span className="text-[11px] font-semibold opacity-80">
                    ({tempAc > 0 ? `+${tempAc}` : tempAc})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Big HP numbers */}
          <div className="flex items-baseline gap-2 mb-4 leading-none">
            <EditableNumber
              value={char.hp}
              onChange={(v) => onUpdateHp({ hp: v })}
              min={0}
              maxLength={4}
              autoWidth
              style={{
                textAlign: "left",
                fontSize: 68,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            />
            {tempHp > 0 && (
              <span className="text-[22px] font-bold" style={{ color: TEMP_HP_COLOR }}>
                (+{tempHp})
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>
                /
              </span>
              <EditableNumber
                value={char.hpMax}
                onChange={(v) => onUpdateHp({ hpMax: v })}
                min={1}
                maxLength={4}
                autoWidth
                style={{
                  textAlign: "left",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.32)",
                  letterSpacing: "-0.02em",
                }}
              />
              {tempHp < 0 && (
                <span
                  className="text-[18px] font-bold ml-0.5"
                  style={{ color: TEMP_HP_PENALTY_COLOR }}
                  title={dict.combatMode.maxHpReduced}
                >
                  ({tempHp})
                </span>
              )}
            </div>
          </div>

          {/* HP bar */}
          <div
            className="h-[14px] rounded-full overflow-hidden flex mb-5"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="hp-fill h-full"
              style={{
                width: `${hpPct}%`,
                ...(tempHp > 0 && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
              }}
            />
            {tempHp > 0 && (
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${tempPct}%`,
                  background: "linear-gradient(90deg, #818cf8, #60a5fa)",
                }}
              />
            )}
            {tempHp < 0 && (
              <>
                {/* healable gap between current HP and the reduced ceiling */}
                <div className="h-full flex-1" />
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${penaltyPct}%`,
                    background:
                      "repeating-linear-gradient(-45deg, rgba(224,74,58,0.55) 0, rgba(224,74,58,0.55) 4px, rgba(224,74,58,0.28) 4px, rgba(224,74,58,0.28) 8px)",
                  }}
                />
              </>
            )}
          </div>

          {/* Quick adjust buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div
              className="flex gap-0.5 rounded-full p-[3px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {[10, 5, 1].map((n) => (
                <button
                  key={"d" + n}
                  onClick={() => onAdjustHp(-n)}
                  className="px-3 py-[7px] text-[13px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/45 hover:bg-[rgba(224,74,58,0.2)] hover:text-[var(--color-coral)]"
                >
                  −{n}
                </button>
              ))}
            </div>
            <div
              className="flex gap-0.5 rounded-full p-[3px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {[1, 5, 10].map((n) => (
                <button
                  key={"h" + n}
                  onClick={() => onAdjustHp(n)}
                  className="px-3 py-[7px] text-[13px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/45 hover:bg-[rgba(74,180,58,0.2)] hover:text-[#6aba4e]"
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustomApply(-1);
              }}
              placeholder={dict.combatMode.amountPlaceholder}
              className="w-[100px] px-3 py-[7px] rounded-full text-[13px] font-semibold
                font-[inherit] text-center text-white/60 border-none outline-none"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />
            <button
              onClick={() => handleCustomApply(-1)}
              className="px-4 py-[7px] rounded-full text-[13px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(224,74,58,0.14)", color: "var(--color-coral)" }}
            >
              {dict.combat.modal.damage}
            </button>
            <button
              onClick={() => handleCustomApply(1)}
              className="px-4 py-[7px] rounded-full text-[13px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(74,180,58,0.14)", color: "#6aba4e" }}
            >
              {dict.combatMode.heal}
            </button>
          </div>

          {/* Temp HP row */}
          <div
            className="mt-4 pt-4 flex items-center gap-2 flex-wrap"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="text-[13px] font-semibold flex items-center gap-1.5 shrink-0"
              style={{ color: "#818cf8" }}
            >
              <HeartPlus size={12} />
              {dict.hp.tempHp}
            </span>
            <EditableNumber
              value={char.tempHp}
              onChange={(v) => onTempHpChange(v ?? 0)}
              signed
              min={-hpMax}
              style={{
                width: 44,
                textAlign: "center",
                fontSize: 16,
                fontWeight: 700,
                color: tempHp < 0 ? TEMP_HP_PENALTY_COLOR : TEMP_HP_COLOR,
              }}
            />
            <div
              className="flex items-center gap-0.5 rounded-full p-[3px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {[10, 5, 1].map((n) => (
                <button
                  key={"td" + n}
                  onClick={() => onTempHpChange(tempHp - n)}
                  className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/40 hover:bg-[rgba(224,74,58,0.15)] hover:text-[var(--color-coral)]"
                >
                  −{n}
                </button>
              ))}
              <span className="w-px h-4 mx-0.5 shrink-0 bg-white/10" />
              {[1, 5, 10].map((n) => (
                <button
                  key={"t" + n}
                  onClick={() => onTempHpChange(tempHp + n)}
                  className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/40 hover:bg-[rgba(129,140,248,0.15)] hover:text-[#818cf8]"
                >
                  +{n}
                </button>
              ))}
              {tempHp !== 0 && (
                <button
                  onClick={() => onTempHpChange(0)}
                  title={dict.hp.clearTempHp}
                  className="px-2 py-[5px] border-none bg-transparent rounded-full font-[inherit]
                    cursor-pointer flex items-center transition-colors duration-150
                    text-white/35 hover:bg-[rgba(224,74,58,0.15)] hover:text-[var(--color-coral)]"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Temp AC row — players buff/debuff their own AC during combat */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span
              className="text-[13px] font-semibold flex items-center gap-1.5 shrink-0"
              style={{ color: TEMP_AC_COLOR }}
            >
              <ShieldPlus size={12} />
              {dict.combatMode.tempAc}
            </span>
            <EditableNumber
              value={tempAc}
              onChange={(v) => onTempAcChange(v ?? 0)}
              signed
              style={{ width: 44, textAlign: "center", fontSize: 16, fontWeight: 700, color: TEMP_AC_COLOR }}
            />
            <div className="flex items-center gap-0.5 rounded-full p-[3px]" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[5, 2, 1].map((n) => (
                <button
                  key={"tad" + n}
                  onClick={() => onTempAcChange(tempAc - n)}
                  className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/40 hover:bg-[rgba(125,211,252,0.15)] hover:text-[#7dd3fc]"
                >
                  −{n}
                </button>
              ))}
              <span className="w-px h-4 mx-0.5 shrink-0 bg-white/10" />
              {[1, 2, 5].map((n) => (
                <button
                  key={"ta" + n}
                  onClick={() => onTempAcChange(tempAc + n)}
                  className="px-2.5 py-[5px] text-[12px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/40 hover:bg-[rgba(125,211,252,0.15)] hover:text-[#7dd3fc]"
                >
                  +{n}
                </button>
              ))}
              {tempAc !== 0 && (
                <button
                  onClick={() => onTempAcChange(0)}
                  title={dict.combatMode.clearTempAc}
                  className="px-2 py-[5px] border-none bg-transparent rounded-full font-[inherit]
                    cursor-pointer flex items-center transition-colors duration-150
                    text-white/35 hover:bg-[rgba(224,74,58,0.15)] hover:text-[var(--color-coral)]"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Status Conditions ── */}
        <div
          className="rounded-[22px] px-5 py-4 mb-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/25">
              {dict.combatMode.statusConditions}
            </span>
            {!showStatusInput && (
              <button
                onClick={handleShowStatusInput}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-full
                  border-none cursor-pointer font-[inherit] transition-colors
                  text-white/35 hover:text-white/65 hover:bg-white/[0.07]"
              >
                <Plus size={11} />
                {dict.combatMode.addStatus}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold"
                style={{
                  background: "rgba(244,123,95,0.14)",
                  color: "var(--color-coral)",
                  border: "1px solid rgba(244,123,95,0.2)",
                }}
              >
                {status}
                <button
                  onClick={() => onRemoveStatus(i)}
                  className="border-none bg-transparent cursor-pointer p-0 flex items-center
                    transition-opacity opacity-60 hover:opacity-100"
                  style={{ color: "inherit" }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}

            {showStatusInput && (
              <div className="flex items-center gap-1.5">
                <input
                  ref={statusInputRef}
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddStatus();
                    if (e.key === "Escape") {
                      setShowStatusInput(false);
                      setStatusInput("");
                    }
                  }}
                  placeholder={dict.combatMode.statusPlaceholder}
                  maxLength={30}
                  className="px-3 py-1.5 rounded-full text-[13px] font-semibold font-[inherit]
                    text-white/65 border-none outline-none"
                  style={{ background: "rgba(255,255,255,0.09)", width: 140 }}
                />
                <button
                  onClick={handleAddStatus}
                  className="p-1.5 rounded-full border-none cursor-pointer flex items-center
                    transition-colors text-[#6aba4e] hover:bg-[rgba(74,180,58,0.15)]"
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => {
                    setShowStatusInput(false);
                    setStatusInput("");
                  }}
                  className="p-1.5 rounded-full border-none cursor-pointer flex items-center
                    transition-colors text-white/25 hover:bg-white/[0.08] hover:text-white/55"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {statuses.length === 0 && !showStatusInput && (
              <span className="text-[13px] italic text-white/20">{dict.combatMode.noStatuses}</span>
            )}
          </div>
        </div>

        {/* ── Turn Order ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/25">
              {dict.dmCombat.round} {combat.round}
            </span>
            </div>

          <CombatantList
            combat={combat}
            myUid={uid}
            myHp={char.hp}
            myHpMax={char.hpMax}
            myTempHp={char.tempHp}
            myAc={char.ac}
            myTempAc={tempAc}
            memberData={memberData}
          />

        </div>
          </>
        )}

      </div>
      </div>

      {/* Floating bar — shows who's currently acting (read-only for players) */}
      {!finished && (
        <CombatCommandBar combat={combat} finished={false} viewerIsDm={false} endLabel="" />
      )}

      {/* Outcome flourish — plays once when the DM ends combat, then results. */}
      {showOutcome && combat.outcome && (
        <CombatOutcome
          variant={combat.outcome}
          subtitle={topName ? `${dict.combatDamage.mvp}: ${topName}` : undefined}
          onOk={() => setOutcomeAckKey(outcomeKey)}
        />
      )}
    </div>
  );
}

export function PlayerCombatView(props: PlayerCombatViewProps) {
  const { combat, dmUid } = usePlayerCombat();
  if (!combat) return null;
  return <PlayerCombatViewInner {...props} combat={combat} dmUid={dmUid} />;
}
