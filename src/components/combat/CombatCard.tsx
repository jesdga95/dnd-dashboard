"use client";

import { useState } from "react";
import { Sword, Plus } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalBtn } from "@/components/ui/Modal";
import { RowActions } from "@/components/ui/RowActions";
import { useDict } from "@/lib/DictContext";
import { withDice } from "@/lib/text";
import type { Attack, AttackType, Combat } from "@/lib/types";

interface CombatCardProps {
  combat: Combat;
  onSaveAttack: (a: Attack) => void;
  onDeleteAttack: (id: number) => void;
}

const TYPE_STYLES: Record<AttackType, string> = {
  melee: "bg-[var(--color-peach)] text-[var(--color-peach-deep)]",
  ranged: "bg-[var(--color-blue)] text-[var(--color-blue-deep)]",
  special: "bg-[var(--color-mint)] text-[var(--color-mint-deep)]",
};

const DMG_STYLES: Record<AttackType, string> = {
  melee: "bg-[var(--color-peach)] text-[var(--color-coral-deep)]",
  ranged: "bg-[var(--color-blue)] text-[var(--color-blue-deep)]",
  special: "bg-[var(--color-mint-deep)] text-white",
};

type AttackDraft = Omit<Attack, "id"> & { id?: number };

const EMPTY_DRAFT: AttackDraft = { name: "", type: "melee", hit: "", dmg: "", note: "" };

