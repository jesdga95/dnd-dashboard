"use client";

import { useState, useEffect } from "react";
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
import { ResourcesCard } from "@/components/resources/ResourcesCard";
import { PlayerCombatView } from "@/components/combat/PlayerCombatView";
import { usePlayerCombat } from "@/hooks/usePlayerCombat";
import { useDict } from "@/lib/DictContext";
import { Swords } from "lucide-react";
import { DEFAULT_SPELLCASTING } from "@/lib/defaults";

export function CharacterSheet() {
  const dict = useDict();
  const { combat: dmCombat } = usePlayerCombat();
  const [dmCombatDismissed, setDmCombatDismissed] = useState(false);

  // Auto-show overlay when a new combat begins (null → non-null transition only)
  useEffect(() => {
    if (dmCombat) setDmCombatDismissed(false);
  }, [!!dmCombat]); // eslint-disable-line react-hooks/exhaustive-deps

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
    shortRest,
    longRest,
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
    addCustomResource,
    updateCustomResource,
    removeCustomResource,
    importChar,
  } = useCharacter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 pb-[60px] max-[1024px]:px-[14px] max-[1024px]:py-[18px]">
      {/* Header */}
      <CharacterHeader
        char={char}
        onUpdate={update}
        onImport={importChar}
        onReset={() => resetProfile(role ?? undefined)}
        onShortRest={shortRest}
        onLongRest={longRest}
        onToggleSharing={toggleSharing}
        isShared={char.isShared}
        userId={user?.uid ?? null}
      />

      <div className="h-3" />

      {/* HP + Death Saves */}
      <div className="grid gap-3 [grid-template-columns:1fr_auto] max-[1024px]:grid-cols-1">
        <HpCard
          hp={char.hp}
          hpMax={char.hpMax}
          tempHp={char.tempHp ?? 0}
          onAdjust={adjustHp}
          onUpdate={update}
          onTempHpChange={setTempHp}
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
      <StatBentoRow
        char={char}
        abilities={char.abilities}
        skills={char.skills ?? {}}
        onUpdate={update}
        onToggleInspiration={toggleInspiration}
      />

      <div className="h-3" />

      {/* Ability Scores */}
      <AbilityScores
        abilities={char.abilities}
        proficiency={char.proficiency}
        onUpdate={updateAbility}
        onToggleSave={toggleSaveProficiency}
      />

      <div className="h-3" />

      {/* Combat + Equipment */}
      <div className="grid gap-3 [grid-template-columns:1.4fr_1fr] max-[1024px]:grid-cols-1">
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
        abilities={char.abilities}
        proficiency={char.proficiency}
        onUpdateMeta={updateSpellcasting}
        onUpdateSlot={updateSpellSlot}
        onAddSlotLevel={addSpellSlotLevel}
        onRemoveSlotLevel={removeSpellSlotLevel}
        onSaveSpell={saveSpell}
        onDeleteSpell={deleteSpell}
        onTogglePrepared={toggleSpellPrepared}
      />

      <div className="h-3" />

      {/* Resources + Traits */}
      <div className="grid gap-3 grid-cols-2 max-[1024px]:grid-cols-1">
        <ResourcesCard
          resources={char.customResources ?? []}
          onAdd={addCustomResource}
          onUpdate={updateCustomResource}
          onRemove={removeCustomResource}
        />
        <TraitsCard
          traits={char.traits}
          onSave={saveTrait}
          onDelete={deleteTrait}
        />
      </div>

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
      <NotesCard characterName={char.name} />

      {dmCombat && user?.uid && !dmCombatDismissed && (
        <PlayerCombatView
          uid={user.uid}
          char={char}
          statuses={char.conditions ?? []}
          onAdjustHp={adjustHp}
          onUpdateHp={update}
          onTempHpChange={setTempHp}
          onAddStatus={addCondition}
          onRemoveStatus={removeCondition}
          onDismiss={() => setDmCombatDismissed(true)}
        />
      )}

      {dmCombat && dmCombatDismissed && (
        <button
          onClick={() => setDmCombatDismissed(false)}
          className="fixed bottom-6 right-6 z-[190] flex items-center gap-2 px-4 py-3
            rounded-[14px] text-[14px] font-bold cursor-pointer shadow-2xl transition-all duration-150"
          style={{
            background: "rgba(244,123,95,0.95)",
            color: "white",
            border: "1px solid rgba(244,123,95,0.4)",
          }}
        >
          <Swords size={15} />
          <span>{dict.combat.title}</span>
        </button>
      )}
    </div>
  );
}
