"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Swords, SkipForward } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { useDmCombat } from "@/hooks/useDmCombat";
import { CombatantList, type MonsterControls, type MemberLiveData } from "@/components/combat/CombatantList";
import type { PartyMember } from "@/hooks/useDmParty";
import type { Combatant, MonsterCombatant } from "@/lib/types";

interface DmCombatModeProps {
  members: PartyMember[];
  onClose: () => void;
}

// ── Setup phase ──────────────────────────────────────────────────────────────

function SetupPhase({
  members,
  onStart,
}: {
  members: PartyMember[];
  onStart: (combatants: Combatant[]) => void;
}) {
  const dict = useDict();
  const [initiatives, setInitiatives] = useState<Record<string, string>>({});
  const [monsters, setMonsters] = useState<MonsterCombatant[]>([]);
  const [monsterName, setMonsterName] = useState("");
  const [monsterHp, setMonsterHp] = useState("");
  const [monsterAc, setMonsterAc] = useState("");
  const [monsterInit, setMonsterInit] = useState("");

  const addMonster = () => {
    const hpVal = parseInt(monsterHp, 10);
    if (!monsterName.trim() || isNaN(hpVal) || hpVal <= 0 || !monsterInit.trim()) return;
    setMonsters((prev) => [
      ...prev,
      {
        type: "monster",
        id: crypto.randomUUID(),
        name: monsterName.trim(),
        hp: hpVal,
        hpMax: hpVal,
        ac: monsterAc ? parseInt(monsterAc, 10) : undefined,
        initiativeRoll: parseInt(monsterInit, 10) || 0,
        conditions: [],
        revealed: false,
      },
    ]);
    setMonsterName("");
    setMonsterHp("");
    setMonsterAc("");
    setMonsterInit("");
  };

  const allPlayerInitsSet = members.every((m) => (initiatives[m.uid] ?? "").trim() !== "");
  const canStart = members.length > 0 && monsters.length > 0 && allPlayerInitsSet;

  const start = () => {
    if (!canStart) return;
    const playerCombatants: Combatant[] = members.map((m) => ({
      type: "player" as const,
      uid: m.uid,
      name: m.char.name || m.uid,
      initiativeRoll: parseInt(initiatives[m.uid] ?? "0", 10) || 0,
    }));
    onStart(
      [...playerCombatants, ...monsters].sort((a, b) => b.initiativeRoll - a.initiativeRoll)
    );
  };

  return (
    <div className="px-5 py-6 max-w-[740px] mx-auto flex flex-col gap-5">
      {/* Player initiatives */}
      <div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 block mb-3">
          {dict.dmCombat.playerInitiatives}
        </span>
        {members.length === 0 ? (
          <p className="text-[13px] text-white/30 italic">{dict.dmCombat.noParty}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <div
                key={m.uid}
                className="flex items-center gap-3 rounded-[16px] px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-[13px] font-semibold text-white flex-1 truncate min-w-0">
                  {m.char.name || m.uid}
                </span>
                <input
                  type="number"
                  value={initiatives[m.uid] ?? ""}
                  onChange={(e) => setInitiatives((p) => ({ ...p, [m.uid]: e.target.value }))}
                  placeholder={dict.dmCombat.initiativePlaceholder}
                  className="w-[90px] px-3 py-[7px] rounded-full text-[12px] font-semibold
                    text-center outline-none text-white/70 font-[inherit]"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monsters */}
      <div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 block mb-3">
          {dict.dmCombat.monsters}
        </span>

        {monsters.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {monsters.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-[14px] px-4 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-[13px] font-semibold text-white flex-1 truncate">
                  {m.name}
                </span>
                <span className="text-[11px] text-white/40 shrink-0">{dict.dmCombat.hpLabel} {m.hpMax}</span>
                {m.ac !== undefined && (
                  <span className="text-[11px] text-white/40 shrink-0">{dict.dmCombat.acLabel} {m.ac}</span>
                )}
                <span
                  className="text-[11px] font-bold shrink-0"
                  style={{ color: "var(--color-coral)" }}
                >
                  {dict.dmCombat.initiativeAbbr}{m.initiativeRoll}
                </span>
                <button
                  onClick={() => setMonsters((prev) => prev.filter((_, j) => j !== i))}
                  className="w-5 h-5 flex items-center justify-center rounded-full cursor-pointer
                    text-white/25 hover:text-[var(--color-coral)] transition-colors shrink-0"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className="flex items-center gap-2 flex-wrap rounded-[16px] px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <input
            type="text"
            value={monsterName}
            onChange={(e) => setMonsterName(e.target.value)}
            placeholder={dict.dmCombat.namePlaceholder}
            maxLength={50}
            className="flex-1 min-w-[120px] px-3 py-[7px] rounded-full text-[12px] font-semibold
              font-[inherit] text-white/70 border-none outline-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <input
            type="number"
            value={monsterHp}
            onChange={(e) => setMonsterHp(e.target.value)}
            placeholder={dict.dmCombat.hpPlaceholder}
            className="w-[76px] px-3 py-[7px] rounded-full text-[12px] font-semibold text-center
              font-[inherit] text-white/70 border-none outline-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <input
            type="number"
            value={monsterAc}
            onChange={(e) => setMonsterAc(e.target.value)}
            placeholder={dict.dmCombat.acPlaceholder}
            className="w-[60px] px-3 py-[7px] rounded-full text-[12px] font-semibold text-center
              font-[inherit] text-white/70 border-none outline-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <input
            type="number"
            value={monsterInit}
            onChange={(e) => setMonsterInit(e.target.value)}
            placeholder={dict.dmCombat.initiativePlaceholder}
            className="w-[84px] px-3 py-[7px] rounded-full text-[12px] font-semibold text-center
              font-[inherit] text-white/70 border-none outline-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
            onKeyDown={(e) => e.key === "Enter" && addMonster()}
          />
          <button
            onClick={addMonster}
            className="flex items-center gap-1.5 px-4 py-[7px] rounded-full text-[12px]
              font-semibold font-[inherit] border-none cursor-pointer transition-colors"
            style={{ background: "rgba(244,123,95,0.16)", color: "var(--color-coral)" }}
          >
            <Plus size={12} /> {dict.dmCombat.addMonster}
          </button>
        </div>
      </div>

      {/* Start button */}
      <div>
        <button
          onClick={start}
          disabled={!canStart}
          className="w-full py-3.5 rounded-full text-[14px] font-bold cursor-pointer
            transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "rgba(244,123,95,0.2)",
            color: "var(--color-coral)",
            border: "1px solid rgba(244,123,95,0.3)",
          }}
        >
          {dict.dmCombat.startCombat}
        </button>
        {!canStart && (
          <p className="text-[11px] text-center italic text-white/25 mt-2">
            {dict.dmCombat.startRequirements}
          </p>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}

// ── Mid-combat "Add Monster" form ────────────────────────────────────────────

function AddMonsterInline({ onAdd }: { onAdd: (m: MonsterCombatant) => void }) {
  const dict = useDict();
  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [init, setInit] = useState("");
  const [open, setOpen] = useState(false);

  const add = () => {
    const hpVal = parseInt(hp, 10);
    if (!name.trim() || isNaN(hpVal) || hpVal <= 0 || !init.trim()) return;
    onAdd({
      type: "monster",
      id: crypto.randomUUID(),
      name: name.trim(),
      hp: hpVal,
      hpMax: hpVal,
      ac: ac ? parseInt(ac, 10) : undefined,
      initiativeRoll: parseInt(init, 10) || 0,
      conditions: [],
      revealed: false,
    });
    setName(""); setHp(""); setAc(""); setInit(""); setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold
          cursor-pointer transition-colors"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Plus size={12} /> {dict.dmCombat.addMonster}
      </button>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-2 rounded-[16px] px-4 py-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder={dict.dmCombat.namePlaceholder} maxLength={50}
        className="flex-1 min-w-[100px] px-3 py-[6px] rounded-full text-[12px] font-semibold
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }} />
      <input type="number" value={hp} onChange={(e) => setHp(e.target.value)}
        placeholder={dict.dmCombat.hpPlaceholder}
        className="w-[68px] px-3 py-[6px] rounded-full text-[12px] font-semibold text-center
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }} />
      <input type="number" value={ac} onChange={(e) => setAc(e.target.value)}
        placeholder={dict.dmCombat.acPlaceholder}
        className="w-[56px] px-3 py-[6px] rounded-full text-[12px] font-semibold text-center
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }} />
      <input type="number" value={init} onChange={(e) => setInit(e.target.value)}
        placeholder={dict.dmCombat.initiativePlaceholder}
        className="w-[80px] px-3 py-[6px] rounded-full text-[12px] font-semibold text-center
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }}
        onKeyDown={(e) => e.key === "Enter" && add()} />
      <button onClick={add}
        className="px-3 py-[6px] rounded-full text-[12px] font-bold cursor-pointer border-none transition-colors"
        style={{ background: "rgba(244,123,95,0.16)", color: "var(--color-coral)" }}>
        <Plus size={12} />
      </button>
      <button onClick={() => setOpen(false)}
        className="px-3 py-[6px] rounded-full cursor-pointer border-none text-white/30 hover:text-white/60 transition-colors">
        <X size={12} />
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function DmCombatMode({ members, onClose }: DmCombatModeProps) {
  const dict = useDict();
  const {
    combat,
    startCombat,
    endCombat,
    nextTurn,
    addMonster,
    removeMonster,
    adjustMonsterHp,
    toggleMonsterReveal,
    addMonsterCondition,
    removeMonsterCondition,
    updateMonster,
  } = useDmCombat();

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Build live member data for CombatantList
  const memberData: Record<string, MemberLiveData> = Object.fromEntries(
    members.map((m) => [
      m.uid,
      {
        hp: m.char.hp,
        hpMax: m.char.hpMax,
        tempHp: m.char.tempHp,
        ac: m.char.ac,
        conditions: m.char.conditions,
      },
    ])
  );

  const monsterControls: MonsterControls = {
    onAdjustHp: adjustMonsterHp,
    onToggleReveal: toggleMonsterReveal,
    onAddCondition: addMonsterCondition,
    onRemoveCondition: removeMonsterCondition,
    onRemove: removeMonster,
    onUpdateMonster: updateMonster,
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
        className="sticky top-0 z-10 flex items-center px-5 py-3 gap-2"
        style={{
          background: "rgba(14,9,6,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[12.5px] font-semibold px-3 py-2 rounded-lg
              border-none bg-transparent cursor-pointer font-[inherit] transition-colors
              text-white/35 hover:text-white/65 hover:bg-white/[0.06]"
          >
            <X size={14} />
            <span className="max-[460px]:hidden">{dict.dmCombat.exit}</span>
          </button>
          {combat && (
            <button
              onClick={endCombat}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-full
                border-none cursor-pointer font-[inherit] transition-colors
                text-white/35 hover:text-white/60 hover:bg-white/[0.06] max-[460px]:hidden"
            >
              {dict.dmCombat.endCombat}
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase text-white/30">
            <Swords size={14} style={{ color: "var(--color-coral)" }} />
            <span>{combat ? dict.dmCombat.title : dict.dmCombat.setupTitle}</span>
            {combat && (
              <span className="text-white/20">· {dict.dmCombat.round} {combat.round}</span>
            )}
          </div>
        </div>

        {combat ? (
          <button
            onClick={nextTurn}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-full
              border-none cursor-pointer font-[inherit] transition-colors"
            style={{ background: "rgba(244,123,95,0.16)", color: "var(--color-coral)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,123,95,0.26)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,123,95,0.16)";
            }}
          >
            <SkipForward size={13} />
            <span className="max-[460px]:hidden">{dict.dmCombat.nextTurn}</span>
          </button>
        ) : (
          <div className="w-[80px]" />
        )}
      </div>

      {/* ── Body ── */}
      {!combat ? (
        <SetupPhase members={members} onStart={startCombat} />
      ) : (
        <div className="px-5 py-6 max-w-[740px] mx-auto flex flex-col gap-3">
          <CombatantList
            combat={combat}
            memberData={memberData}
            monsterControls={monsterControls}
          />

          <div className="mt-1">
            <AddMonsterInline onAdd={addMonster} />
          </div>

          <div className="h-10" />
        </div>
      )}

      {/* Mobile End Combat */}
      {combat && (
        <div
          className="hidden max-[460px]:block sticky bottom-0 px-5 py-3"
          style={{
            background: "rgba(14,9,6,0.92)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={endCombat}
            className="w-full py-2.5 rounded-full text-[12px] font-semibold font-[inherit]
              border-none cursor-pointer transition-colors text-white/40 hover:text-white/65
              hover:bg-white/[0.06]"
          >
            {dict.dmCombat.endCombat}
          </button>
        </div>
      )}
    </div>
  );
}
