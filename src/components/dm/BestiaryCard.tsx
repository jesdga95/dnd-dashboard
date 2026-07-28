"use client";

import { useState } from "react";
import { Skull, Plus, X, Search } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Btn } from "@/components/ui/Btn";
import { useDict } from "@/lib/DictContext";
import { useMonsterLibrary, type MonsterDraft } from "@/hooks/useMonsterLibrary";
import type { MonsterTemplate } from "@/lib/types";

/**
 * The DM's monster library. Cards live in Firestore (`monster_library/{uid}`) and
 * are edited in place, note-card style; combat setup spawns copies from them.
 */
export function BestiaryCard() {
  const dict = useDict();
  const { monsters, loading, addMonster, updateMonster, deleteMonster } = useMonsterLibrary();
  const [search, setSearch] = useState("");
  // The card the DM just created — its name field takes the caret.
  const [freshId, setFreshId] = useState<string | null>(null);

  if (loading) return null;

  const q = search.trim().toLowerCase();
  const shown = q ? monsters.filter((m) => m.name.toLowerCase().includes(q)) : monsters;
  const countSub = (monsters.length === 1 ? dict.bestiary.cardOne : dict.bestiary.cardOther)
    .replace("{count}", String(monsters.length));

  // Clear the filter so the new (unnamed) card isn't hidden by an active search.
  const handleAdd = () => {
    setFreshId(addMonster().id);
    setSearch("");
  };

  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 py-[18px]
      shadow-[var(--shadow-md)] border border-black/[0.025]">
      <SectionHeader
        icon={<IconPill tint="peach"><Skull size={14} /></IconPill>}
        title={dict.bestiary.title}
        sub={countSub}
        actions={
          <Btn variant="dark" size="sm" onClick={handleAdd}>
            <Plus size={11} /> {dict.bestiary.addCard}
          </Btn>
        }
      />

      <p className="text-[13px] text-[var(--color-muted-soft)] leading-relaxed -mt-1 mb-3">
        {dict.bestiary.hint}
      </p>

      {monsters.length > 3 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-full bg-[var(--color-bg-warm)]">
          <Search size={13} className="text-[var(--color-muted-soft)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.bestiary.searchPlaceholder}
            maxLength={50}
            className="flex-1 min-w-0 bg-transparent border-none outline-none font-[inherit]
              text-[13.5px] font-medium text-[var(--color-ink-soft)]
              placeholder:text-[var(--color-muted-soft)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 flex items-center text-[var(--color-muted-soft)]
                hover:text-[var(--color-ink)] cursor-pointer transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {monsters.length === 0 ? (
        <div className="text-center py-5 px-2.5 text-[14px] text-[var(--color-muted-soft)]">
          {dict.bestiary.emptyPre}{" "}
          <strong className="text-[var(--color-ink)]">{dict.bestiary.addCard}</strong>{" "}
          {dict.bestiary.emptyPost}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-[14px] text-[var(--color-muted-soft)] py-3">{dict.bestiary.noMatches}</p>
      ) : (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(258px,1fr))]">
          {shown.map((card) => (
            <MonsterCardRow
              key={card.id}
              card={card}
              focusName={card.id === freshId}
              onChange={(patch) => updateMonster(card.id, patch)}
              onDelete={() => deleteMonster(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** A number field that only commits on blur / Enter, so mid-edit blanks don't reset to 0. */
function StatField({
  label,
  value,
  onCommit,
  min,
  signed,
  title,
  width,
}: {
  label: string;
  value: number | undefined;
  onCommit: (val: number | undefined) => void;
  min?: number;
  signed?: boolean;
  title?: string;
  width?: number;
}) {
  const external = value === undefined ? "" : String(value);
  const [local, setLocal] = useState(external);
  // Resync when the committed value changes elsewhere (adjust state during render).
  const [prev, setPrev] = useState(external);
  if (external !== prev) {
    setPrev(external);
    setLocal(external);
  }

  const commit = () => {
    const raw = local.trim();
    if (raw === "") {
      onCommit(undefined);
      return;
    }
    const n = parseInt(raw, 10);
    if (isNaN(n)) {
      setLocal(external);
      return;
    }
    onCommit(min !== undefined ? Math.max(min, n) : n);
  };

  return (
    <span
      title={title}
      className="inline-flex items-baseline gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[var(--color-card)]
        border border-[var(--color-line)]"
    >
      <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted-soft)]">
        {label}
      </span>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        placeholder={signed ? "+0" : "–"}
        style={{ width: width ?? 34 }}
        className="bg-transparent border-none outline-none font-[inherit] text-center
          text-[13px] font-bold text-[var(--color-ink)] rounded px-0.5
          hover:bg-black/[0.04] focus:bg-black/[0.04] transition-colors
          placeholder:font-semibold placeholder:text-[var(--color-muted-soft)]"
      />
    </span>
  );
}

function MonsterCardRow({
  card,
  focusName,
  onChange,
  onDelete,
}: {
  card: MonsterTemplate;
  /** Newly created card: put the caret in the name field so the DM can just type. */
  focusName: boolean;
  onChange: (patch: MonsterDraft) => void;
  onDelete: () => void;
}) {
  const dict = useDict();

  // The card keeps its warm surface while being edited; the focused *field* is
  // what lights up (the same treatment the character sheet's inputs use), so a
  // card created with the caret already in it doesn't read as a different kind of card.
  return (
    <div className="bg-[var(--color-bg-warm)] rounded-[14px] px-[14px] py-3
      focus-within:border-[var(--color-coral)]
      focus-within:shadow-[0_0_0_3px_rgba(244,123,95,0.12)]
      border border-transparent transition-all duration-150">
      <div className="flex items-center gap-1.5 mb-2">
        <input
          autoFocus={focusName}
          className="flex-1 min-w-0 bg-transparent border-none font-[inherit]
            text-[15px] font-bold text-[var(--color-ink)] px-1 -ml-1 rounded
            outline-none focus:bg-[var(--color-card)] focus:shadow-[0_0_0_2px_var(--color-coral)]
            transition-[background,box-shadow] duration-[0.12s]
            placeholder:text-[var(--color-muted-soft)] placeholder:font-semibold
            overflow-hidden text-ellipsis whitespace-nowrap"
          value={card.name}
          placeholder={dict.bestiary.namePlaceholder}
          maxLength={50}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <Btn
          variant="default"
          size="xs"
          iconOnly
          onClick={onDelete}
          title={dict.bestiary.deleteCard}
          className="hover:bg-[var(--color-peach)] hover:text-[var(--color-coral-deep)] hover:border-transparent"
        >
          <X size={11} />
        </Btn>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <StatField
          label={dict.bestiary.hpLabel}
          value={card.hp}
          min={1}
          width={40}
          title={dict.bestiary.hpTitle}
          onCommit={(v) => onChange({ hp: v ?? 1 })}
        />
        <StatField
          label={dict.bestiary.acLabel}
          value={card.ac}
          min={0}
          title={dict.bestiary.acTitle}
          onCommit={(v) => onChange({ ac: v })}
        />
        <StatField
          label={dict.bestiary.initLabel}
          value={card.initBonus}
          signed
          title={dict.bestiary.initTitle}
          onCommit={(v) => onChange({ initBonus: v })}
        />
      </div>

      <textarea
        className="auto-grow w-full bg-transparent border-none outline-none font-[inherit]
          text-[13.5px] text-[var(--color-ink-soft)] p-0 leading-[1.45]
          placeholder:text-[var(--color-muted-soft)]"
        value={card.notes ?? ""}
        placeholder={dict.bestiary.notesPlaceholder}
        maxLength={4000}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={1}
      />
    </div>
  );
}
