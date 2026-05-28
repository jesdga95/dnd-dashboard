"use client";

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { DEFAULT_CHAR, DEFAULT_SPELLCASTING } from "@/lib/defaults";
import { clamp, generateId } from "@/lib/utils";
import type {
  Character,
  AbilityKey,
  EquipmentItem,
  InventoryItem,
  Trait,
  Note,
  Attack,
  SkillProficiency,
  Spellcasting,
  Spell,
} from "@/lib/types";

export function useCharacter() {
  const { user } = useAuth();
  const [char, setCharState] = useState<Character>(DEFAULT_CHAR);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWriteRef = useRef<Character | null>(null);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCharState(DEFAULT_CHAR);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "characters", user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setCharState({ ...DEFAULT_CHAR, ...(snapshot.data() as Character) });
        } else {
          setDoc(docRef, DEFAULT_CHAR);
          setCharState(DEFAULT_CHAR);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore read failed:", error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user]);

  const setChar = (updater: Character | ((prev: Character) => Character)) => {
    setCharState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      pendingWriteRef.current = next;

      if (user) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const toWrite = pendingWriteRef.current;
          if (toWrite && user) {
            setDoc(doc(db, "characters", user.uid), toWrite).catch(() => {});
          }
        }, 300);
      }

      return next;
    });
  };

  const update = (patch: Partial<Character>) =>
    setChar((c) => ({ ...c, ...patch }));

  const updateAbility = (key: AbilityKey, field: "score" | "mod", val: number | null) =>
    setChar((c) => ({
      ...c,
      abilities: {
        ...c.abilities,
        [key]: { ...c.abilities[key], [field]: val },
      },
    }));

  const toggleSaveProficiency = (key: AbilityKey) =>
    setChar((c) => ({
      ...c,
      abilities: {
        ...c.abilities,
        [key]: { ...c.abilities[key], saveProficient: !c.abilities[key].saveProficient },
      },
    }));

  const adjustHp = (delta: number) =>
    setChar((c) => {
      const hp = c.hp ?? 0;
      const hpMax = c.hpMax ?? 0;
      const tempHp = c.tempHp ?? 0;
      if (delta >= 0) return { ...c, hp: clamp(hp + delta, 0, hpMax) };
      // Damage drains temp HP first
      const tempAbsorb = Math.min(tempHp, -delta);
      const remaining = -delta - tempAbsorb;
      return {
        ...c,
        tempHp: tempHp - tempAbsorb,
        hp: clamp(hp - remaining, 0, hpMax),
      };
    });

  const setTempHp = (val: number) =>
    setChar((c) => ({ ...c, tempHp: Math.max(0, val) }));

  const fullRest = () =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      return {
        ...c,
        hp: c.hpMax,
        tempHp: 0,
        deathSaves: 0,
        deathFails: 0,
        spellcasting: {
          ...sc,
          slots: Object.fromEntries(
            Object.entries(sc.slots).map(([k, v]) => [k, { ...v, used: 0 }])
          ),
        },
      };
    });

  // Death save toggle: click at index i sets count to i+1 if i >= current, else i
  const toggleDeathSave = (i: number) =>
    setChar((c) => ({
      ...c,
      deathSaves: clamp(i < c.deathSaves ? i : i + 1, 0, 3),
    }));

  const toggleDeathFail = (i: number) =>
    setChar((c) => ({
      ...c,
      deathFails: clamp(i < c.deathFails ? i : i + 1, 0, 3),
    }));

  // Equipment CRUD
  const saveEquipment = (item: EquipmentItem) =>
    setChar((c) => ({
      ...c,
      equipment: item.id
        ? c.equipment.map((e) => (e.id === item.id ? item : e))
        : [...c.equipment, { ...item, id: generateId() }],
    }));

  const deleteEquipment = (id: number) =>
    setChar((c) => ({ ...c, equipment: c.equipment.filter((e) => e.id !== id) }));

  // Inventory CRUD
  const saveInventoryItem = (item: InventoryItem) =>
    setChar((c) => ({
      ...c,
      inventory: item.id
        ? c.inventory.map((i) => (i.id === item.id ? item : i))
        : [...c.inventory, { ...item, id: generateId(), checked: false }],
    }));

  const deleteInventoryItem = (id: number) =>
    setChar((c) => ({ ...c, inventory: c.inventory.filter((i) => i.id !== id) }));

  const toggleInventoryItem = (id: number) =>
    setChar((c) => ({
      ...c,
      inventory: c.inventory.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));

  // Traits CRUD
  const saveTrait = (trait: Trait) =>
    setChar((c) => ({
      ...c,
      traits: trait.id
        ? c.traits.map((t) => (t.id === trait.id ? trait : t))
        : [...c.traits, { ...trait, id: generateId() }],
    }));

  const deleteTrait = (id: number) =>
    setChar((c) => ({ ...c, traits: c.traits.filter((t) => t.id !== id) }));

  // Attacks CRUD
  const saveAttack = (attack: Attack) =>
    setChar((c) => ({
      ...c,
      combat: {
        ...c.combat,
        attacks: attack.id
          ? c.combat.attacks.map((a) => (a.id === attack.id ? attack : a))
          : [...c.combat.attacks, { ...attack, id: generateId() }],
      },
    }));

  const deleteAttack = (id: number) =>
    setChar((c) => ({
      ...c,
      combat: {
        ...c.combat,
        attacks: c.combat.attacks.filter((a) => a.id !== id),
      },
    }));

  // Combat skills
  const updateSkillProficiency = (skill: string, proficiency: SkillProficiency) =>
    setChar((c) => ({
      ...c,
      skills: { ...(c.skills ?? {}), [skill]: proficiency },
    }));

  // Notes CRUD
  const addNote = () =>
    setChar((c) => ({
      ...c,
      notes: [{ id: generateId(), title: "", body: "" }, ...(c.notes || [])],
    }));

  const updateNote = (id: number, patch: Partial<Note>) =>
    setChar((c) => ({
      ...c,
      notes: (c.notes || []).map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));

  const deleteNote = (id: number) =>
    setChar((c) => ({ ...c, notes: (c.notes || []).filter((n) => n.id !== id) }));

  const toggleInspiration = () =>
    setChar((c) => ({ ...c, inspiration: !c.inspiration }));

  const addCondition = (s: string) =>
    setChar((c) => ({
      ...c,
      conditions: (c.conditions ?? []).includes(s) ? (c.conditions ?? []) : [...(c.conditions ?? []), s],
    }));

  const removeCondition = (index: number) =>
    setChar((c) => ({
      ...c,
      conditions: (c.conditions ?? []).filter((_, i) => i !== index),
    }));

  const toggleSharing = () =>
    setChar((c) => ({ ...c, isShared: !c.isShared }));

  const updateSpellcasting = (patch: Partial<Pick<Spellcasting, "ability" | "saveDC" | "attackBonus">>) =>  // saveDC/attackBonus may be null
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      return { ...c, spellcasting: { ...sc, ...patch } };
    });

  const updateSpellSlot = (level: number, field: "max" | "used", val: number) =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      const slot = sc.slots[level] ?? { max: 0, used: 0 };
      const newMax = field === "max" ? Math.max(0, val) : slot.max;
      const newUsed = field === "used"
        ? Math.max(0, Math.min(val, newMax))
        : Math.min(slot.used ?? 0, newMax);
      return {
        ...c,
        spellcasting: {
          ...sc,
          slots: { ...sc.slots, [level]: { max: newMax, used: newUsed } },
        },
      };
    });

  const addSpellSlotLevel = (level: number) =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      if (sc.slots[level]) return c;
      return {
        ...c,
        spellcasting: {
          ...sc,
          slots: { ...sc.slots, [level]: { max: 1, used: 0 } },
        },
      };
    });

  const removeSpellSlotLevel = (level: number) =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [level]: _slot, ...rest } = sc.slots;
      return { ...c, spellcasting: { ...sc, slots: rest } };
    });

  const saveSpell = (spell: Spell) =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      return {
        ...c,
        spellcasting: {
          ...sc,
          spells: spell.id
            ? sc.spells.map((s) => (s.id === spell.id ? spell : s))
            : [...sc.spells, { ...spell, id: generateId() }],
        },
      };
    });

  const deleteSpell = (id: number) =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      return {
        ...c,
        spellcasting: { ...sc, spells: sc.spells.filter((s) => s.id !== id) },
      };
    });

  const toggleSpellPrepared = (id: number) =>
    setChar((c) => {
      const sc = c.spellcasting ?? DEFAULT_SPELLCASTING;
      return {
        ...c,
        spellcasting: {
          ...sc,
          spells: sc.spells.map((s) => (s.id === id ? { ...s, prepared: !s.prepared } : s)),
        },
      };
    });

  const resetCharacter = () => setChar(DEFAULT_CHAR);

  const hpPercent = Math.max(0, Math.min(100, ((char.hp ?? 0) / Math.max(1, char.hpMax ?? 0)) * 100));

  return {
    char,
    loading,
    update,
    updateAbility,
    adjustHp,
    setTempHp,
    fullRest,
    toggleDeathSave,
    toggleDeathFail,
    saveEquipment,
    deleteEquipment,
    saveInventoryItem,
    deleteInventoryItem,
    toggleInventoryItem,
    saveTrait,
    deleteTrait,
    saveAttack,
    deleteAttack,
    addNote,
    updateNote,
    deleteNote,
    updateSkillProficiency,
    toggleInspiration,
    addCondition,
    removeCondition,
    toggleSharing,
    updateSpellcasting,
    updateSpellSlot,
    addSpellSlotLevel,
    removeSpellSlotLevel,
    saveSpell,
    deleteSpell,
    toggleSpellPrepared,
    toggleSaveProficiency,
    resetCharacter,
    hpPercent,
  };
}
