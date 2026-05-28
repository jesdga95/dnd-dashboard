"use client";

import { useState, useRef, useEffect } from "react";
import { Swords, X, Moon, Shield, Plus, Check } from "lucide-react";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useDict } from "@/lib/DictContext";
import { generateId } from "@/lib/utils";
import type { Character } from "@/lib/types";

export interface CombatEnemy {
  id: number;
  name: string;
  hp: number;
  hpMax: number;
}

interface CombatModeProps {
  char: Pick<Character, "name" | "hp" | "hpMax" | "tempHp" | "ac">;
  enemies: CombatEnemy[];
  statuses: string[];
  onAdjustHp: (delta: number) => void;
  onUpdateHp: (patch: { hp?: number | null; hpMax?: number | null }) => void;
  onTempHpChange: (val: number) => void;
  onFullRest: () => void;
  onAddEnemy: (enemy: CombatEnemy) => void;
  onAdjustEnemyHp: (id: number, delta: number) => void;
  onRemoveEnemy: (id: number) => void;
  onAddStatus: (status: string) => void;
  onRemoveStatus: (index: number) => void;
  onClose: () => void;
}

function enemyBarColor(hp: number, hpMax: number): string {
  const pct = hp / Math.max(1, hpMax);
  if (pct > 0.5) return "linear-gradient(90deg, #22c55e, #16a34a)";
  if (pct > 0.25) return "linear-gradient(90deg, #eab308, #ca8a04)";
  return "linear-gradient(90deg, #f47b5f, #e04a3a)";
}

