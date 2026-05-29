"use client";

import { Zap, Plus, Minus, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { useDict } from "@/lib/DictContext";
import type { CustomResource } from "@/lib/types";

interface ResourcesCardProps {
  resources: CustomResource[];
  onAdd: () => void;
  onUpdate: (id: number, patch: Partial<Omit<CustomResource, "id">>) => void;
  onRemove: (id: number) => void;
}

export function ResourcesCard({ resources, onAdd, onUpdate, onRemove }: ResourcesCardProps) {
  const dict = useDict();

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="sand"><Zap size={14} /></IconPill>}
        title={dict.resources.title}
        actions={
          <Btn variant="default" size="sm" onClick={onAdd}>
            <Plus size={11} /> {dict.resources.add}
          </Btn>
        }
      />

      {resources.length === 0 && (
        <div className="text-center py-5 text-[13px] text-[var(--color-muted-soft)]">
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
    </div>
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
      <div className="flex items-center justify-between mb-2 gap-1">
        <input
          type="text"
          value={resource.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder={dict.resources.namePlaceholder}
          maxLength={30}
          className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]
            bg-transparent border-none outline-none w-0 flex-1 min-w-0
            placeholder:text-[var(--color-muted-soft)] placeholder:normal-case placeholder:tracking-normal
            placeholder:font-normal focus:text-[var(--color-ink)]"
        />
        {/* S / L rest reset toggle */}
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover/res:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-150">
          {(["short", "long"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onUpdate({ resetOn: r })}
              title={r === "short" ? dict.resources.resetShort : dict.resources.resetLong}
              className={`text-[9px] font-bold w-5 h-5 rounded-full cursor-pointer transition-colors duration-150
                ${(resource.resetOn ?? "long") === r
                  ? "bg-[var(--color-sand-deep)] text-white"
                  : "bg-transparent text-[var(--color-muted-soft)] hover:text-[var(--color-muted)]"
                }`}
            >
              {r === "short" ? dict.resources.resetShort : dict.resources.resetLong}
            </button>
          ))}
        </div>
        <Btn variant="default" size="xs" iconOnly
          onClick={onRemove}
          title="Remove resource"
          className="opacity-0 group-hover/res:opacity-100 [@media(hover:none)]:opacity-100 flex-shrink-0
            hover:bg-[var(--color-peach)] hover:text-[var(--color-coral-deep)] hover:border-transparent
            transition-opacity duration-150"
        >
          <X size={9} />
        </Btn>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => onUpdate({ max: resource.max - 1 })}
            disabled={resource.max === 0}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer
              text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]
              transition-colors duration-100 disabled:opacity-30 disabled:cursor-default"
          >
            <Minus size={9} />
          </button>
          <span className="text-[11px] font-semibold w-4 text-center text-[var(--color-ink)]">
            {resource.max}
          </span>
          <button
            onClick={() => onUpdate({ max: resource.max + 1 })}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer
              text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]
              transition-colors duration-100"
          >
            <Plus size={9} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 min-h-[20px]">
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
                className={`w-5 h-5 rounded-full border-2 cursor-pointer flex-shrink-0
                  transition-all duration-150
                  ${isAvailable
                    ? "bg-[var(--color-sand-deep)] border-[var(--color-sand-deep)] hover:opacity-70"
                    : "bg-transparent border-[var(--color-sand-deep)] opacity-30 hover:opacity-60"
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
