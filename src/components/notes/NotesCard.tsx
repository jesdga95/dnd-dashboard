"use client";

import { FileText, Plus, X, Share2, Mic, MicOff } from "lucide-react";
import { useCallback } from "react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { useDict } from "@/lib/DictContext";
import { useNotes } from "@/hooks/useNotes";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import type { PartyNote } from "@/lib/types";

export function NotesCard({ characterName, partyMemberIds }: { characterName?: string; partyMemberIds?: string[] } = {}) {
  const dict = useDict();
  const {
    myNotes,
    sharedNotes,
    loading,
    canShare,
    addNote,
    updateNote,
    toggleShare,
    deleteNote,
    myUid,
  } = useNotes({ characterName });
  const speech = useSpeechToText();

  const otherShared = sharedNotes.filter((n) =>
    n.ownerId !== myUid &&
    (partyMemberIds == null || partyMemberIds.includes(n.ownerId))
  );
  const hasShared = otherShared.length > 0;

  const totalCount = myNotes.length;
  const entrySub = (totalCount === 1 ? dict.notes.entryOne : dict.notes.entryOther)
    .replace("{count}", String(totalCount));

  if (loading) return null;

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="sand"><FileText size={14} /></IconPill>}
        title={dict.notes.title}
        sub={hasShared ? undefined : entrySub}
        actions={
          <Btn variant="dark" size="sm" onClick={addNote}>
            <Plus size={11} /> {dict.notes.addNote}
          </Btn>
        }
      />

      {/* Two-column layout: my notes left, shared right */}
      <div className={`grid gap-4 ${hasShared ? "grid-cols-2 max-[1024px]:grid-cols-1" : "grid-cols-1"}`}>
        {/* Left: My Notes */}
        <div className="flex flex-col gap-2.5">
          {hasShared && (
            <div className="flex items-center gap-2 mb-0.5">
              <FileText size={12} className="text-[var(--color-muted-soft)]" />
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted-soft)]">
                {dict.notes.myNotes}
              </span>
              <span className="text-[12px] text-[var(--color-muted-soft)]">
                · {(myNotes.length === 1 ? dict.notes.entryOne : dict.notes.entryOther).replace("{count}", String(myNotes.length))}
              </span>
            </div>
          )}
          {myNotes.length === 0 ? (
            <div className="text-center py-5 px-2.5 text-[14px] text-[var(--color-muted-soft)]">
              {dict.notes.emptyStatePre}{" "}
              <strong className="text-[var(--color-ink)]">{dict.notes.emptyStateHighlight}</strong>{" "}
              {dict.notes.emptyStatePost}
            </div>
          ) : (
            myNotes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                canShare={canShare}
                speech={speech}
                onChange={(patch) => updateNote(note.id, patch)}
                onToggleShare={() => toggleShare(note.id, !note.shared)}
                onDelete={() => deleteNote(note.id)}
              />
            ))
          )}
        </div>

        {/* Right: Shared with Party (only rendered when there are shared notes) */}
        {hasShared && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <Share2 size={12} className="text-[var(--color-muted-soft)]" />
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted-soft)]">
                {dict.notes.sharedTitle}
              </span>
              <span className="text-[12px] text-[var(--color-muted-soft)]">
                · {dict.notes.sharedSub.replace("{count}", String(otherShared.length))}
              </span>
            </div>
            {otherShared.map((note) => (
              <SharedNoteRow key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteRow({
  note,
  canShare,
  speech,
  onChange,
  onToggleShare,
  onDelete,
}: {
  note: PartyNote;
  canShare: boolean;
  speech: ReturnType<typeof useSpeechToText>;
  onChange: (patch: Partial<Pick<PartyNote, "title" | "body">>) => void;
  onToggleShare: () => void;
  onDelete: () => void;
}) {
  const dict = useDict();
  const isActive = speech.activeId === note.id;

  const handleMic = useCallback(() => {
    if (isActive) {
      speech.stop();
    } else {
      speech.start(note.id, (text) => {
        onChange({ body: note.body + (note.body ? " " : "") + text });
      });
    }
  }, [isActive, speech, note.id, note.body, onChange]);

  return (
    <div className="bg-[var(--color-bg-warm)] rounded-[14px] px-[14px] py-3
      hover:bg-[#ebe5db] focus-within:bg-[var(--color-card)]
      focus-within:border focus-within:border-[var(--color-coral)]
      focus-within:shadow-[0_0_0_3px_rgba(244,123,95,0.12)]
      border border-transparent transition-all duration-150">
      {/* Title row with inline action buttons */}
      <div className="flex items-center gap-1.5 mb-1">
        <input
          className="flex-1 min-w-0 bg-transparent border-none outline-none font-[inherit]
            text-[15px] font-bold text-[var(--color-ink)] p-0
            placeholder:text-[var(--color-muted-soft)] placeholder:font-semibold
            overflow-hidden text-ellipsis whitespace-nowrap"
          value={note.title}
          placeholder={dict.notes.titlePlaceholder}
          maxLength={100}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <div className="flex items-center gap-0.5 shrink-0">
          <Btn
            variant="default"
            size="xs"
            iconOnly
            onClick={onToggleShare}
            disabled={!canShare}
            title={canShare
              ? (note.shared ? dict.notes.unshareNote : dict.notes.shareNote)
              : dict.notes.shareNeedsDm}
            style={note.shared
              ? { color: "rgba(72,200,160,0.9)", background: "rgba(72,200,160,0.08)", borderColor: "rgba(72,200,160,0.3)" }
              : undefined}
          >
            <Share2 size={11} />
          </Btn>
          {speech.supported && (
            <Btn
              variant="default"
              size="xs"
              iconOnly
              onClick={handleMic}
              title={isActive ? dict.notes.micStop : dict.notes.micStart}
              style={isActive
                ? { color: "rgba(244,123,95,0.9)", background: "rgba(244,123,95,0.12)", borderColor: "rgba(244,123,95,0.3)" }
                : undefined}
            >
              {isActive ? <MicOff size={11} /> : <Mic size={11} />}
            </Btn>
          )}
          <Btn
            variant="default"
            size="xs"
            iconOnly
            onClick={onDelete}
            title={dict.common.delete}
            className="hover:bg-[var(--color-peach)] hover:text-[var(--color-coral-deep)] hover:border-transparent"
          >
            <X size={11} />
          </Btn>
        </div>
      </div>
      <textarea
        className="auto-grow w-full bg-transparent border-none outline-none font-[inherit]
          text-[14.5px] text-[var(--color-ink-soft)] p-0 leading-[1.45]
          placeholder:text-[var(--color-muted-soft)]"
        value={note.body}
        placeholder={dict.notes.bodyPlaceholder}
        maxLength={5000}
        onChange={(e) => onChange({ body: e.target.value })}
        rows={1}
      />
      {isActive && speech.interim && (
        <p className="text-[13px] text-[var(--color-muted-soft)] italic mt-1 leading-[1.4]">
          {speech.interim}
        </p>
      )}
      {speech.error === "not-allowed" && speech.activeId === null && (
        <p className="text-[12px] text-[var(--color-coral-deep)] mt-1">
          {dict.notes.micDenied}
        </p>
      )}
    </div>
  );
}

function SharedNoteRow({ note }: { note: PartyNote }) {
  const dict = useDict();
  return (
    <div className="bg-[var(--color-bg-warm)] rounded-[14px] px-[14px] py-3
      border border-transparent">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Share2 size={10} style={{ color: "rgba(72,200,160,0.7)" }} />
        <span className="text-[11.5px] text-[var(--color-muted-soft)]">
          {dict.notes.byAuthor.replace("{name}", note.authorName)}
        </span>
      </div>
      {note.title ? (
        <p className="text-[15px] font-bold text-[var(--color-ink)] mb-0.5 leading-[1.3]">
          {note.title}
        </p>
      ) : null}
      {note.body ? (
        <p className="text-[14.5px] text-[var(--color-ink-soft)] leading-[1.45] whitespace-pre-wrap">
          {note.body}
        </p>
      ) : null}
    </div>
  );
}
