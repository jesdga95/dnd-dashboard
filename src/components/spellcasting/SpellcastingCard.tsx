"use client";

import { useState } from "react";
import { Wand2, Plus, Minus, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import { useDict } from "@/lib/DictContext";
import type { Spellcasting, Spell, SpellSlot, SpellcastingAbility } from "@/lib/types";

const ABILITY_OPTIONS: SpellcastingAbility[] = ["Intelligence", "Wisdom", "Charisma"];

const BLANK_SPELL: Spell = {
  id: 0,
  name: "",
  level: 0,
  prepared: false,
  concentration: false,
  ritual: false,
  castTime: "",
  range: "",
  duration: "",
  desc: "",
};

interface SpellcastingCardProps {
  spellcasting: Spellcasting;
  onUpdateMeta: (patch: Partial<Pick<Spellcasting, "ability" | "saveDC" | "attackBonus">>) => void;
  onUpdateSlot: (level: number, field: "max" | "used", val: number) => void;
  onSaveSpell: (spell: Spell) => void;
  onDeleteSpell: (id: number) => void;
  onTogglePrepared: (id: number) => void;
}

export function SpellcastingCard({
  spellcasting,
  onUpdateMeta,
  onUpdateSlot,
  onSaveSpell,
  onDeleteSpell,
  onTogglePrepared,
}: SpellcastingCardProps) {
  const dict = useDict();
  const [editing, setEditing] = useState<Spell | null>(null);

  const byLevel: Record<number, Spell[]> = {};
  for (const spell of spellcasting.spells) {
    if (!byLevel[spell.level]) byLevel[spell.level] = [];
    byLevel[spell.level].push(spell);
  }

  const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (l) => byLevel[l]?.length
  );

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">

      <SectionHeader
        icon={<IconPill tint="lavender"><Wand2 size={14} /></IconPill>}
        title={dict.spellcasting.title}
        actions={
          <Btn variant="default" size="sm" onClick={() => setEditing({ ...BLANK_SPELL })}>
            <Plus size={11} /> {dict.spellcasting.addSpell}
          </Btn>
        }
      />

      {/* Meta: ability / save DC / attack bonus */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="bg-[var(--color-lavender)] rounded-[14px] px-3.5 py-3">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase
            text-[var(--color-lavender-deep)] mb-2">
            {dict.spellcasting.meta.ability}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ABILITY_OPTIONS.map((a) => (
              <button
                key={a}
                onClick={() => onUpdateMeta({ ability: a })}
                className={`text-[11px] font-bold rounded-full px-2 py-[3px] cursor-pointer
                  transition-all duration-150 border-0
                  ${spellcasting.ability === a
                    ? "bg-[var(--color-lavender-deep)] text-white"
                    : "bg-white/60 text-[var(--color-lavender-deep)] hover:bg-white"
                  }`}
              >
                {dict.abilities.abbr[a]}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-blue)] rounded-[14px] px-3.5 py-3">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase
            text-[var(--color-blue-deep)] mb-1">
            {dict.spellcasting.meta.saveDC}
          </div>
          <div className="text-[26px] font-extrabold tracking-tight leading-none">
            <EditableNumber
              value={spellcasting.saveDC}
              onChange={(v) => onUpdateMeta({ saveDC: v })}
              style={{ width: 52, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}
            />
          </div>
        </div>

        <div className="bg-[var(--color-mint)] rounded-[14px] px-3.5 py-3">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase
            text-[var(--color-mint-deep)] mb-1">
            {dict.spellcasting.meta.atkBonus}
          </div>
          <div className="flex items-baseline gap-[2px] leading-none">
            <span className="text-[16px] font-bold text-[var(--color-muted)]">+</span>
            <EditableNumber
              value={spellcasting.attackBonus}
              onChange={(v) => onUpdateMeta({ attackBonus: v })}
              style={{ width: 48, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}
            />
          </div>
        </div>
      </div>

      {/* Spell slots */}
      <div className="mb-4">
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase
          text-[var(--color-muted)] mb-2">
          {dict.spellcasting.slots.title}
        </div>
        <div className="grid grid-cols-3 max-[600px]:grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot: SpellSlot = spellcasting.slots[level] ?? { max: 0, used: 0 };
            const available = slot.max - slot.used;
            return (
              <SlotLevel
                key={level}
                level={level}
                slot={slot}
                available={available}
                onUpdateSlot={onUpdateSlot}
              />
            );
          })}
        </div>
      </div>

      {/* Spell list */}
      {spellLevels.length > 0 && (
        <div>
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase
            text-[var(--color-muted)] mb-2">
            {dict.spellcasting.list.title}
          </div>
          <div className="grid gap-3">
            {spellLevels.map((level) => (
              <div key={level}>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em]
                  text-[var(--color-muted-soft)] mb-0.5 px-1">
                  {level === 0
                    ? dict.spellcasting.list.cantrips
                    : `${dict.spellcasting.ordinals[level]} ${dict.spellcasting.list.levelSuffix}`}
                </div>
                {(byLevel[level] ?? []).map((spell) => (
                  <SpellRow
                    key={spell.id}
                    spell={spell}
                    onEdit={() => setEditing(spell)}
                    onDelete={() => onDeleteSpell(spell.id)}
                    onTogglePrepared={() => onTogglePrepared(spell.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {spellcasting.spells.length === 0 && (
        <p className="text-center py-4 text-[13px] text-[var(--color-muted-soft)]">
          {dict.spellcasting.noSpellsPre}{" "}
          <strong>{dict.spellcasting.noSpellsHighlight}</strong>{" "}
          {dict.spellcasting.noSpellsPost}
        </p>
      )}

      {editing && (
        <SpellModal
          spell={editing}
          onSave={(s) => { onSaveSpell(s); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function SlotLevel({
  level,
  slot,
  available,
  onUpdateSlot,
}: {
  level: number;
  slot: SpellSlot;
  available: number;
  onUpdateSlot: (level: number, field: "max" | "used", val: number) => void;
}) {
  const dict = useDict();
  return (
    <div className="bg-[var(--color-bg-warm)] rounded-[14px] px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          {dict.spellcasting.ordinals[level]}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onUpdateSlot(level, "max", slot.max - 1)}
            disabled={slot.max === 0}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer
              text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]
              transition-colors duration-100 disabled:opacity-30 disabled:cursor-default"
          >
            <Minus size={9} />
          </button>
          <span className="text-[11px] font-semibold w-4 text-center text-[var(--color-ink)]">
            {slot.max}
          </span>
          <button
            onClick={() => onUpdateSlot(level, "max", slot.max + 1)}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer
              text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]
              transition-colors duration-100"
          >
            <Plus size={9} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 min-h-[20px]">
        {slot.max > 0 ? (
          Array.from({ length: slot.max }).map((_, i) => {
            const isAvailable = i < available;
            return (
              <button
                key={i}
                title={isAvailable ? dict.spellcasting.slots.useSlot : dict.spellcasting.slots.restoreSlot}
                onClick={() =>
                  onUpdateSlot(level, "used", isAvailable ? slot.used + 1 : slot.used - 1)
                }
                className={`w-5 h-5 rounded-full border-2 cursor-pointer flex-shrink-0
                  transition-all duration-150
                  ${isAvailable
                    ? "bg-[var(--color-lavender-deep)] border-[var(--color-lavender-deep)] hover:opacity-70"
                    : "bg-transparent border-[var(--color-line)] hover:border-[var(--color-lavender-deep)]"
                  }`}
              />
            );
          })
        ) : (
          <span className="text-[12px] text-[var(--color-muted-soft)]">—</span>
        )}
      </div>
    </div>
  );
}

function SpellRow({
  spell,
  onEdit,
  onDelete,
  onTogglePrepared,
}: {
  spell: Spell;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePrepared: () => void;
}) {
  const dict = useDict();
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px]
      hover:bg-[var(--color-bg-warm)] transition-colors duration-150 group">

      {spell.level > 0 ? (
        <button
          onClick={onTogglePrepared}
          title={spell.prepared ? dict.spellcasting.list.prepared : dict.spellcasting.list.unprepared}
          className={`w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 cursor-pointer
            transition-all duration-150
            ${spell.prepared
              ? "bg-[var(--color-mint-deep)] border-[var(--color-mint-deep)]"
              : "border-[var(--color-line)] bg-transparent hover:border-[var(--color-mint-deep)]"
            }`}
        />
      ) : (
        <div className="w-[15px] h-[15px] rounded-full bg-[var(--color-lavender)] flex-shrink-0" />
      )}

      <span
        className="flex-1 text-[13px] font-semibold text-[var(--color-ink)] cursor-pointer truncate min-w-0"
        onClick={onEdit}
      >
        {spell.name || <em className="text-[var(--color-muted-soft)] font-normal not-italic">{dict.spellcasting.list.unnamed}</em>}
      </span>

      {spell.concentration && (
        <span className="text-[9px] font-bold bg-[var(--color-blue)] text-[var(--color-blue-deep)]
          rounded-full px-[7px] py-[2px] flex-shrink-0">C</span>
      )}
      {spell.ritual && (
        <span className="text-[9px] font-bold bg-[var(--color-sand)] text-[var(--color-sand-deep)]
          rounded-full px-[7px] py-[2px] flex-shrink-0">R</span>
      )}
      {spell.castTime && (
        <span className="text-[10px] text-[var(--color-muted-soft)] flex-shrink-0 hidden min-[500px]:inline">
          {spell.castTime}
        </span>
      )}

      <button
        onClick={onEdit}
        title="Edit"
        className="opacity-0 group-hover:opacity-100 max-[700px]:opacity-100 flex-shrink-0
          text-[var(--color-muted-soft)] hover:text-[var(--color-ink)]
          transition-all duration-150 cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        className="opacity-0 group-hover:opacity-100 max-[700px]:opacity-100 flex-shrink-0
          text-[var(--color-muted-soft)] hover:text-[var(--color-coral-deep)]
          transition-all duration-150 cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function SpellModal({
  spell,
  onSave,
  onClose,
}: {
  spell: Spell;
  onSave: (s: Spell) => void;
  onClose: () => void;
}) {
  const dict = useDict();
  const [d, setD] = useState<Spell>(spell);

  const toggle = (key: "prepared" | "concentration" | "ritual") =>
    setD((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Modal
      title={spell.id ? dict.spellcasting.modal.editTitle : dict.spellcasting.modal.addTitle}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>{dict.common.cancel}</ModalBtn>
          <ModalBtn variant="dark" onClick={() => onSave(d)}>{dict.common.save}</ModalBtn>
        </>
      }
    >
      <ModalField label={dict.spellcasting.modal.name}>
        <ModalInput value={d.name} onChange={(v) => setD({ ...d, name: v })} autoFocus />
      </ModalField>

      <div className="grid grid-cols-2 gap-3">
        <ModalField label={dict.spellcasting.modal.level}>
          <select
            value={d.level}
            onChange={(e) => setD({ ...d, level: Number(e.target.value), prepared: Number(e.target.value) === 0 ? false : d.prepared })}
            className="w-full border border-[var(--color-line)] rounded-[10px] bg-[var(--color-bg)]
              px-3 py-[9px] text-[14px] text-[var(--color-ink)] font-[inherit] outline-none
              focus:border-[var(--color-coral)] focus:shadow-[0_0_0_3px_rgba(244,123,95,0.15)]
              transition-all duration-150 cursor-pointer"
          >
            {dict.spellcasting.ordinals.map((o, i) => (
              <option key={i} value={i}>{o}</option>
            ))}
          </select>
        </ModalField>
        <ModalField label={dict.spellcasting.modal.castTime}>
          <ModalInput value={d.castTime} onChange={(v) => setD({ ...d, castTime: v })} placeholder={dict.spellcasting.modal.castTimePlaceholder} />
        </ModalField>
        <ModalField label={dict.spellcasting.modal.range}>
          <ModalInput value={d.range} onChange={(v) => setD({ ...d, range: v })} placeholder={dict.spellcasting.modal.rangePlaceholder} />
        </ModalField>
        <ModalField label={dict.spellcasting.modal.duration}>
          <ModalInput value={d.duration} onChange={(v) => setD({ ...d, duration: v })} placeholder={dict.spellcasting.modal.durationPlaceholder} />
        </ModalField>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { key: "prepared" as const, label: dict.spellcasting.modal.prepared, disabled: d.level === 0 },
          { key: "concentration" as const, label: dict.spellcasting.modal.concentration, disabled: false },
          { key: "ritual" as const, label: dict.spellcasting.modal.ritual, disabled: false },
        ] as const).map(({ key, label, disabled }) => (
          <button
            key={key}
            onClick={() => !disabled && toggle(key)}
            disabled={disabled}
            className={`text-[11px] font-semibold rounded-full px-3 py-[5px] border cursor-pointer
              transition-all duration-150 font-[inherit] disabled:opacity-40 disabled:cursor-default
              ${d[key]
                ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                : "bg-[var(--color-bg)] text-[var(--color-ink-soft)] border-[var(--color-line)]"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ModalField label={dict.spellcasting.modal.notes}>
        <ModalTextarea
          value={d.desc}
          onChange={(v) => setD({ ...d, desc: v })}
          placeholder={dict.spellcasting.modal.notesPlaceholder}
        />
      </ModalField>
    </Modal>
  );
}
