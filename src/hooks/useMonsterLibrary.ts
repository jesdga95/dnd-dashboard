"use client";

import { useState, useEffect, useRef } from "react";
import { db, doc, onSnapshot, setDoc } from "@/lib/data";
import { useAuth } from "./useAuth";
import type { MonsterLibrary, MonsterTemplate } from "@/lib/types";

/** The editable fields of a card; the hook owns `id` and `createdAt`. */
export type MonsterDraft = Partial<Omit<MonsterTemplate, "id" | "createdAt">>;

// Firestore rejects `undefined` field values, so optional stats are dropped
// rather than written as undefined. Blank notes are dropped too, to keep the doc small.
function normalize(t: MonsterTemplate): MonsterTemplate {
  return {
    id: t.id,
    name: t.name,
    hp: t.hp,
    createdAt: t.createdAt,
    ...(t.ac !== undefined && { ac: t.ac }),
    ...(t.initBonus !== undefined && { initBonus: t.initBonus }),
    ...(t.notes?.trim() ? { notes: t.notes } : {}),
  };
}

/**
 * The DM's bestiary: one doc (`monster_library/{dmUid}`) holding an array of
 * monster cards, so the whole library arrives in a single snapshot and the
 * combat picker can filter it locally.
 *
 * Writes are debounced (the dashboard edits cards inline, keystroke by keystroke)
 * and always send the full array, so a pending write never loses an edit made
 * while it was in flight.
 */
export function useMonsterLibrary() {
  const { user } = useAuth();
  const [monsters, setMonsters] = useState<MonsterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<MonsterTemplate[] | null>(null);
  const seqRef = useRef(0);
  // Mirrors the live list so mutators build on the newest array even when two
  // edits land in the same tick (state itself is only read during render).
  const listRef = useRef<MonsterTemplate[]>([]);

  useEffect(() => {
    if (!user) {
      listRef.current = [];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state on sign-out
      setMonsters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "monster_library", user.uid);

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setLoading(false);
        // A local edit is mid-flight: its own echo is behind what's on screen.
        if (pendingRef.current) return;
        const data = snap.exists() ? (snap.data() as MonsterLibrary) : null;
        listRef.current = Array.isArray(data?.monsters) ? data.monsters : [];
        setMonsters(listRef.current);
      },
      () => {
        listRef.current = [];
        setMonsters([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user]);

  const commit = (next: MonsterTemplate[]) => {
    listRef.current = next;
    setMonsters(next);
    if (!user) return;
    pendingRef.current = next;
    const seq = ++seqRef.current;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const toWrite = pendingRef.current;
      if (!toWrite) return;
      setDoc(doc(db, "monster_library", user.uid), { monsters: toWrite.map(normalize) })
        .catch(() => {})
        .finally(() => {
          // Only the newest write hands the snapshot back its authority.
          if (seqRef.current === seq) pendingRef.current = null;
        });
    }, 300);
  };

  /** Newest card first, so a freshly added (blank) card is where the DM is looking. */
  const addMonster = (draft: MonsterDraft = {}): MonsterTemplate => {
    const card: MonsterTemplate = {
      id: crypto.randomUUID(),
      name: draft.name ?? "",
      hp: draft.hp ?? 1,
      createdAt: Date.now(),
      ...(draft.ac !== undefined && { ac: draft.ac }),
      ...(draft.initBonus !== undefined && { initBonus: draft.initBonus }),
      ...(draft.notes !== undefined && { notes: draft.notes }),
    };
    commit([card, ...listRef.current]);
    return card;
  };

  const updateMonster = (id: string, patch: MonsterDraft) =>
    commit(listRef.current.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const deleteMonster = (id: string) => commit(listRef.current.filter((m) => m.id !== id));

  /**
   * Keep an improvised monster from the combat form. Upserts by name so saving
   * the same creature twice refreshes its card instead of duplicating it.
   */
  const saveToLibrary = (draft: MonsterDraft & { name: string }): MonsterTemplate => {
    const list = listRef.current;
    const existing = list.find(
      (m) => m.name.trim().toLowerCase() === draft.name.trim().toLowerCase()
    );
    if (!existing) return addMonster(draft);
    const merged: MonsterTemplate = { ...existing, ...draft };
    commit(list.map((m) => (m.id === existing.id ? merged : m)));
    return merged;
  };

  return { monsters, loading, addMonster, updateMonster, deleteMonster, saveToLibrary };
}
