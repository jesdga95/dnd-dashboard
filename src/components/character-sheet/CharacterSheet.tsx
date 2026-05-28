"use client";

import { useState } from "react";
import { useCharacter } from "@/hooks/useCharacter";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { CharacterHeader } from "@/components/header/CharacterHeader";
import { StatBentoRow } from "@/components/stats/StatBentoRow";
import { HpCard } from "@/components/health/HpCard";
import { DeathSaves } from "@/components/health/DeathSaves";
import { AbilityScores } from "@/components/abilities/AbilityScores";
import { CombatCard } from "@/components/combat/CombatCard";
import { SkillsCard } from "@/components/combat/SkillsCard";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { TraitsCard } from "@/components/traits/TraitsCard";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { NotesCard } from "@/components/notes/NotesCard";
import { SpellcastingCard } from "@/components/spellcasting/SpellcastingCard";
import { CombatMode, type CombatEnemy } from "@/components/combat/CombatMode";
import { DEFAULT_SPELLCASTING } from "@/lib/defaults";
import { clamp } from "@/lib/utils";

export function CharacterSheet() {
  const [combatOpen, setCombatOpen] = useState(false);
  const [combatEnemies, setCombatEnemies] = useState<CombatEnemy[]>([]);

  const addEnemy = (enemy: CombatEnemy) => setCombatEnemies((p) => [...p, enemy]);
  const adjustEnemyHp = (id: number, delta: number) =>
    setCombatEnemies((p) =>
      p.map((e) => (e.id === id ? { ...e, hp: clamp(e.hp + delta, 0, e.hpMax) } : e))
    );
  const removeEnemy = (id: number) => setCombatEnemies((p) => p.filter((e) => e.id !== id));

  const { user } = useAuth();
  const { role, resetProfile } = useProfile();

  const {
    char,
    loading,
    update,
    updateAbility,
    toggleSaveProficiency,
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
    addNote,
    updateNote,
    deleteNote,
  } = useCharacter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 pb-[60px] max-[700px]:px-[14px] max-[700px]:py-[18px]">
      {/* Header */}
      <CharacterHeader
        char={char}
        onUpdate={update}
        onReset={() => resetProfile(role ?? undefined)}
        onStartCombat={() => { setCombatOpen(true); update({ inCombat: true }); }}
        onToggleSharing={toggleSharing}
        isShared={char.isShared}
        userId={user?.uid ?? null}
      />

      <div className="h-3" />

      {/* HP + Death Saves */}
      <div className="grid gap-3 [grid-template-columns:1fr_auto] max-[700px]:grid-cols-1">
        <HpCard
          hp={char.hp}
          hpMax={char.hpMax}
          tempHp={char.tempHp ?? 0}
          onAdjust={adjustHp}
          onUpdate={update}
          onTempHpChange={setTempHp}
          onFullRest={fullRest}
        />
        <DeathSaves
          successes={char.deathSaves}
          failures={char.deathFails}
          onToggleSuccess={toggleDeathSave}
          onToggleFailure={toggleDeathFail}
          onClear={() => update({ deathSaves: 0, deathFails: 0 })}
        />
      </div>

      <div className="h-3" />

      {/* Bento stats */}
      <StatBentoRow char={char} onUpdate={update} onToggleInspiration={toggleInspiration} />

      <div className="h-3" />

      {/* Ability Scores */}
      <AbilityScores abilities={char.abilities} onUpdate={updateAbility} onToggleSave={toggleSaveProficiency} />

      <div className="h-3" />

      {/* Combat + Equipment */}
      <div className="grid gap-3 [grid-template-columns:1.4fr_1fr] max-[700px]:grid-cols-1">
        <CombatCard
          combat={char.combat}
          onSaveAttack={saveAttack}
          onDeleteAttack={deleteAttack}
        />
        <EquipmentCard
          equipment={char.equipment}
          onSave={saveEquipment}
          onDelete={deleteEquipment}
        />
      </div>

      <div className="h-3" />

      {/* Skills */}
      <SkillsCard
        skills={char.skills ?? {}}
        abilities={char.abilities}
        proficiency={char.proficiency}
        onUpdate={updateSkillProficiency}
      />

      <div className="h-3" />

      {/* Spellcasting */}
      <SpellcastingCard
        spellcasting={char.spellcasting ?? DEFAULT_SPELLCASTING}
        onUpdateMeta={updateSpellcasting}
        onUpdateSlot={updateSpellSlot}
        onAddSlotLevel={addSpellSlotLevel}
        onRemoveSlotLevel={removeSpellSlotLevel}
        onSaveSpell={saveSpell}
        onDeleteSpell={deleteSpell}
        onTogglePrepared={toggleSpellPrepared}
      />

      <div className="h-3" />

      {/* Traits */}
      <TraitsCard
        traits={char.traits}
        onSave={saveTrait}
        onDelete={deleteTrait}
      />

      <div className="h-3" />

      {/* Inventory + Coins */}
      <InventoryCard
        inventory={char.inventory}
        gold={char.gold}
        silver={char.silver}
        onSave={saveInventoryItem}
        onDelete={deleteInventoryItem}
        onToggle={toggleInventoryItem}
        onUpdate={update}
      />

      <div className="h-3" />

      {/* Notes */}
      <NotesCard
        notes={char.notes || []}
        onAdd={addNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
      />

      {combatOpen && (
        <CombatMode
          char={char}
          enemies={combatEnemies}
          statuses={char.conditions ?? []}
          onAdjustHp={adjustHp}
          onUpdateHp={update}
          onTempHpChange={setTempHp}
          onFullRest={fullRest}
          onAddEnemy={addEnemy}
          onAdjustEnemyHp={adjustEnemyHp}
          onRemoveEnemy={removeEnemy}
          onAddStatus={addCondition}
          onRemoveStatus={removeCondition}
          onClose={() => { setCombatOpen(false); update({ inCombat: false }); }}
        />
      )}
    </div>
  );
}
