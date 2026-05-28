"use client";

import { useCharacter } from "@/hooks/useCharacter";
import { CharacterHeader } from "@/components/header/CharacterHeader";
import { StatBentoRow } from "@/components/stats/StatBentoRow";
import { HpCard } from "@/components/health/HpCard";
import { DeathSaves } from "@/components/health/DeathSaves";
import { AbilityScores } from "@/components/abilities/AbilityScores";
import { CombatCard } from "@/components/combat/CombatCard";
import { CombatSkillsCard } from "@/components/combat/CombatSkillsCard";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { CoinPurse } from "@/components/coins/CoinPurse";
import { TraitsCard } from "@/components/traits/TraitsCard";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { NotesCard } from "@/components/notes/NotesCard";
import { SpellcastingCard } from "@/components/spellcasting/SpellcastingCard";
import { DEFAULT_SPELLCASTING } from "@/lib/defaults";

export function CharacterSheet() {
  const {
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
    updateSkillProficiency,
    toggleInspiration,
    updateSpellcasting,
    updateSpellSlot,
    saveSpell,
    deleteSpell,
    toggleSpellPrepared,
    addNote,
    updateNote,
    deleteNote,
    resetCharacter,
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
        onReset={resetCharacter}
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
      <AbilityScores abilities={char.abilities} onUpdate={updateAbility} />

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

      {/* Combat Skills */}
      <CombatSkillsCard
        combatSkills={char.combatSkills ?? {}}
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
        onSaveSpell={saveSpell}
        onDeleteSpell={deleteSpell}
        onTogglePrepared={toggleSpellPrepared}
      />

      <div className="h-3" />

      {/* Coins + Traits | Inventory */}
      <div className="grid gap-3 [grid-template-columns:1fr_1.2fr] max-[700px]:grid-cols-1">
        <div className="grid gap-3 content-start">
          <CoinPurse gold={char.gold} silver={char.silver} onUpdate={update} />
          <TraitsCard
            traits={char.traits}
            onSave={saveTrait}
            onDelete={deleteTrait}
          />
        </div>
        <InventoryCard
          inventory={char.inventory}
          onSave={saveInventoryItem}
          onDelete={deleteInventoryItem}
          onToggle={toggleInventoryItem}
        />
      </div>

      <div className="h-3" />

      {/* Notes */}
      <NotesCard
        notes={char.notes || []}
        onAdd={addNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
      />
    </div>
  );
}
