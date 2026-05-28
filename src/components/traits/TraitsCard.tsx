"use client";

import { useState } from "react";
import { Sparkles, Plus, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalTextarea, ModalBtn } from "@/components/ui/Modal";
import { useDict } from "@/lib/DictContext";
import type { Trait } from "@/lib/types";

interface TraitsCardProps {
  traits: Trait[];
  onSave: (trait: Trait) => void;
  onDelete: (id: number) => void;
}

export function TraitsCard({ traits, onSave, onDelete }: TraitsCardProps) {
  const dict = useDict();
  const [editing, setEditing] = useState<Trait | null>(null);

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="mint"><Sparkles size={14} /></IconPill>}
        title={dict.traits.title}
        actions={
          <Btn variant="default" size="sm" onClick={() => setEditing({ id: 0, name: "", desc: "" })}>
            <Plus size={11} /> {dict.traits.add}
          </Btn>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {traits.map((t) => (
          <span key={t.id}
            className="trait-chip relative bg-[var(--color-lavender)] text-[var(--color-lavender-deep)]
              rounded-full px-3 py-[6px] text-[12px] font-bold cursor-pointer inline-flex items-center gap-1.5
              hover:bg-[#e1d4ef] transition-colors duration-150"
            onClick={() => setEditing(t)}
          >
            {t.name}
            <span
              className="max-[700px]:opacity-100 opacity-0 hover:opacity-100 text-black/40 hover:text-[var(--color-coral-deep)]
                transition-opacity duration-150 ml-0.5"
              onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
            >
              <X size={10} />
            </span>
            {t.desc && (
              <span className="trait-tip">
                <strong>{t.name}</strong>
                {t.desc}
              </span>
            )}
          </span>
        ))}
      </div>

      {editing && (
        <TraitModal
          trait={editing}
          onSave={(trait) => { onSave(trait); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TraitModal({
  trait,
  onSave,
  onClose,
}: {
  trait: Trait;
  onSave: (t: Trait) => void;
  onClose: () => void;
}) {
  const dict = useDict();
  const [d, setD] = useState<Trait>(trait);
  return (
    <Modal
      title={trait.id ? dict.traits.modal.editTitle : dict.traits.modal.addTitle}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>{dict.common.cancel}</ModalBtn>
          <ModalBtn variant="dark" onClick={() => onSave(d)}>{dict.common.save}</ModalBtn>
        </>
      }
    >
      <ModalField label={dict.traits.modal.name}>
        <ModalInput value={d.name} onChange={(v) => setD({ ...d, name: v })} autoFocus />
      </ModalField>
      <ModalField label={dict.traits.modal.description}>
        <ModalTextarea
          value={d.desc}
          onChange={(v) => setD({ ...d, desc: v })}
          placeholder={dict.traits.modal.descPlaceholder}
        />
      </ModalField>
    </Modal>
  );
}
