"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Swords, SkipForward, Maximize2, Minimize2 } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { useDmCombat } from "@/hooks/useDmCombat";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CombatantList, type MonsterControls, type MemberLiveData } from "@/components/combat/CombatantList";
import type { PartyMember } from "@/hooks/useDmParty";
import type { Combatant, MonsterCombatant, OfflinePlayerCombatant } from "@/lib/types";

interface DmCombatModeProps {
  members: PartyMember[];
  onClose: () => void;
}

// ── Shared combatant builders ─────────────────────────────────────────────────

interface StatDraft {
  name: string;
  hp: number;
  ac?: number;
  init: number;
  /** Monsters only — number of identical copies to spawn (defaults to 1). */
  count?: number;
}

const MAX_MONSTER_COUNT = 30;

const buildMonster = (d: StatDraft): MonsterCombatant => ({
  type: "monster",
  id: crypto.randomUUID(),
  name: d.name,
  hp: d.hp,
  hpMax: d.hp,
  ac: d.ac,
  initiativeRoll: d.init,
  conditions: [],
  visibility: 0,
});

/**
 * Expands a draft into `count` identical monsters sharing stats and initiative
 * (a monster group rolls one initiative). With count > 1 each copy is
 * name-suffixed ("Spider 1", "Spider 2", …) so it stays individually trackable.
 */
const buildMonsters = (d: StatDraft): MonsterCombatant[] => {
  const n = Math.min(MAX_MONSTER_COUNT, Math.max(1, Math.floor(d.count ?? 1)));
  return Array.from({ length: n }, (_, i) => ({
    ...buildMonster(d),
    name: n > 1 ? `${d.name} ${i + 1}` : d.name,
  }));
};

const buildOffline = (d: StatDraft): OfflinePlayerCombatant => ({
  type: "offline",
  id: crypto.randomUUID(),
  name: d.name,
  hp: d.hp,
  hpMax: d.hp,
  ac: d.ac,
  initiativeRoll: d.init,
  conditions: [],
});

// ── Reusable stat-block form (name / HP / AC / initiative) ────────────────────
// Used for both monsters and offline players. Pass onCancel to render the
// collapsible "X" (mid-combat); omit it for the always-open setup form.