export function CombatCard({ combat, onSaveAttack, onDeleteAttack }: CombatCardProps) {
  const dict = useDict();
  const [editing, setEditing] = useState<AttackDraft | null>(null);

  const handleSave = (d: AttackDraft) => {
    onSaveAttack({ id: d.id ?? 0, name: d.name, type: d.type, hit: d.hit, dmg: d.dmg, note: d.note });
    setEditing(null);
  };

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="peach"><Sword size={14} /></IconPill>}
        title={dict.combat.title}
        actions={
          <Btn variant="default" size="sm" onClick={() => setEditing({ ...EMPTY_DRAFT })}>
            <Plus size={11} /> {dict.combat.addAttack}
          </Btn>
        }
      />

      {combat.attacks.length === 0 ? (
        <div className="text-center py-5 text-[14px] text-[var(--color-muted-soft)]">
          {dict.combat.emptyStatePre}{" "}
          <strong className="text-[var(--color-ink)]">{dict.combat.emptyStateHighlight}</strong>{" "}
          {dict.combat.emptyStatePost}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {combat.attacks.map((a) => (
            <div key={a.id}
              className="px-2.5 py-2 rounded-[12px]
                hover:bg-[var(--color-bg-warm)] transition-colors duration-150">

              {/* Row 1: type + name + desktop stats + desktop actions */}
              <div className="flex items-center gap-2.5">
                {/* Type badge — initial on mobile, full label on desktop */}
                <span className={`text-[11px] font-bold tracking-[0.08em] uppercase px-2 py-[3px]
                  rounded-full flex-shrink-0 ${TYPE_STYLES[a.type]}`}>
                  <span className="min-[1025px]:hidden">{dict.combat.types[a.type][0]}</span>
                  <span className="hidden min-[1025px]:inline">{dict.combat.types[a.type]}</span>
                </span>

                {/* Name */}
                <span className="font-bold text-[15px] flex-1 min-w-0 truncate">{a.name}</span>

                {/* Hit — desktop only */}
                {a.hit && (
                  <span className="hidden min-[1025px]:inline font-mono text-[12px] font-semibold text-[var(--color-muted)]
                    bg-[var(--color-bg-warm)] px-2 py-[3px] rounded-full flex-shrink-0">
                    {a.hit}
                  </span>
                )}

                {/* Note — desktop only */}
                {a.note && (
                  <span className="text-[13px] text-[var(--color-muted)] flex-shrink-0 hidden min-[1025px]:block">
                    {withDice(a.note)}
                  </span>
                )}

                {/* Dmg — desktop only */}
                {a.dmg && (
                  <span className={`hidden min-[1025px]:inline font-mono text-[13px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${DMG_STYLES[a.type]}`}>
                    {a.dmg}
                  </span>
                )}

                {/* Desktop-only actions */}
                <div className="hidden min-[1025px]:flex flex-shrink-0 items-center">
                  <RowActions
                    onEdit={() => setEditing(a)}
                    onDelete={() => onDeleteAttack(a.id)}
                  />
                </div>
              </div>

              {/* Row 2 (mobile only): stats + actions */}
              <div className="min-[1025px]:hidden mt-1 flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {a.hit && (
                    <div className="font-mono text-[12px] font-semibold text-[var(--color-muted)]
                      bg-[var(--color-bg-warm)] px-2 py-[5px] rounded-lg text-center">
                      {a.hit}
                    </div>
                  )}
                  {a.dmg && (
                    <div className={`font-mono text-[13px] font-bold px-2.5 py-[5px] rounded-lg text-center ${DMG_STYLES[a.type]}`}>
                      {a.dmg}
                    </div>
                  )}
                </div>
                <RowActions
                  onEdit={() => setEditing(a)}
                  onDelete={() => onDeleteAttack(a.id)}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AttackModal
          attack={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function AttackModal({
  attack,
  onSave,
  onClose,
}: {
  attack: AttackDraft;
  onSave: (a: AttackDraft) => void;
  onClose: () => void;
}) {
  const dict = useDict();
  const [d, setD] = useState<AttackDraft>(attack);

  return (
    <Modal
      title={attack.id ? dict.combat.modal.editTitle : dict.combat.modal.addTitle}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>{dict.common.cancel}</ModalBtn>
          <ModalBtn variant="dark" onClick={() => onSave(d)}>{dict.common.save}</ModalBtn>
        </>
      }
    >
      {/* Type selector */}
      <div>
        <label className="block text-[12px] font-semibold text-[var(--color-muted)] tracking-[0.04em] mb-[8px]">
          {dict.combat.modal.type}
        </label>
        <div className="flex gap-2">
          {(["melee", "ranged", "special"] as AttackType[]).map((t) => (
            <button
              key={t}
              onClick={() => setD({ ...d, type: t })}
              className={`flex-1 py-[7px] rounded-full text-[13px] font-bold border transition-all duration-150 cursor-pointer
                ${d.type === t
                  ? `${TYPE_STYLES[t]} border-transparent shadow-[inset_0_0_0_1.5px_currentColor]`
                  : "bg-[var(--color-bg-warm)] text-[var(--color-muted)] border-[var(--color-line)] hover:bg-[var(--color-line)]"
                }`}
            >
              {dict.combat.types[t]}
            </button>
          ))}
        </div>
      </div>

      <ModalField label={dict.combat.modal.name}>
        <ModalInput value={d.name} onChange={(v) => setD({ ...d, name: v })} autoFocus placeholder={dict.combat.modal.namePlaceholder} maxLength={50} />
      </ModalField>

      <div className="grid grid-cols-2 gap-2.5">
        <ModalField label={dict.combat.modal.hit}>
          <ModalInput value={d.hit} onChange={(v) => setD({ ...d, hit: v })} placeholder={dict.combat.modal.hitPlaceholder} maxLength={20} />
        </ModalField>
        <ModalField label={dict.combat.modal.damage}>
          <ModalInput value={d.dmg} onChange={(v) => setD({ ...d, dmg: v })} placeholder={dict.combat.modal.damagePlaceholder} maxLength={20} />
        </ModalField>
      </div>

      <ModalField label={dict.combat.modal.note}>
        <ModalInput value={d.note} onChange={(v) => setD({ ...d, note: v })} placeholder={dict.combat.modal.notePlaceholder} maxLength={100} />
      </ModalField>
    </Modal>
  );
}