export function CombatMode({
  char,
  enemies,
  statuses,
  onAdjustHp,
  onUpdateHp,
  onTempHpChange,
  onFullRest,
  onAddEnemy,
  onAdjustEnemyHp,
  onRemoveEnemy,
  onAddStatus,
  onRemoveStatus,
  onClose,
}: CombatModeProps) {
  const dict = useDict();
  const cm = dict.combatMode;

  const [customAmount, setCustomAmount] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [showStatusInput, setShowStatusInput] = useState(false);
  const [showAddEnemy, setShowAddEnemy] = useState(false);
  const [enemyForm, setEnemyForm] = useState({ name: "", hpMax: "" });

  const statusInputRef = useRef<HTMLInputElement>(null);
  const enemyNameRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  // eslint-disable-next-line react-hooks/refs
  onCloseRef.current = onClose;

  const hp = char.hp ?? 0;
  const hpMax = char.hpMax ?? 0;
  const tempHp = char.tempHp ?? 0;
  const total = Math.max(1, hpMax + tempHp);
  const hpPct = (hp / total) * 100;
  const tempPct = (tempHp / total) * 100;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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

  const handleAddEnemy = () => {
    const name = enemyForm.name.trim();
    const maxHp = parseInt(enemyForm.hpMax, 10);
    if (name && !isNaN(maxHp) && maxHp > 0) {
      onAddEnemy({ id: generateId(), name, hp: maxHp, hpMax: maxHp });
      setEnemyForm({ name: "", hpMax: "" });
      setShowAddEnemy(false);
    }
  };

  const handleShowAddEnemy = () => {
    setShowAddEnemy(true);
    setTimeout(() => enemyNameRef.current?.focus(), 50);
  };

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse 110% 55% at 50% -5%, rgba(160,25,8,0.3) 0%, transparent 65%), #0e0906",
      }}
    >
      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(14,9,6,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[12.5px] font-semibold px-3 py-2 rounded-lg
            border-none bg-transparent cursor-pointer font-[inherit] transition-colors
            text-white/35 hover:text-white/65 hover:bg-white/[0.06]"
        >
          <X size={14} />
          <span className="max-[460px]:hidden">{cm.exit}</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase text-white/30">
          <Swords size={14} style={{ color: "var(--color-coral)" }} />
          {dict.combat.title}
        </div>

        <button
          onClick={onFullRest}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-full
            border-none cursor-pointer font-[inherit] transition-colors"
          style={{ background: "rgba(74,122,58,0.18)", color: "#6aba4e" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,122,58,0.28)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,122,58,0.18)"; }}
        >
          <Moon size={12} />
          <span className="max-[460px]:hidden">{dict.hp.fullRest}</span>
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="px-5 py-6 max-w-[740px] mx-auto">

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
              {char.name || cm.unnamed}
            </span>
            {char.ac !== null && char.ac > 0 && (
              <span
                className="flex items-center gap-1.5 text-[12px] font-bold shrink-0 ml-3 px-2.5 py-1 rounded-full"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}
              >
                <Shield size={12} />
                AC {char.ac}
              </span>
            )}
          </div>

          {/* Big HP numbers */}
          <div className="flex items-baseline gap-2 mb-4 leading-none">
            <EditableNumber
              value={char.hp}
              onChange={(v) => onUpdateHp({ hp: v })}
              min={0}
              style={{
                width: 88,
                textAlign: "left",
                fontSize: 68,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            />
            {tempHp > 0 && (
              <span
                className="text-[22px] font-bold"
                style={{ color: "#818cf8" }}
              >
                (+{tempHp})
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
              <EditableNumber
                value={char.hpMax}
                onChange={(v) => onUpdateHp({ hpMax: v })}
                min={1}
                style={{
                  width: 60,
                  textAlign: "left",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.32)",
                  letterSpacing: "-0.02em",
                }}
              />
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
                  className="px-3 py-[7px] text-[12px] border-none bg-transparent rounded-full
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
                  className="px-3 py-[7px] text-[12px] border-none bg-transparent rounded-full
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
              onKeyDown={(e) => { if (e.key === "Enter") handleCustomApply(-1); }}
              placeholder={cm.amountPlaceholder}
              className="w-[100px] px-3 py-[7px] rounded-full text-[12px] font-semibold
                font-[inherit] text-center text-white/60 border-none outline-none"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />
            <button
              onClick={() => handleCustomApply(-1)}
              className="px-4 py-[7px] rounded-full text-[12px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(224,74,58,0.14)", color: "var(--color-coral)" }}
            >
              {dict.combat.modal.damage}
            </button>
            <button
              onClick={() => handleCustomApply(1)}
              className="px-4 py-[7px] rounded-full text-[12px] font-semibold font-[inherit]
                border-none cursor-pointer transition-colors duration-150"
              style={{ background: "rgba(74,180,58,0.14)", color: "#6aba4e" }}
            >
              {cm.heal}
            </button>
          </div>

          {/* Temp HP row */}
          <div
            className="mt-4 pt-4 flex items-center gap-2 flex-wrap"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="text-[12px] font-semibold flex items-center gap-1.5 shrink-0"
              style={{ color: "#818cf8" }}
            >
              <Shield size={12} />
              {dict.hp.tempHp}
            </span>
            <EditableNumber
              value={char.tempHp}
              onChange={(v) => onTempHpChange(v ?? 0)}
              min={0}
              style={{
                width: 44,
                textAlign: "center",
                fontSize: 16,
                fontWeight: 700,
                color: "#818cf8",
              }}
            />
            <div
              className="flex gap-0.5 rounded-full p-[3px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {[1, 5, 10].map((n) => (
                <button
                  key={"t" + n}
                  onClick={() => onTempHpChange(tempHp + n)}
                  className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                    font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                    text-white/40 hover:bg-[rgba(129,140,248,0.15)] hover:text-[#818cf8]"
                >
                  +{n}
                </button>
              ))}
              {tempHp > 0 && (
                <button
                  onClick={() => onTempHpChange(null)}
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
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25">
              {cm.statusConditions}
            </span>
            {!showStatusInput && (
              <button
                onClick={handleShowStatusInput}
                className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-full
                  border-none cursor-pointer font-[inherit] transition-colors
                  text-white/35 hover:text-white/65 hover:bg-white/[0.07]"
              >
                <Plus size={11} />
                {cm.addStatus}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
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
                  placeholder={cm.statusPlaceholder}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold font-[inherit]
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
                  onClick={() => { setShowStatusInput(false); setStatusInput(""); }}
                  className="p-1.5 rounded-full border-none cursor-pointer flex items-center
                    transition-colors text-white/25 hover:bg-white/[0.08] hover:text-white/55"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {statuses.length === 0 && !showStatusInput && (
              <span className="text-[12px] italic text-white/20">{cm.noStatuses}</span>
            )}
          </div>
        </div>

        {/* ── Enemies ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25">
              {cm.enemies}
            </span>
            {!showAddEnemy && (
              <button
                onClick={handleShowAddEnemy}
                className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-full
                  border-none cursor-pointer font-[inherit] transition-colors
                  text-white/35 hover:text-white/65 hover:bg-white/[0.07]"
              >
                <Plus size={11} />
                {cm.addEnemy}
              </button>
            )}
          </div>

          {/* Add enemy form */}
          {showAddEnemy && (
            <div
              className="flex items-center gap-2 mb-3 flex-wrap rounded-[16px] px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <input
                ref={enemyNameRef}
                type="text"
                value={enemyForm.name}
                onChange={(e) => setEnemyForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddEnemy();
                  if (e.key === "Escape") setShowAddEnemy(false);
                }}
                placeholder={cm.enemyNamePlaceholder}
                className="flex-1 min-w-[120px] px-3 py-2 rounded-full text-[12px] font-semibold
                  font-[inherit] text-white/65 border-none outline-none"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <input
                type="number"
                value={enemyForm.hpMax}
                onChange={(e) => setEnemyForm((f) => ({ ...f, hpMax: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddEnemy(); }}
                placeholder={cm.maxHpPlaceholder}
                className="w-[84px] px-3 py-2 rounded-full text-[12px] font-semibold text-center
                  font-[inherit] text-white/65 border-none outline-none"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <button
                onClick={handleAddEnemy}
                className="px-4 py-2 rounded-full text-[12px] font-semibold font-[inherit]
                  border-none cursor-pointer transition-colors"
                style={{ background: "rgba(74,180,58,0.14)", color: "#6aba4e" }}
              >
                {dict.equipment.add}
              </button>
              <button
                onClick={() => setShowAddEnemy(false)}
                className="p-2 rounded-full border-none cursor-pointer flex items-center
                  transition-colors text-white/25 hover:bg-white/[0.08] hover:text-white/55"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {enemies.length === 0 && !showAddEnemy && (
            <p className="text-[13px] italic text-white/20 py-1">{cm.noEnemies}</p>
          )}

          <div className="grid gap-3 [grid-template-columns:1fr_1fr] max-[600px]:grid-cols-1">
            {enemies.map((enemy) => {
              const pct = (enemy.hp / Math.max(1, enemy.hpMax)) * 100;
              return (
                <div
                  key={enemy.id}
                  className="rounded-[18px] px-4 py-4 relative"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <button
                    onClick={() => onRemoveEnemy(enemy.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full border-none cursor-pointer
                      flex items-center transition-colors
                      text-white/20 hover:bg-[rgba(224,74,58,0.15)] hover:text-[var(--color-coral)]"
                  >
                    <X size={11} />
                  </button>

                  <div className="text-[13px] font-bold text-white/65 pr-7 mb-2 truncate">
                    {enemy.name}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2 leading-none">
                    <span
                      className="text-[28px] font-extrabold"
                      style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em" }}
                    >
                      {enemy.hp}
                    </span>
                    <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>
                      &nbsp;/ {enemy.hpMax}
                    </span>
                  </div>

                  <div
                    className="h-[6px] rounded-full overflow-hidden mb-3"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: enemyBarColor(enemy.hp, enemy.hpMax) }}
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <div
                      className="flex gap-0.5 rounded-full p-[3px]"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {[5, 1].map((n) => (
                        <button
                          key={"ed" + n}
                          onClick={() => onAdjustEnemyHp(enemy.id, -n)}
                          className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
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
                      {[1, 5].map((n) => (
                        <button
                          key={"eh" + n}
                          onClick={() => onAdjustEnemyHp(enemy.id, n)}
                          className="px-2.5 py-[5px] text-[11px] border-none bg-transparent rounded-full
                            font-semibold font-[inherit] cursor-pointer transition-colors duration-150
                            text-white/45 hover:bg-[rgba(74,180,58,0.2)] hover:text-[#6aba4e]"
                        >
                          +{n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
