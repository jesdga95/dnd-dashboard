"use client";

import { useState } from "react";
import { Backpack, Plus, Pencil, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import { IconPicker, InventoryIcon } from "@/components/ui/IconPicker";
import { useDict } from "@/lib/DictContext";
import type { InventoryItem } from "@/lib/types";

interface InventoryCardProps {
  inventory: InventoryItem[];
  onSave: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export function InventoryCard({ inventory, onSave, onDelete, onToggle }: InventoryCardProps) {
  const dict = useDict();
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="peach"><Backpack size={14} /></IconPill>}
        title={dict.inventory.title}
        sub={dict.inventory.itemsCount.replace("{count}", String(inventory.length))}
        actions={
          <Btn variant="default" size="sm"
            onClick={() => setEditing({ id: 0, name: "", qty: "", note: "", icon: "Package", checked: false })}>
            <Plus size={11} /> {dict.inventory.add}
          </Btn>
        }
      />
      <div className="flex flex-col">
        {inventory.map((item, idx) => (
          <div key={item.id}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[10px]
              hover:bg-[var(--color-bg-warm)] transition-colors duration-150 group
              ${item.checked ? "opacity-70" : ""}
              ${idx > 0 ? "border-t border-[var(--color-line-soft)]" : ""}`}
          >
            {/* Checkbox */}
            <button
              onClick={() => onToggle(item.id)}
              className={`w-5 h-5 rounded-[7px] border flex-shrink-0 flex items-center justify-center
                cursor-pointer transition-all duration-150 text-[12px] font-extrabold p-0
                ${item.checked
                  ? "bg-[var(--color-mint-deep)] border-[var(--color-mint-deep)] text-white"
                  : "bg-[var(--color-card)] border-[var(--color-line)] text-transparent hover:border-[var(--color-muted)]"
                }`}
            >
              ✓
            </button>

            {/* Icon */}
            <span className="leading-none w-[22px] text-center flex-shrink-0 flex items-center justify-center
              text-[var(--color-ink-soft)]">
              <InventoryIcon name={item.icon} size={18} />
            </span>

            {/* Name + note */}
            <div className="flex-1 min-w-0">
              <div className={`text-[14px] font-semibold ${item.checked ? "line-through text-[var(--color-muted-soft)]" : "text-[var(--color-ink)]"}`}>
                {item.name}
              </div>
              {item.note && (
                <div className="text-[12px] text-[var(--color-muted)] mt-[1px]">{item.note}</div>
              )}
            </div>

            {/* Qty */}
            {item.qty !== "" && item.qty != null && (
              <span className="bg-[var(--color-bg-warm)] rounded-full px-[9px] py-[3px]
                text-[11px] font-bold text-[var(--color-ink-soft)] flex-shrink-0">
                ×{item.qty}
              </span>
            )}

            {/* Actions */}
            <div className="flex gap-0.5 max-[700px]:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Btn variant="ghost" size="xs" iconOnly onClick={() => setEditing(item)}>
                <Pencil size={11} />
              </Btn>
              <Btn variant="ghost" size="xs" iconOnly onClick={() => onDelete(item.id)}>
                <X size={11} />
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <InventoryModal
          item={editing}
          onSave={(item) => { onSave(item); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function InventoryModal({
  item,
  onSave,
  onClose,
}: {
  item: InventoryItem;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}) {
  const dict = useDict();
  const [d, setD] = useState<InventoryItem>(item);
  return (
    <Modal
      title={item.id ? dict.inventory.modal.editTitle : dict.inventory.modal.addTitle}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>{dict.common.cancel}</ModalBtn>
          <ModalBtn variant="dark" onClick={() => onSave(d)}>{dict.common.save}</ModalBtn>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        <ModalField label={dict.inventory.modal.name}>
          <ModalInput value={d.name} onChange={(v) => setD({ ...d, name: v })} autoFocus />
        </ModalField>
        <ModalField label={dict.inventory.modal.quantity}>
          <ModalInput
            value={d.qty === "" ? "" : String(d.qty)}
            onChange={(v) => setD({ ...d, qty: v === "" ? "" : (parseInt(v, 10) || 0) })}
            placeholder={dict.inventory.modal.quantityPlaceholder}
          />
        </ModalField>
      </div>
      <ModalField label={dict.inventory.modal.icon}>
        <IconPicker value={d.icon || ""} onChange={(v) => setD({ ...d, icon: v })} />
      </ModalField>
      <ModalField label={dict.inventory.modal.noteModifier}>
        <ModalTextarea value={d.note || ""} onChange={(v) => setD({ ...d, note: v })} />
      </ModalField>
    </Modal>
  );
}
