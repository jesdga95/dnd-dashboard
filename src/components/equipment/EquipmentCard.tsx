"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import { useDict } from "@/lib/DictContext";
import type { EquipmentItem } from "@/lib/types";

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
            className="flex flex-col gap-1 px-[14px] py-3 rounded-[14px] min-w-0 overflow-hidden
              bg-[var(--color-bg-warm)] hover:bg-[#ebe5db] transition-colors duration-150 relative group">
            <div className="flex items-center gap-2 max-[700px]:pr-14">
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase
                bg-[var(--color-card)] rounded-full px-2 py-[3px] text-[var(--color-muted)]">
                {eq.slot}
              </span>
              <span className="font-bold text-[14px] flex-1 min-w-0 truncate">{eq.name}</span>
              {eq.mod && (
                <span className="text-[11px] font-bold text-[var(--color-lavender-deep)]
                  bg-[var(--color-lavender)] rounded-full px-[9px] py-[3px] flex-shrink-0">
                  {eq.mod}
                </span>
              )}
            </div>
            {eq.desc && (
              <div className="text-[12.5px] text-[var(--color-muted)] leading-[1.4] line-clamp-2 break-all">{eq.desc}</div>
            )}
            <div className="absolute top-2 right-2 flex gap-0.5 max-[700px]:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Btn variant="default" size="xs" iconOnly onClick={() => setEditing(eq)}>
                <Pencil size={11} />
              </Btn>
              <Btn variant="default" size="xs" iconOnly onClick={() => onDelete(eq.id)}>
                <X size={11} />
              </Btn>
            </div>
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
  const [d, setD] = useState<EquipmentItem>(item);
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
      <div className="grid grid-cols-2 gap-2.5">
        <ModalField label={dict.equipment.modal.slot}>
          <ModalInput value={d.slot} onChange={(v) => setD({ ...d, slot: v })} placeholder={dict.equipment.modal.slotPlaceholder} maxLength={12} />
        </ModalField>
        <ModalField label={dict.equipment.modal.modifier}>
          <ModalInput value={d.mod} onChange={(v) => setD({ ...d, mod: v })} placeholder={dict.equipment.modal.modifierPlaceholder} maxLength={8} />
        </ModalField>
      </div>
      <ModalField label={dict.equipment.modal.description}>
        <ModalTextarea value={d.desc} onChange={(v) => setD({ ...d, desc: v })} maxLength={200} />
      </ModalField>
    </Modal>
  );
}
