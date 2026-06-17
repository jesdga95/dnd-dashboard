"use client";

import { useState, useEffect, useRef } from "react";
import { doc, collection, onSnapshot, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { combatantKey } from "@/lib/combatDamage";
import type { DmCombat, Combatant, MonsterCombatant, OfflinePlayerCombatant } from "@/lib/types";

// Drop every logged damage event for a DM's combat (in batches, since a session
// can exceed Firestore's 500-write batch limit). Run on start (hygiene) and close.
async function clearEvents(dmUid: string) {
  const snap = await getDocs(collection(db, "dm_combats", dmUid, "events"));
  const refs = snap.docs.map((d) => d.ref);
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

export function useDmCombat() {
  const { user } = useAuth();
  const [combat, setCombat] = useState<DmCombat | null>(null);
  const [loading, setLoading] = useState(true);
  const combatRef = useRef<DmCombat | null>(null);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state on sign-out
      setCombat(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "dm_combats", user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        let data: DmCombat | null = snap.exists() ? (snap.data() as DmCombat) : null;
        if (data) {
          data = {
            ...data,
            combatants: data.combatants.map((cm) => {
              if (cm.type !== "monster") return cm;
              if (cm.visibility === undefined) {
                const old = (cm as unknown as { revealed?: boolean }).revealed;
                return { ...cm, visibility: old ? 2 : 0 } as typeof cm;
              }
              return cm;
            }),
          };
        }
        combatRef.current = data;
        setCombat(data);
        setLoading(false);
      },
      () => {
        combatRef.current = null;
        setCombat(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const write = async (data: DmCombat) => {
    if (!user) return;
    combatRef.current = data;
    await setDoc(doc(db, "dm_combats", user.uid), data);
  };

  const startCombat = async (combatants: Combatant[]) => {
    if (!user) return;
    await clearEvents(user.uid); // drop any leftover events from a combat that wasn't cleanly closed
    const sorted = [...combatants].sort((a, b) => b.initiativeRoll - a.initiativeRoll);
    await write({
      round: 1,
      currentTurnIndex: 0,
      combatants: sorted,
      combatId: crypto.randomUUID(),
      status: "active",
      activeAttackerKey: sorted.length ? combatantKey(sorted[0]) : null,
    });
  };

  // End Combat → keep the doc (and events) alive in a "finished" state so the
  // whole party can review the damage leaderboard before it's torn down.
  const finishCombat = async () => {
    const c = combatRef.current;
    if (!c) return;
    await write({ ...c, status: "finished" });
  };

  // Close → the real teardown: clear the damage log, then delete the combat doc.
  const closeCombat = async () => {
    if (!user) return;
    await clearEvents(user.uid);
    combatRef.current = null;
    await deleteDoc(doc(db, "dm_combats", user.uid));
  };

  // Advance to the next combatant that isn't downed (downedKeys is computed by
  // the caller, which has live player HP). The active attacker follows the turn.
  const nextTurn = async (downedKeys?: Set<string>) => {
    const c = combatRef.current;
    const n = c?.combatants.length ?? 0;
    if (!c || n === 0) return;
    let idx = c.currentTurnIndex;
    let round = c.round;
    for (let step = 0; step < n; step++) {
      const next = idx + 1;
      if (next >= n) {
        idx = 0;
        round += 1;
      } else {
        idx = next;
      }
      if (!downedKeys || !downedKeys.has(combatantKey(c.combatants[idx]))) break;
    }
    await write({
      ...c,
      currentTurnIndex: idx,
      round,
      activeAttackerKey: combatantKey(c.combatants[idx]),
    });
  };

  // The Crediting chip / override: set who damage is attributed to without
  // moving the turn. `null` ⇒ Unattributed.
  const setActiveAttacker = async (key: string | null) => {
    const c = combatRef.current;
    if (!c) return;
    await write({ ...c, activeAttackerKey: key });
  };

  // Swap a combatant with its neighbour to reorder the initiative list mid-combat.
  // The active-turn highlight follows the moved combatant so no turn is skipped/repeated.
  const moveCombatant = async (index: number, dir: -1 | 1) => {
    const c = combatRef.current;
    if (!c) return;
    const target = index + dir;
    if (target < 0 || target >= c.combatants.length) return;
    const combatants = [...c.combatants];
    [combatants[index], combatants[target]] = [combatants[target], combatants[index]];
    let currentTurnIndex = c.currentTurnIndex;
    if (currentTurnIndex === index) currentTurnIndex = target;
    else if (currentTurnIndex === target) currentTurnIndex = index;
    await write({ ...c, combatants, currentTurnIndex });
  };

  // Set a combatant's initiative value and re-sort (highest first), keeping the
  // active-turn highlight on the same combatant. For exact counts (Alert feat,
  // lair actions, readied/held actions); the arrows handle ties and manual nudges.
  const setInitiative = async (index: number, value: number) => {
    const c = combatRef.current;
    if (!c || index < 0 || index >= c.combatants.length) return;
    const current = c.combatants[c.currentTurnIndex];
    const currentKey = current ? combatantKey(current) : null;
    const combatants = c.combatants.map((cm, i) =>
      i === index ? { ...cm, initiativeRoll: value } : cm
    );
    combatants.sort((a, b) => b.initiativeRoll - a.initiativeRoll);
    const found = currentKey === null ? -1 : combatants.findIndex((cm) => combatantKey(cm) === currentKey);
    const currentTurnIndex = found >= 0 ? found : Math.min(c.currentTurnIndex, combatants.length - 1);
    await write({ ...c, combatants, currentTurnIndex });
  };

  // The id-based mutators below target any DM-managed combatant — monsters and
  // offline players alike (both carry an `id`; only synced players use `uid`).
  const updateMonster = async (id: string, patch: { ac?: number; hpMax?: number; tempAc?: number }) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) =>
        cm.type !== "player" && cm.id === id ? { ...cm, ...patch } : cm
      ),
    });
  };

  const addMonsters = async (monsters: MonsterCombatant[]) => {
    const c = combatRef.current;
    if (!c || monsters.length === 0) return;
    await write({ ...c, combatants: [...c.combatants, ...monsters] });
  };

  const addOfflinePlayer = async (player: OfflinePlayerCombatant) => {
    const c = combatRef.current;
    if (!c) return;
    await write({ ...c, combatants: [...c.combatants, player] });
  };

  const removeMonster = async (id: string) => {
    const c = combatRef.current;
    if (!c) return;
    const filtered = c.combatants.filter((cm) => !(cm.type !== "player" && cm.id === id));
    const cti = Math.min(c.currentTurnIndex, Math.max(0, filtered.length - 1));
    await write({ ...c, combatants: filtered, currentTurnIndex: cti });
  };

  const adjustMonsterHp = async (id: string, delta: number) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) => {
        if (cm.type === "player" || cm.id !== id) return cm;
        return { ...cm, hp: Math.max(0, Math.min(cm.hpMax, cm.hp + delta)) };
      }),
    });
  };

  const toggleMonsterReveal = async (id: string) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) =>
        cm.type === "monster" && cm.id === id
          ? { ...cm, visibility: (((cm.visibility ?? 0) + 1) % 3) as 0 | 1 | 2 }
          : cm
      ),
    });
  };

  const addMonsterCondition = async (id: string, condition: string) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) =>
        cm.type !== "player" && cm.id === id
          ? { ...cm, conditions: [...cm.conditions, condition] }
          : cm
      ),
    });
  };

  const removeMonsterCondition = async (id: string, condition: string) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) =>
        cm.type !== "player" && cm.id === id
          ? { ...cm, conditions: cm.conditions.filter((cd) => cd !== condition) }
          : cm
      ),
    });
  };

  return {
    combat,
    loading,
    startCombat,
    finishCombat,
    closeCombat,
    nextTurn,
    setActiveAttacker,
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
  };
}
