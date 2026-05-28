"use client";

import { FileText, Plus, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { useDict } from "@/lib/DictContext";
import type { Note } from "@/lib/types";

interface NotesCardProps {
  notes: Note[];
  onAdd: () => void;
  onUpdate: (id: number, patch: Partial<Note>) => void;
  onDelete: (id: number) => void;
}

export function NotesCard({ notes, onAdd, onUpdate, onDelete }: NotesCardProps) {
  const dict = useDict();
  const entrySub = (notes.length === 1 ? dict.notes.entryOne : dict.notes.entryOther)
    .replace("{count}", String(notes.length));

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="sand"><FileText size={14} /></IconPill>}
        title={dict.notes.title}
        sub={entrySub}
        actions={
          <Btn variant="dark" size="sm" onClick={onAdd}>
            <Plus size={11} /> {dict.notes.addNote}
          </Btn>
        }
      />
      {notes.length === 0 ? (
        <div className="text-center py-5 px-2.5 text-[13px] text-[var(--color-muted-soft)]">
          {dict.notes.emptyStatePre}{" "}
          <strong className="text-[var(--color-ink)]">{dict.notes.emptyStateHighlight}</strong>{" "}
          {dict.notes.emptyStatePost}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              onChange={(patch) => onUpdate(note.id, patch)}
              onDelete={() => onDelete(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteRow({
  note,
  onChange,
  onDelete,
}: {
  note: Note;
  onChange: (patch: Partial<Note>) => void;
  onDelete: () => void;
}) {
  const dict = useDict();
  return (
    <div className="bg-[var(--color-bg-warm)] rounded-[14px] px-[14px] py-3
      hover:bg-[#ebe5db] focus-within:bg-[var(--color-card)]
      focus-within:border focus-within:border-[var(--color-coral)]
      focus-within:shadow-[0_0_0_3px_rgba(244,123,95,0.12)]
      border border-transparent transition-all duration-150 relative group">
      <input
        className="w-full bg-transparent border-none outline-none font-[inherit]
          text-[14px] font-bold text-[var(--color-ink)] p-0 mb-1
          placeholder:text-[var(--color-muted-soft)] placeholder:font-semibold"
        value={note.title}
        placeholder={dict.notes.titlePlaceholder}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <textarea
        className="auto-grow w-full bg-transparent border-none outline-none font-[inherit]
          text-[13.5px] text-[var(--color-ink-soft)] p-0 leading-[1.45]
          placeholder:text-[var(--color-muted-soft)]"
        value={note.body}
        placeholder={dict.notes.bodyPlaceholder}
        onChange={(e) => onChange({ body: e.target.value })}
        rows={1}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
        group-focus-within:opacity-100 transition-opacity flex gap-0.5">
        <Btn variant="ghost" size="xs" iconOnly onClick={onDelete} title="Delete note">
          <X size={11} />
        </Btn>
      </div>
    </div>
  );
}
