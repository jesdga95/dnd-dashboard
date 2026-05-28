"use client";

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { DmCombat, Combatant, MonsterCombatant } from "@/lib/types";

export function useDmCombat() {
  const { user } = useAuth();
  const [combat, setCombat] = useState<DmCombat | null>(null);
  const [loading, setLoading] = useState(true);
  const combatRef = useRef<DmCombat | null>(null);

  useEffect(() => {
    if (!user) {
      setCombat(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "dm_combats", user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        const data = snap.exists() ? (snap.data() as DmCombat) : null;
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
    const sorted = [...combatants].sort((a, b) => b.initiativeRoll - a.initiativeRoll);
    await write({ round: 1, currentTurnIndex: 0, combatants: sorted });
  };

  const endCombat = async () => {
    if (!user) return;
    combatRef.current = null;
    await deleteDoc(doc(db, "dm_combats", user.uid));
  };

  const nextTurn = async () => {
    const c = combatRef.current;
    if (!c) return;
    const next = c.currentTurnIndex + 1;
    const wrapped = next >= c.combatants.length;
    await write({
      ...c,
      currentTurnIndex: wrapped ? 0 : next,
      round: wrapped ? c.round + 1 : c.round,
    });
  };

  const updateMonster = async (id: string, patch: Partial<MonsterCombatant>) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) =>
        cm.type === "monster" && cm.id === id ? { ...cm, ...patch } : cm
      ),
    });
  };

  const addMonster = async (monster: MonsterCombatant) => {
    const c = combatRef.current;
    if (!c) return;
    await write({ ...c, combatants: [...c.combatants, monster] });
  };

  const removeMonster = async (id: string) => {
    const c = combatRef.current;
    if (!c) return;
    const filtered = c.combatants.filter((cm) => !(cm.type === "monster" && cm.id === id));
    const cti = Math.min(c.currentTurnIndex, Math.max(0, filtered.length - 1));
    await write({ ...c, combatants: filtered, currentTurnIndex: cti });
  };

  const adjustMonsterHp = async (id: string, delta: number) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) => {
        if (cm.type !== "monster" || cm.id !== id) return cm;
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
        cm.type === "monster" && cm.id === id ? { ...cm, revealed: !cm.revealed } : cm
      ),
    });
  };

  const addMonsterCondition = async (id: string, condition: string) => {
    const c = combatRef.current;
    if (!c) return;
    await write({
      ...c,
      combatants: c.combatants.map((cm) =>
        cm.type === "monster" && cm.id === id
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
        cm.type === "monster" && cm.id === id
          ? { ...cm, conditions: cm.conditions.filter((cd) => cd !== condition) }
          : cm
      ),
    });
  };

  return {
    combat,
    loading,
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
  };
}
