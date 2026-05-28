"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, LogOut, Share2, Copy, Check, Moon, Coffee, FileText } from "lucide-react";
import { EditableInput } from "@/components/ui/EditableInput";
import { EditableNumber } from "@/components/ui/EditableNumber";
import { useAuth } from "@/hooks/useAuth";
import { useDict } from "@/lib/DictContext";
import type { Character } from "@/lib/types";
import { charToMarkdown } from "@/lib/charToMarkdown";

interface CharacterHeaderProps {
  char: Character;
  onUpdate: (patch: Partial<Character>) => void;
  onReset: () => void;
  onShortRest: () => void;
  onLongRest: () => void;
  onToggleSharing: () => void;
  isShared: boolean;
  userId: string | null;
}

function AvatarMenu({
  size,
  initial,
  photoURL,
  onReset,
  user,
  onSignOut,
  isShared,
  userId,
  onToggleSharing,
  char,
}: {
  size: "sm" | "md";
  initial: string;
  photoURL?: string | null;
  onReset: () => void;
  user: { displayName?: string | null; email?: string | null } | null;
  onSignOut: () => void;
  isShared: boolean;
  userId: string | null;
  onToggleSharing: () => void;
  char: Character;
}) {
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
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

  const handleCopy = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportMd = () => {
    navigator.clipboard.writeText(charToMarkdown(char)).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    });
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
          className="absolute top-full left-0 mt-2 w-[180px] z-50
            bg-[#28221e] border border-white/[0.08] rounded-[12px] shadow-2xl overflow-hidden py-1"
        >
          {/* Sharing */}
          <button
            onClick={() => { onToggleSharing(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[12.5px] font-medium
              transition-colors cursor-pointer text-left"
            style={isShared
              ? { color: "rgba(72,200,160,0.9)", background: "rgba(72,200,160,0.08)" }
              : { color: "rgba(255,255,255,0.5)" }
            }
          >
            <Share2 size={12} />
            {isShared ? dict.sharing.enabled : dict.sharing.label}
          </button>

          {isShared && userId && (
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[12.5px] font-medium
                text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? dict.sharing.copied : dict.sharing.copyId}
            </button>
          )}

          <button
            onClick={handleExportMd}
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[12.5px] font-medium
              text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            {exportCopied ? <Check size={12} /> : <FileText size={12} />}
            {exportCopied ? dict.sharing.exportMdCopied : dict.sharing.exportMd}
          </button>

          <div className="my-1 border-t border-white/[0.08]" />

          <button
            onClick={handleReset}
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[12.5px] font-medium
              text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <RotateCcw size={12} />
            {resetConfirm ? dict.header.confirmResetProfile : dict.header.resetProfile}
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

export function CharacterHeader({ char, onUpdate, onReset, onShortRest, onLongRest, onToggleSharing, isShared, userId }: CharacterHeaderProps) {
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

  const restButtons = (fullWidth: boolean) => (
    <div className={`flex gap-2 mt-3 pt-3 border-t border-white/[0.08] ${fullWidth ? "" : "justify-end"}`}>
      <button
        onClick={onShortRest}
        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] text-[11px] font-semibold
          transition-colors duration-150 cursor-pointer ${fullWidth ? "flex-1" : ""}`}
        style={{ background: "rgba(99,149,225,0.18)", color: "#7aaee8", border: "1px solid rgba(99,149,225,0.3)" }}
      >
        <Coffee size={10} />
        {dict.header.shortRest}
      </button>
      <button
        onClick={onLongRest}
        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] text-[11px] font-semibold
          transition-colors duration-150 cursor-pointer ${fullWidth ? "flex-1" : ""}`}
        style={{ background: "rgba(72,200,160,0.14)", color: "var(--color-mint-deep)", border: "1px solid rgba(72,200,160,0.25)" }}
      >
        <Moon size={10} />
        {dict.header.longRest}
      </button>
    </div>
  );

  return (
    <div
      className="px-5 py-5 max-[700px]:px-4 max-[700px]:py-4
        bg-[var(--color-ink)] rounded-[22px] shadow-[var(--shadow-md)]"
    >
      {/* ── Desktop ── */}
      <div className="max-[700px]:hidden">
        <div className="flex items-center gap-4">
          <AvatarMenu
            size="md"
            initial={initial}
            photoURL={user?.photoURL}
            onReset={onReset}
            user={user}
            onSignOut={signOut}
            isShared={isShared}
            userId={userId}
            onToggleSharing={onToggleSharing}
            char={char}
          />

          {/* Name + meta row */}
          <div className="flex-1 min-w-0">
            <div className="text-[29px] font-extrabold tracking-tight leading-[1.2] text-white">
              <EditableInput
                value={char.name}
                onChange={(v) => onUpdate({ name: v })}
                dark
                asDiv
                maxLength={50}
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
                      maxLength={30}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Level badge */}
          <div className="flex-shrink-0">
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
                onChange={(v) => onUpdate({ level: Math.max(1, v ?? 1) })}
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
          </div>
        </div>

        {restButtons(false)}
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
            isShared={isShared}
            userId={userId}
            onToggleSharing={onToggleSharing}
            char={char}
          />

          {/* Name + meta grid */}
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-extrabold tracking-tight leading-[1.2] text-white mb-3">
              <EditableInput
                value={char.name}
                onChange={(v) => onUpdate({ name: v })}
                dark
                asDiv
                maxLength={50}
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
                      maxLength={30}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level bar */}
        <div className="mt-4">
          <div
            className="flex items-center justify-between
              rounded-[12px] border border-[rgba(180,80,45,0.45)]
              bg-[rgba(255,255,255,0.03)] px-4 py-3"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[rgba(200,100,60,0.7)]">
              {dict.header.level}
            </span>
            <EditableNumber
              value={char.level}
              onChange={(v) => onUpdate({ level: Math.max(1, v ?? 1) })}
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
        </div>

        {restButtons(true)}
      </div>
    </div>
  );
}