function StatBlockForm({
  accent,
  addLabel,
  namePlaceholder,
  withCount,
  onAdd,
  onCancel,
}: {
  accent: "coral" | "blue";
  addLabel: string;
  namePlaceholder: string;
  /** Show a quantity field that spawns N identical copies (monsters only). */
  withCount?: boolean;
  onAdd: (d: StatDraft) => void;
  onCancel?: () => void;
}) {
  const dict = useDict();
  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [init, setInit] = useState("");
  const [count, setCount] = useState("");

  const accentBg = accent === "coral" ? "rgba(244,123,95,0.16)" : "rgba(99,149,225,0.18)";
  const accentColor = accent === "coral" ? "var(--color-coral)" : "#7aaee8";

  const submit = () => {
    const hpVal = parseInt(hp, 10);
    if (!name.trim() || isNaN(hpVal) || hpVal <= 0 || !init.trim()) return;
    onAdd({
      name: name.trim(),
      hp: hpVal,
      ac: ac ? parseInt(ac, 10) : undefined,
      init: parseInt(init, 10) || 0,
      ...(withCount && { count: parseInt(count, 10) || 1 }),
    });
    setName(""); setHp(""); setAc(""); setInit(""); setCount("");
  };

  return (
    <div
      className="w-full flex items-center gap-2 flex-wrap rounded-[16px] px-4 py-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <input
        autoFocus={!!onCancel}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
        maxLength={50}
        className="flex-1 min-w-[120px] px-3 py-[7px] rounded-full text-[13px] font-semibold
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <input
        type="number"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        placeholder={dict.dmCombat.hpPlaceholder}
        className="w-[76px] px-3 py-[7px] rounded-full text-[13px] font-semibold text-center
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <input
        type="number"
        value={ac}
        onChange={(e) => setAc(e.target.value)}
        placeholder={dict.dmCombat.acPlaceholder}
        className="w-[60px] px-3 py-[7px] rounded-full text-[13px] font-semibold text-center
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <input
        type="number"
        value={init}
        onChange={(e) => setInit(e.target.value)}
        placeholder={dict.dmCombat.initiativePlaceholder}
        className="w-[84px] px-3 py-[7px] rounded-full text-[13px] font-semibold text-center
          font-[inherit] text-white/70 border-none outline-none"
        style={{ background: "rgba(255,255,255,0.07)" }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {withCount && (
        <div
          className="flex items-center rounded-full pl-3 pr-1"
          style={{ background: "rgba(255,255,255,0.07)" }}
          title={dict.dmCombat.countTitle}
        >
          <span className="text-[13px] font-bold text-white/30 select-none">×</span>
          <input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="1"
            className="w-[44px] px-1 py-[7px] bg-transparent text-[13px] font-semibold text-center
              font-[inherit] text-white/70 border-none outline-none"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
      )}
      <button
        onClick={submit}
        className="flex items-center gap-1.5 px-4 py-[7px] rounded-full text-[13px]
          font-semibold font-[inherit] border-none cursor-pointer transition-colors"
        style={{ background: accentBg, color: accentColor }}
      >
        <Plus size={12} /> {addLabel}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-3 py-[7px] rounded-full cursor-pointer border-none text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// Listed row for a combatant queued during setup.
function DraftRow({
  c,
  accent,
  onRemove,
}: {
  c: MonsterCombatant | OfflinePlayerCombatant;
  accent: "coral" | "blue";
  onRemove: () => void;
}) {
  const dict = useDict();
  const initColor = accent === "coral" ? "var(--color-coral)" : "#7aaee8";
  return (
    <div
      className="flex items-center gap-2 rounded-[14px] px-4 py-2.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <span className="text-[14px] font-semibold text-white flex-1 truncate">{c.name}</span>
      <span className="text-[12px] text-white/40 shrink-0">{dict.dmCombat.hpLabel} {c.hpMax}</span>
      {c.ac !== undefined && (
        <span className="text-[12px] text-white/40 shrink-0">{dict.dmCombat.acLabel} {c.ac}</span>
      )}
      <span className="text-[12px] font-bold shrink-0" style={{ color: initColor }}>
        {dict.dmCombat.initiativeAbbr}{c.initiativeRoll}
      </span>
      <button
        onClick={onRemove}
        className="w-5 h-5 flex items-center justify-center rounded-full cursor-pointer
          text-white/25 hover:text-[var(--color-coral)] transition-colors shrink-0"
      >
        <X size={10} />
      </button>
    </div>
  );
}

// Collapsible add button → stat-block form, for mid-combat additions.
function InlineAdd({
  accent,
  openLabel,
  addLabel,
  namePlaceholder,
  withCount,
  onAdd,
}: {
  accent: "coral" | "blue";
  openLabel: string;
  addLabel: string;
  namePlaceholder: string;
  withCount?: boolean;
  onAdd: (d: StatDraft) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold
          cursor-pointer transition-colors"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Plus size={12} /> {openLabel}
      </button>
    );
  }

  return (
    <StatBlockForm
      accent={accent}
      addLabel={addLabel}
      namePlaceholder={namePlaceholder}
      withCount={withCount}
      onAdd={(d) => { onAdd(d); setOpen(false); }}
      onCancel={() => setOpen(false)}
    />
  );
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
  const [offlinePlayers, setOfflinePlayers] = useState<OfflinePlayerCombatant[]>([]);

  const allPlayerInitsSet = members.every((m) => (initiatives[m.uid] ?? "").trim() !== "");
  const canStart =
    (members.length > 0 || offlinePlayers.length > 0) &&
    monsters.length > 0 &&
    allPlayerInitsSet;

  const start = () => {
    if (!canStart) return;
    const playerCombatants: Combatant[] = members.map((m) => ({
      type: "player" as const,
      uid: m.uid,
      name: m.char.name || m.uid,
      initiativeRoll: parseInt(initiatives[m.uid] ?? "0", 10) || 0,
    }));
    onStart(
      [...playerCombatants, ...offlinePlayers, ...monsters].sort(
        (a, b) => b.initiativeRoll - a.initiativeRoll
      )
    );
  };

  return (
    <div className="px-5 py-6 max-w-[740px] mx-auto flex flex-col gap-5">
      {/* Player initiatives */}
      <div>
        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/25 block mb-3">
          {dict.dmCombat.playerInitiatives}
        </span>
        {members.length === 0 ? (
          <p className="text-[14px] text-white/30 italic">{dict.dmCombat.noParty}</p>
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
                <span className="text-[14px] font-semibold text-white flex-1 truncate min-w-0">
                  {m.char.name || m.uid}
                </span>
                <input
                  type="number"
                  value={initiatives[m.uid] ?? ""}
                  onChange={(e) => setInitiatives((p) => ({ ...p, [m.uid]: e.target.value }))}
                  placeholder={dict.dmCombat.initiativePlaceholder}
                  className="w-[90px] px-3 py-[7px] rounded-full text-[13px] font-semibold
                    text-center outline-none text-white/70 font-[inherit]"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline players — at the table but not on the app; DM tracks their HP */}
      <div>
        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/25 block mb-1.5">
          {dict.dmCombat.offlinePlayers}
        </span>
        <p className="text-[12px] text-white/25 italic mb-3">{dict.dmCombat.offlinePlayersHint}</p>

        {offlinePlayers.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {offlinePlayers.map((p, i) => (
              <DraftRow
                key={p.id}
                c={p}
                accent="blue"
                onRemove={() => setOfflinePlayers((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}

        <StatBlockForm
          accent="blue"
          addLabel={dict.dmCombat.addOfflinePlayer}
          namePlaceholder={dict.dmCombat.offlineNamePlaceholder}
          onAdd={(d) => setOfflinePlayers((prev) => [...prev, buildOffline(d)])}
        />
      </div>

      {/* Monsters */}
      <div>
        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/25 block mb-3">
          {dict.dmCombat.monsters}
        </span>

        {monsters.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {monsters.map((m, i) => (
              <DraftRow
                key={m.id}
                c={m}
                accent="coral"
                onRemove={() => setMonsters((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}

        <StatBlockForm
          accent="coral"
          addLabel={dict.dmCombat.addMonster}
          namePlaceholder={dict.dmCombat.namePlaceholder}
          withCount
          onAdd={(d) => setMonsters((prev) => [...prev, ...buildMonsters(d)])}
        />
      </div>

      {/* Start button */}
      <div>
        <button
          onClick={start}
          disabled={!canStart}
          className="w-full py-3.5 rounded-full text-[15px] font-bold cursor-pointer
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
          <p className="text-[12px] text-center italic text-white/25 mt-2">
            {dict.dmCombat.startRequirements}
          </p>
        )}
      </div>

      <div className="h-6" />
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
    moveCombatant,
    setInitiative,
    addMonsters,
    addOfflinePlayer,
    removeMonster,
    adjustMonsterHp,
    toggleMonsterReveal,
    addMonsterCondition,
    removeMonsterCondition,
    updateMonster,
  } = useDmCombat();

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSidebar = isDesktop && !isFullscreen;
  // keep a fresh ref to onClose without adding it to the keydown effect's deps
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Body scroll / padding
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

  // Build live member data for CombatantList
  const memberData: Record<string, MemberLiveData> = Object.fromEntries(
    members.map((m) => [
      m.uid,
      {
        hp: m.char.hp,
        hpMax: m.char.hpMax,
        tempHp: m.char.tempHp,
        ac: m.char.ac,
        tempAc: m.char.tempAc ?? 0,
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
      className={isSidebar
        ? "fixed top-0 right-0 bottom-0 z-[200] overflow-y-auto w-[420px] border-l border-white/[0.08]"
        : "fixed inset-0 z-[200] overflow-y-auto"
      }
      style={{
        background:
          "radial-gradient(ellipse 110% 55% at 50% -5%, rgba(160,25,8,0.3) 0%, transparent 65%), #0e0906",
      }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: "rgba(14,9,6,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center px-3 py-2 gap-1"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.22em] uppercase text-white/30 px-1.5">
            <Swords size={13} style={{ color: "var(--color-coral)" }} />
            <span>{combat ? dict.dmCombat.title : dict.dmCombat.setupTitle}</span>
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
            onClick={onClose}
            className="flex items-center p-1.5 rounded-[7px] bg-transparent cursor-pointer
              transition-colors text-white/40 hover:text-white/65 hover:bg-white/[0.06]
              border border-white/15 hover:border-white/25"
          >
            <X size={12} />
          </button>
        </div>

        {/* Round / actions bar — only during active combat */}
        {combat && (
          <div className="flex items-center px-3 py-1.5 gap-1">
            <span className="text-[12px] font-semibold text-white/25 px-1.5">
              {dict.dmCombat.round} {combat.round}
            </span>
            <div className="flex-1" />
            <button
              onClick={nextTurn}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[12px] font-semibold
                cursor-pointer font-[inherit] transition-colors
                bg-[rgba(244,123,95,0.12)] text-[var(--color-coral)] border border-[rgba(244,123,95,0.25)]
                hover:bg-[rgba(244,123,95,0.22)] hover:border-[rgba(244,123,95,0.4)]"
            >
              <SkipForward size={12} />
              {dict.dmCombat.nextTurn}
            </button>
            <button
              onClick={endCombat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[12px] font-semibold
                cursor-pointer font-[inherit] transition-colors
                bg-[rgba(244,123,95,0.12)] text-[var(--color-coral)] border border-[rgba(244,123,95,0.25)]
                hover:bg-[rgba(244,123,95,0.22)] hover:border-[rgba(244,123,95,0.4)]"
            >
              {dict.dmCombat.endCombat}
            </button>
          </div>
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
            reorder={moveCombatant}
            onSetInitiative={setInitiative}
          />

          <div className="mt-1 flex flex-wrap justify-end gap-2">
            <InlineAdd
              accent="coral"
              openLabel={dict.dmCombat.addMonster}
              addLabel={dict.dmCombat.addMonster}
              namePlaceholder={dict.dmCombat.namePlaceholder}
              withCount
              onAdd={(d) => addMonsters(buildMonsters(d))}
            />
            <InlineAdd
              accent="blue"
              openLabel={dict.dmCombat.addOfflinePlayer}
              addLabel={dict.dmCombat.addOfflinePlayer}
              namePlaceholder={dict.dmCombat.offlineNamePlaceholder}
              onAdd={(d) => addOfflinePlayer(buildOffline(d))}
            />
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
            className="w-full py-2.5 rounded-full text-[13px] font-semibold font-[inherit]
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
