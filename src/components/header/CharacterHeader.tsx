"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, LogOut, Swords } from "lucide-react";
import { EditableInput } from "@/components/ui/EditableInput";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useAuth } from "@/hooks/useAuth";
import { useDict } from "@/lib/DictContext";
import type { Character } from "@/lib/types";

interface CharacterHeaderProps {
  char: Pick<Character, "name" | "race" | "className" | "subclass" | "background" | "alignment" | "level">;
  onUpdate: (patch: Partial<Character>) => void;
  onReset: () => void;
  onStartCombat?: () => void;
}

function AvatarMenu({
  size,
  initial,
  photoURL,
  onReset,
  user,
  onSignOut,
}: {
  size: "sm" | "md";
  initial: string;
  photoURL?: string | null;
  onReset: () => void;
  user: { displayName?: string | null; email?: string | null } | null;
  onSignOut: () => void;
}) {
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setResetConfirm(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleReset = () => {
    if (resetConfirm) {
      onReset();
      setResetConfirm(false);
      setOpen(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const wh = size === "sm" ? "w-[48px] h-[48px]" : "w-[56px] h-[56px]";
  const r = size === "sm" ? "rounded-[12px]" : "rounded-[14px]";
  const fontSize = size === "sm" ? "text-[18px]" : "text-[22px]";

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${wh} ${r} overflow-hidden cursor-pointer block
          ring-2 ring-transparent hover:ring-white/20 transition-all duration-150`}
      >
        {photoURL ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoURL} alt="" className={`${r} object-cover w-full h-full`} />
          </>
        ) : (
          <div
            className={`w-full h-full ${r} flex items-center justify-center
              text-white font-extrabold ${fontSize} uppercase select-none`}
            style={{ background: "linear-gradient(145deg, #4a90d9 0%, #2d6ab5 100%)" }}
          >
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-[168px] z-50
            bg-[#28221e] border border-white/[0.08] rounded-[12px] shadow-2xl overflow-hidden py-1"
        >
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[12.5px] font-medium
              text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <RotateCcw size={12} />
            {resetConfirm ? dict.header.confirmReset : dict.header.resetCharacter}
          </button>
          {user && (
            <button
              onClick={() => { onSignOut(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[12.5px] font-medium
                text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
            >
              <LogOut size={12} />
              {dict.header.signOut}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CharacterHeader({ char, onUpdate, onReset, onStartCombat }: CharacterHeaderProps) {
  const dict = useDict();
  const { user, signOut } = useAuth();
  const initial = char.name?.[0]?.toUpperCase() ?? "?";

  const META_FIELDS: { label: string; key: keyof Pick<Character, "race" | "className" | "subclass" | "background" | "alignment"> }[] = [
    { label: dict.header.race, key: "race" },
    { label: dict.header.class, key: "className" },
    { label: dict.header.subclass, key: "subclass" },
    { label: dict.header.bg, key: "background" },
    { label: dict.header.align, key: "alignment" },
  ];

  return (
    <div
      className="px-5 py-5 max-[700px]:px-4 max-[700px]:py-4
        bg-[var(--color-ink)] rounded-[22px] shadow-[var(--shadow-md)]"
    >
      {/* ── Desktop ── */}
      <div className="max-[700px]:hidden flex items-center gap-4">
        <AvatarMenu
          size="md"
          initial={initial}
          photoURL={user?.photoURL}
          onReset={onReset}
          user={user}
          onSignOut={signOut}
        />

        {/* Name + meta row */}
        <div className="flex-1 min-w-0">
          <div className="text-[29px] font-extrabold tracking-tight leading-[1.2] text-white">
            <EditableInput
              value={char.name}
              onChange={(v) => onUpdate({ name: v })}
              dark
              asDiv
            />
          </div>
          <div className="grid grid-cols-2 min-[1050px]:grid-cols-5 gap-x-8 gap-y-1.5 mt-[7px]">
            {META_FIELDS.map(({ label, key }) => (
              <div key={key} className="flex items-center gap-[5px] min-w-0">
                <span className="text-[9.5px] font-bold tracking-[0.1em] uppercase text-white/35 leading-none shrink-0">
                  {label}
                </span>
                <span className="text-white/75 font-semibold text-[12px] min-w-0">
                  <EditableInput
                    value={char[key]}
                    onChange={(v) => onUpdate({ [key]: v })}
                    dark
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Level badge + combat button stacked */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div
            className="flex flex-col items-center justify-center
              rounded-[14px] border border-[rgba(180,80,45,0.45)]
              bg-[rgba(255,255,255,0.03)] px-5 py-3"
          >
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[rgba(200,100,60,0.7)] mb-1">
              {dict.header.level}
            </span>
            <EditableNumber
              value={char.level}
              onChange={(v) => onUpdate({ level: Math.max(1, v) })}
              min={1}
              max={99}
              maxLength={2}
              asDiv
              style={{
                color: "white",
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1,
                padding: 0,
                minWidth: 44,
                textAlign: "center",
              }}
            />
          </div>
          {onStartCombat && (
            <button
              onClick={onStartCombat}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-[12px]
                border-none cursor-pointer font-[inherit] font-semibold text-[12px]
                transition-colors duration-150"
              style={{
                background: "rgba(244,123,95,0.14)",
                color: "var(--color-coral)",
                border: "1px solid rgba(244,123,95,0.25)",
              }}
            >
              <Swords size={13} />
              <span>{dict.combat.title}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="hidden max-[700px]:block">
        <div className="flex items-start gap-3.5">
          <AvatarMenu
            size="sm"
            initial={initial}
            photoURL={user?.photoURL}
            onReset={onReset}
            user={user}
            onSignOut={signOut}
          />

          {/* Name + meta grid */}
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-extrabold tracking-tight leading-[1.2] text-white mb-3">
              <EditableInput
                value={char.name}
                onChange={(v) => onUpdate({ name: v })}
                dark
                asDiv
              />
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
              {META_FIELDS.map(({ label, key }) => (
                <div key={key} className="min-w-0">
                  <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/35 mb-0.5">
                    {label}
                  </div>
                  <div className="text-[13px] font-semibold text-white/80">
                    <EditableInput
                      value={char[key]}
                      onChange={(v) => onUpdate({ [key]: v })}
                      dark
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level bar */}
        <div className="mt-4 flex items-stretch gap-2">
          <div
            className="flex-1 flex items-center justify-between
              rounded-[12px] border border-[rgba(180,80,45,0.45)]
              bg-[rgba(255,255,255,0.03)] px-4 py-3"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[rgba(200,100,60,0.7)]">
              {dict.header.level}
            </span>
            <EditableNumber
              value={char.level}
              onChange={(v) => onUpdate({ level: Math.max(1, v) })}
              min={1}
              max={99}
              style={{
                width: 36,
                color: "white",
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1,
                padding: 0,
                textAlign: "right",
              }}
            />
          </div>
          {onStartCombat && (
            <button
              onClick={onStartCombat}
              className="flex items-center justify-center w-[56px] rounded-[12px]
                border-none cursor-pointer font-[inherit] shrink-0
                transition-colors duration-150"
              style={{
                background: "rgba(244,123,95,0.14)",
                color: "var(--color-coral)",
                border: "1px solid rgba(244,123,95,0.25)",
              }}
            >
              <Swords size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
