"use client";

import { useState } from "react";
import { Zap, Plus, Minus, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { Modal, ModalField, ModalInput, ModalBtn } from "@/components/ui/Modal";
import { useDict } from "@/lib/DictContext";
import type { CustomResource } from "@/lib/types";

/** What "Add" collects before a resource row exists. */
export type ResourceDraft = Pick<CustomResource, "name" | "max" | "resetOn">;

interface ResourcesCardProps {
  resources: CustomResource[];
  onAdd: (draft: ResourceDraft) => void;
  onUpdate: (id: number, patch: Partial<Omit<CustomResource, "id">>) => void;
  onRemove: (id: number) => void;
}

export function ResourcesCard({ resources, onAdd, onUpdate, onRemove }: ResourcesCardProps) {
  const dict = useDict();
  const [adding, setAdding] = useState(false);

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="sand"><Zap size={14} /></IconPill>}
        title={dict.resources.title}
        actions={
          <Btn variant="default" size="sm" onClick={() => setAdding(true)}>
            <Plus size={11} /> {dict.resources.add}
          </Btn>
        }
      />

      {resources.length === 0 && (
        <div className="text-center py-5 text-[14px] text-[var(--color-muted-soft)]">
          {dict.resources.emptyStatePre}{" "}
          <strong className="text-[var(--color-ink)]">{dict.resources.emptyStateHighlight}</strong>{" "}
          {dict.resources.emptyStatePost}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {resources.map((r) => (
          <ResourceEntry
            key={r.id}
            resource={r}
            onUpdate={(patch) => onUpdate(r.id, patch)}
            onRemove={() => onRemove(r.id)}
          />
        ))}
      </div>

      {adding && (
        <ResourceModal
          onSave={(draft) => { onAdd(draft); setAdding(false); }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function ResourceModal({
  onSave,
  onClose,
}: {
  onSave: (draft: ResourceDraft) => void;
  onClose: () => void;
}) {
  const dict = useDict();
  const [name, setName] = useState("");
  const [max, setMax] = useState("1");
  const [resetOn, setResetOn] = useState<CustomResource["resetOn"]>("long");

  const save = () =>
    onSave({ name: name.trim(), max: Math.max(0, parseInt(max, 10) || 0), resetOn });

  return (
    <Modal
      title={dict.resources.modal.addTitle}
      onClose={onClose}
      footer={
        <>
          <ModalBtn onClick={onClose}>{dict.common.cancel}</ModalBtn>
          <ModalBtn variant="dark" onClick={save} disabled={!name.trim()}>
            {dict.common.save}
          </ModalBtn>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_88px] gap-2.5">
        <ModalField label={dict.resources.modal.name}>
          <ModalInput
            value={name}
            onChange={setName}
            placeholder={dict.resources.namePlaceholder}
            autoFocus
            maxLength={30}
          />
        </ModalField>
        <ModalField label={dict.resources.modal.max}>
          <ModalInput value={max} onChange={setMax} />
        </ModalField>
      </div>
      <ModalField label={dict.resources.modal.resetOn}>
        <div className="flex gap-1.5">
          {([["short", dict.resources.modal.resetShort], ["long", dict.resources.modal.resetLong]] as const).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setResetOn(key)}
                className={`flex-1 px-3 py-[9px] rounded-[10px] text-[14px] font-semibold font-[inherit]
                  cursor-pointer border transition-colors duration-150 ${
                    resetOn === key
                      ? "bg-[var(--color-sand)] text-[var(--color-sand-deep)] border-[var(--color-sand-deep)]"
                      : "bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-line)] hover:bg-[var(--color-bg-warm)]"
                  }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </ModalField>
    </Modal>
  );
}

function ResourceEntry({
  resource,
  onUpdate,
  onRemove,
}: {
  resource: CustomResource;
  onUpdate: (patch: Partial<Omit<CustomResource, "id">>) => void;
  onRemove: () => void;
}) {
  const dict = useDict();
  const available = resource.max - resource.used;

  return (
    <div className="bg-[var(--color-bg-warm)] rounded-[14px] px-3 py-2.5 group/res w-full">
      {/* Header — name gets the full row, delete pinned right */}
      <div className="flex items-center gap-1.5 mb-2">
        <input
          type="text"
          value={resource.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder={dict.resources.namePlaceholder}
          maxLength={30}
          className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]
            bg-transparent border-none outline-none w-0 flex-1 min-w-0
            placeholder:text-[var(--color-muted-soft)] placeholder:normal-case placeholder:tracking-normal
            placeholder:font-normal focus:text-[var(--color-ink)]"
        />
        {/* Delete — far right, always visible */}
        <Btn variant="default" size="xs" iconOnly
          onClick={onRemove}
          title="Remove resource"
          className="flex-shrink-0
            hover:bg-[var(--color-peach)] hover:text-[var(--color-coral-deep)] hover:border-transparent
            transition-colors duration-150"
        >
          <X size={9} />
        </Btn>
      </div>

      {/* Controls — reset toggle + max stepper share a line with the usage slots */}
      <div className="flex items-start gap-2">
        {/* S / L rest reset toggle — always visible */}
        <div className="flex items-center gap-0.5 flex-shrink-0 h-7">
          {(["short", "long"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onUpdate({ resetOn: r })}
              title={r === "short" ? dict.resources.resetShort : dict.resources.resetLong}
              className={`relative text-[11px] font-bold w-5 h-5 rounded-full cursor-pointer
                active:scale-90 transition-[background,color,transform] duration-150
                [@media(hover:none)]:before:absolute [@media(hover:none)]:before:content-[''] [@media(hover:none)]:before:-inset-1
                ${(resource.resetOn ?? "long") === r
                  ? "bg-[var(--color-sand-deep)] text-white"
                  : "bg-transparent text-[var(--color-muted-soft)] hover:text-[var(--color-muted)]"
                }`}
            >
              {r === "short" ? dict.resources.resetShort : dict.resources.resetLong}
            </button>
          ))}
        </div>
        {/* Max stepper — segmented button control */}
        <div className="flex items-center flex-shrink-0 h-7 rounded-full overflow-hidden
          border border-[var(--color-line)] bg-[var(--color-card)]">
          <button
            onClick={() => onUpdate({ max: resource.max - 1 })}
            disabled={resource.max === 0}
            className="h-full px-1.5 flex items-center justify-center cursor-pointer
              text-[var(--color-muted)] border-r border-[var(--color-line-soft)]
              hover:bg-[var(--color-peach)] hover:text-[var(--color-coral-deep)]
              active:opacity-70 transition-colors
              disabled:opacity-30 disabled:pointer-events-none"
          >
            <Minus size={11} strokeWidth={2.5} />
          </button>
          <span className="w-6 text-center text-[12px] font-bold text-[var(--color-ink)] tabular-nums">
            {resource.max}
          </span>
          <button
            onClick={() => onUpdate({ max: resource.max + 1 })}
            className="h-full px-1.5 flex items-center justify-center cursor-pointer
              text-[var(--color-muted)] border-l border-[var(--color-line-soft)]
              hover:bg-[var(--color-mint)] hover:text-[var(--color-mint-deep)]
              active:opacity-70 transition-colors"
          >
            <Plus size={11} strokeWidth={2.5} />
          </button>
        </div>
        {/* Usage slots — fill remaining width, wrap as needed */}
        <div className="flex flex-wrap items-center gap-1 flex-1 min-h-[28px]">
          {resource.max > 0 ? (
            Array.from({ length: resource.max }).map((_, i) => {
              const isAvailable = i < available;
              return (
                <button
                  key={i}
                  title={isAvailable ? dict.resources.useOne : dict.resources.restoreOne}
                  onClick={() =>
                    onUpdate({ used: isAvailable ? resource.used + 1 : resource.used - 1 })
                  }
                  className={`relative w-5 h-5 rounded-full border-2 cursor-pointer flex-shrink-0
                    transition-all duration-150 active:scale-90
                    [@media(hover:none)]:before:absolute [@media(hover:none)]:before:content-[''] [@media(hover:none)]:before:-inset-1
                    ${isAvailable
                      ? "bg-[var(--color-sand-deep)] border-[var(--color-sand-deep)] hover:opacity-70"
                      : "bg-transparent border-[var(--color-sand-deep)] opacity-30 hover:opacity-60"
                    }`}
                />
              );
            })
          ) : (
            <span className="text-[13px] text-[var(--color-muted-soft)] self-center">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
