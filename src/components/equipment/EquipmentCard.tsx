"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import type { EquipmentItem } from "@/lib/types";

interface EquipmentCardProps {
  equipment: EquipmentItem[];
  onSave: (item: EquipmentItem) => void;
  onDelete: (id: number) => void;
}

export function EquipmentCard({ equipment, onSave, onDelete }: EquipmentCardProps) {
  const [editing, setEditing] = useState<EquipmentItem | null>(null);

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="blue"><Shield size={14} /></IconPill>}
        title="Equipped"
        actions={
          <Btn variant="default" size="sm"
            onClick={() => setEditing({ id: 0, name: "", slot: "", mod: "", desc: "" })}>
            <Plus size={11} /> Add
          </Btn>
        }
      />
      <div className="grid gap-2">
        {equipment.map((eq) => (
          <div key={eq.id}
            className="flex flex-col gap-1 px-[14px] py-3 rounded-[14px]
              bg-[var(--color-bg-warm)] hover:bg-[#ebe5db] transition-colors duration-150 relative group">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase
                bg-[var(--color-card)] rounded-full px-2 py-[3px] text-[var(--color-muted)]">
                {eq.slot}
              </span>
              <span className="font-bold text-[14px] flex-1">{eq.name}</span>
              {eq.mod && (
                <span className="text-[11px] font-bold text-[var(--color-lavender-deep)]
                  bg-[var(--color-lavender)] rounded-full px-[9px] py-[3px]">
                  {eq.mod}
                </span>
              )}
            </div>
            {eq.desc && (
              <div className="text-[12.5px] text-[var(--color-muted)] leading-[1.4]">{eq.desc}</div>
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
  const [d, setD] = useState<EquipmentItem>(item);
  return (
    <Modal
      title={item.id ? "Edit Equipment" : "Add Equipment"}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>Cancel</ModalBtn>
          <ModalBtn variant="dark" onClick={() => onSave(d)}>Save</ModalBtn>
        </>
      }
    >
      <ModalField label="Name">
        <ModalInput value={d.name} onChange={(v) => setD({ ...d, name: v })} autoFocus />
      </ModalField>
      <div className="grid grid-cols-2 gap-2.5">
        <ModalField label="Slot">
          <ModalInput value={d.slot} onChange={(v) => setD({ ...d, slot: v })} placeholder="Hands, Head…" />
        </ModalField>
        <ModalField label="Modifier">
          <ModalInput value={d.mod} onChange={(v) => setD({ ...d, mod: v })} placeholder="+1 AC" />
        </ModalField>
      </div>
      <ModalField label="Description">
        <ModalTextarea value={d.desc} onChange={(v) => setD({ ...d, desc: v })} />
      </ModalField>
    </Modal>
  );
}
