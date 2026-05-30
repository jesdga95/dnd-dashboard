"use client";

import { useState } from "react";
import { Backpack, Plus, Minus, Pencil, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import { IconPicker, InventoryIcon } from "@/components/ui/IconPicker";
import { SparkleBackground } from "@/components/ui/SparkleBackground";
import { useDict } from "@/lib/DictContext";
import { withDice } from "@/lib/text";
import { suggestIcon } from "@/lib/icons";
import type { InventoryItem, Character } from "@/lib/types";

interface InventoryCardProps {
  inventory: InventoryItem[];
  gold: number | null;
  silver: number | null;
  onSave: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (patch: Partial<Character>) => void;
}

// Flat coin medallion that bleeds off the right edge of a coin card.
function CoinGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden
      className="absolute pointer-events-none select-none"
      style={{ right: -34, top: "50%", transform: "translateY(-50%)", height: 168, width: 168, opacity: 0.13, color }}>
      <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="60" cy="60" r="43" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 6" />
      <text x="60" y="61" textAnchor="middle" dominantBaseline="central"
        fill="currentColor" fontSize="46" fontWeight="900">✦</text>
    </svg>
  );
}

export function InventoryCard({ inventory, gold, silver, onSave, onDelete, onToggle, onUpdate }: InventoryCardProps) {
  const dict = useDict();
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const handleQtyChange = (item: InventoryItem, delta: number) => {
    if (item.qty === "" || item.qty == null) return;
    onSave({ ...item, qty: Math.max(0, Number(item.qty) + delta) });
  };

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

      {/* Coins */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        {/* Gold */}
        <div className="flex-1 flex flex-col justify-center min-h-[80px] rounded-[14px] px-5 py-3 relative overflow-hidden"
          style={{
            background: "linear-gradient(155deg, #fffbe8 0%, #f7d84a 45%, #c49010 100%)",
            border: "1px solid rgba(196,160,20,0.5)",
          }}>
          <SparkleBackground color="#c8a010" chars={["◉", "◎", "○"]} />
          <CoinGlyph color="#7a5010" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="self-start text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#7a5010]/60 mb-0.5">
              {dict.coins.gold}
            </div>
            <EditableNumber value={gold} onChange={(v) => onUpdate({ gold: v })} min={0}
              style={{ fontWeight: 900, fontSize: 36, color: "#5a3808", lineHeight: 1, textAlign: "center" }} />
          </div>
        </div>

        {/* Silver */}
        <div className="flex-1 flex flex-col justify-center min-h-[80px] rounded-[14px] px-5 py-3 relative overflow-hidden"
          style={{
            background: "linear-gradient(155deg, #f8f6f2 0%, #d8d2c8 45%, #928880 100%)",
            border: "1px solid rgba(160,148,138,0.45)",
          }}>
          <SparkleBackground color="#908880" chars={["◉", "◎", "○"]} />
          <CoinGlyph color="#5a5248" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="self-start text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#5a5248]/60 mb-0.5">
              {dict.coins.silver}
            </div>
            <EditableNumber value={silver} onChange={(v) => onUpdate({ silver: v })} min={0}
              style={{ fontWeight: 900, fontSize: 36, color: "#3a3430", lineHeight: 1, textAlign: "center" }} />
          </div>
        </div>
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-5 text-[14px] text-[var(--color-muted-soft)]">
          {dict.inventory.emptyStatePre}{" "}
          <strong className="text-[var(--color-ink)]">{dict.inventory.emptyStateHighlight}</strong>{" "}
          {dict.inventory.emptyStatePost}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {inventory.map((item) => (
          <div key={item.id}
            className="flex flex-col rounded-[14px] overflow-hidden relative
              border border-[var(--color-line)]"
            style={{
              background:
                "linear-gradient(to bottom, #ffffff 0%, #ffffff 38%, color-mix(in srgb, var(--color-peach) 12%, white) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -10px 18px -14px rgba(194,80,42,0.18), 0 1px 2px rgba(120,90,50,0.06), 0 4px 10px -4px rgba(120,90,50,0.10)",
            }}>
            {/* Icon + name body */}
            <div className="flex flex-col items-center justify-center flex-1 pt-2.5 px-2 pb-2 gap-1.5 relative z-10">
              {/* Actions — always visible, top-right */}
              <div className="absolute top-1.5 right-1.5 z-20 flex gap-1">
                <button onClick={() => setEditing(item)} aria-label={dict.common.edit}
                  className="w-[26px] h-[26px] flex items-center justify-center rounded-full
                    bg-white/80 text-[var(--color-muted)]
                    shadow-[0_1px_2px_rgba(120,90,50,0.10)] ring-1 ring-black/[0.04]
                    hover:bg-white hover:text-[var(--color-blue-deep)]
                    cursor-pointer active:opacity-60 transition-colors">
                  <Pencil size={11} />
                </button>
                <button onClick={() => onDelete(item.id)} aria-label={dict.common.delete}
                  className="w-[26px] h-[26px] flex items-center justify-center rounded-full
                    bg-white/80 text-[var(--color-muted)]
                    shadow-[0_1px_2px_rgba(120,90,50,0.10)] ring-1 ring-black/[0.04]
                    hover:bg-white hover:text-[var(--color-coral-deep)]
                    cursor-pointer active:opacity-60 transition-colors">
                  <X size={11} />
                </button>
              </div>
              <span className="text-[var(--color-peach-deep)] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                <InventoryIcon name={item.icon} size={28} />
              </span>
              <div className="w-full text-center">
                <div className="text-[14px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                  {withDice(item.name)}
                </div>
                {item.note && (
                  <div className="text-[12px] text-[var(--color-muted)] truncate leading-tight mt-0.5">
                    {withDice(item.note)}
                  </div>
                )}
              </div>
            </div>

            {/* Horizontal stepper */}
            {item.qty !== "" && item.qty != null && (
              <div className="relative z-10 flex items-center border-t border-[var(--color-line)]"
                style={{ background: "color-mix(in srgb, var(--color-peach) 14%, white)" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleQtyChange(item, -1); }}
                  className="flex-1 h-[30px] flex items-center justify-center
                    text-[var(--color-muted)] border-r border-[var(--color-line-soft)]
                    hover:bg-[var(--color-peach)] hover:text-[var(--color-peach-deep)]
                    active:opacity-70 cursor-pointer transition-colors">
                  <Minus size={10} strokeWidth={2.5} />
                </button>
                <span className="w-[32px] text-center text-[14px] font-extrabold text-[var(--color-peach-deep)]">
                  {item.qty}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleQtyChange(item, +1); }}
                  className="flex-1 h-[30px] flex items-center justify-center
                    text-[var(--color-muted)] border-l border-[var(--color-line-soft)]
                    hover:bg-[var(--color-mint)] hover:text-[var(--color-mint-deep)]
                    active:opacity-70 cursor-pointer transition-colors">
                  <Plus size={10} strokeWidth={2.5} />
                </button>
              </div>
            )}
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
  // Auto-suggest an icon while the user hasn't picked one (new items default to "Package").
  const [autoIcon, setAutoIcon] = useState(!item.icon || item.icon === "Package");
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
          <ModalInput value={d.name} autoFocus maxLength={50}
            onChange={(v) => setD((prev) => ({
              ...prev,
              name: v,
              // Keep the last suggestion (or manual default) when the new text matches nothing — don't reset.
              ...(autoIcon ? { icon: suggestIcon(v) ?? prev.icon } : {}),
            }))} />
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
        <IconPicker value={d.icon || ""} onChange={(v) => { setAutoIcon(false); setD({ ...d, icon: v }); }} />
      </ModalField>
      <ModalField label={dict.inventory.modal.noteModifier}>
        <ModalTextarea value={d.note || ""} onChange={(v) => setD({ ...d, note: v })} maxLength={200} />
      </ModalField>
    </Modal>
  );
}
