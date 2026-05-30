"use client";

import { useState } from "react";
import {
  Shield, Plus,
  Crown, Link, Shirt, Wind, Hand, Grip,
  Footprints, Circle, Sword, Sparkles, Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import { RowActions } from "@/components/ui/RowActions";
import { useDict } from "@/lib/DictContext";
import type { Dict } from "@/lib/DictContext";
import type { EquipmentItem } from "@/lib/types";

type SlotKey = keyof Dict["equipment"]["slots"];

const SLOT_ICONS: Record<SlotKey, LucideIcon> = {
  head: Crown,
  neck: Link,
  chest: Shirt,
  back: Wind,
  hands: Hand,
  waist: Grip,
  feet: Footprints,
  ring: Circle,
  weapon: Sword,
  shield: Shield,
  trinket: Sparkles,
};

const SLOT_KEYS = Object.keys(SLOT_ICONS) as SlotKey[];

function resolveSlotKey(slot: string): SlotKey | null {
  return (SLOT_KEYS as string[]).includes(slot) ? (slot as SlotKey) : null;
}

function SlotIconDisplay({ slot, size = 20 }: { slot: string; size?: number }) {
  const key = resolveSlotKey(slot);
  const Icon = key ? SLOT_ICONS[key] : Package;
  return <Icon size={size} />;
}

interface EquipmentCardProps {
  equipment: EquipmentItem[];
  onSave: (item: EquipmentItem) => void;
  onDelete: (id: number) => void;
}

export function EquipmentCard({ equipment, onSave, onDelete }: EquipmentCardProps) {
  const dict = useDict();
  const [editing, setEditing] = useState<EquipmentItem | null>(null);

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="blue"><Shield size={14} /></IconPill>}
        title={dict.equipment.title}
        actions={
          <Btn variant="default" size="sm"
            onClick={() => setEditing({ id: 0, name: "", slot: "", mod: "", desc: "" })}>
            <Plus size={11} /> {dict.equipment.add}
          </Btn>
        }
      />
      {equipment.length === 0 && (
        <div className="text-center py-5 text-[13px] text-[var(--color-muted-soft)]">
          {dict.equipment.emptyStatePre}{" "}
          <strong className="text-[var(--color-ink)]">{dict.equipment.emptyStateHighlight}</strong>{" "}
          {dict.equipment.emptyStatePost}
        </div>
      )}
      <div className="grid gap-2">
        {equipment.map((eq) => (
          <div key={eq.id}
            className="flex flex-col gap-2 px-[14px] py-3 rounded-[14px] min-w-0 overflow-hidden
              bg-[var(--color-bg-warm)] hover:bg-[#ebe5db] transition-colors duration-150">

            {/* Header: slot icon + name/label/mod + actions */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-[var(--color-card)] flex items-center justify-center
                flex-shrink-0 text-[var(--color-muted)] shadow-[inset_0_0_0_1px_var(--color-line-soft)]">
                <SlotIconDisplay slot={eq.slot} size={20} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {eq.slot && (
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-muted)] mb-0.5 truncate">
                    {(() => { const k = resolveSlotKey(eq.slot); return k ? dict.equipment.slots[k] : eq.slot; })()}
                  </div>
                )}
                <div className="font-bold text-[14px] leading-tight truncate">{eq.name}</div>
                {eq.mod && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-[var(--color-lavender-deep)]
                    bg-[var(--color-lavender)] rounded-full px-[9px] py-[2px]">
                    {eq.mod}
                  </span>
                )}
              </div>
              <RowActions
                onEdit={() => setEditing(eq)}
                onDelete={() => onDelete(eq.id)}
                className="flex-shrink-0"
              />
            </div>

            {eq.desc && (
              <div className="text-[12.5px] text-[var(--color-muted)] leading-[1.4] line-clamp-2 break-words">{eq.desc}</div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <EquipmentModal
          item={editing}
          onSave={(item) => { onSave(item); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EquipmentModal({
  item,
  onSave,
  onClose,
}: {
  item: EquipmentItem;
  onSave: (item: EquipmentItem) => void;
  onClose: () => void;
}) {
  const dict = useDict();
  const [d, setD] = useState<EquipmentItem>(() => ({
    ...item,
    slot: resolveSlotKey(item.slot) ?? item.slot,
  }));

  return (
    <Modal
      title={item.id ? dict.equipment.modal.editTitle : dict.equipment.modal.addTitle}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>{dict.common.cancel}</ModalBtn>
          <ModalBtn variant="dark" onClick={() => onSave(d)}>{dict.common.save}</ModalBtn>
        </>
      }
    >
      <ModalField label={dict.equipment.modal.name}>
        <ModalInput value={d.name} onChange={(v) => setD({ ...d, name: v })} autoFocus maxLength={24} />
      </ModalField>

      <ModalField label={dict.equipment.modal.slot}>
        <div className="grid grid-cols-4 gap-1.5">
          {SLOT_KEYS.map((key) => {
            const Icon = SLOT_ICONS[key];
            const selected = resolveSlotKey(d.slot) === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setD({ ...d, slot: key })}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-[10px]
                  text-[10px] font-semibold transition-all duration-150 cursor-pointer border
                  ${selected
                    ? "bg-[var(--color-blue)] text-[var(--color-blue-deep)] border-transparent shadow-[inset_0_0_0_1.5px_currentColor]"
                    : "bg-[var(--color-bg-warm)] text-[var(--color-muted)] border-[var(--color-line)] hover:bg-[var(--color-line)]"
                  }`}
              >
                <Icon size={14} />
                <span className="leading-none text-center">{dict.equipment.slots[key]}</span>
              </button>
            );
          })}
        </div>
      </ModalField>

      <ModalField label={dict.equipment.modal.modifier}>
        <ModalInput value={d.mod} onChange={(v) => setD({ ...d, mod: v })} placeholder={dict.equipment.modal.modifierPlaceholder} maxLength={8} />
      </ModalField>

      <ModalField label={dict.equipment.modal.description}>
        <ModalTextarea value={d.desc} onChange={(v) => setD({ ...d, desc: v })} maxLength={200} />
      </ModalField>
    </Modal>
  );
}
