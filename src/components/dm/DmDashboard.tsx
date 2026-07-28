"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, RotateCcw, LogOut, Swords, Users } from "lucide-react";
import { useDmParty } from "@/hooks/useDmParty";
import { useDmCombat } from "@/hooks/useDmCombat";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useDict } from "@/lib/DictContext";
import { PartyCard } from "./PartyCard";
import { DmCombatMode } from "./DmCombatMode";
import { BestiaryCard } from "./BestiaryCard";
import { NotesCard } from "@/components/notes/NotesCard";

function DmAvatarMenu({ onReset, onSignOut }: { onReset: () => void; onSignOut: () => void }) {
  const dict = useDict();
  const { user } = useAuth();
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

  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "D";

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-[44px] h-[44px] rounded-[12px] overflow-hidden cursor-pointer block
          ring-2 ring-transparent hover:ring-white/20 transition-all duration-150"
      >
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="rounded-[12px] object-cover w-full h-full" />
        ) : (
          <div
            className="w-full h-full rounded-[12px] flex items-center justify-center
              text-white font-extrabold text-[18px] uppercase select-none"
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
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[13.5px] font-medium
              text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <RotateCcw size={12} />
            {resetConfirm ? dict.header.confirmResetProfile : dict.header.resetProfile}
          </button>
          <button
            onClick={() => { onSignOut(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[13.5px] font-medium
              text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <LogOut size={12} />
            {dict.header.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

export function DmDashboard() {
  const dict = useDict();
  const { partyLoading, members, addPlayer, removePlayer } = useDmParty();
  const { combat } = useDmCombat();
  const { role, resetProfile } = useProfile();
  const { signOut } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [combatOpen, setCombatOpen] = useState(false);

  const handleAdd = async () => {
    const uid = inputValue.trim();
    if (!uid) return;
    setAdding(true);
    await addPlayer(uid);
    setInputValue("");
    setAdding(false);
  };

  if (partyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 pb-[60px] max-[1024px]:px-[14px] max-[1024px]:py-[18px]">
      {/* Header */}
      <div
        className="px-5 py-5 max-[1024px]:px-4 max-[1024px]:py-4
          bg-[var(--color-ink)] rounded-[22px] shadow-[var(--shadow-md)] mb-4"
      >
        <div className="flex items-center gap-3">
          <DmAvatarMenu
            onReset={() => resetProfile(role ?? undefined)}
            onSignOut={signOut}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-extrabold text-white tracking-tight">{dict.dm.title}</h1>
            <p className="text-[12px] text-white/35 mt-0.5">
              {(members.length === 1 ? dict.dm.playerCount : dict.dm.playersCount).replace("{count}", String(members.length))} · {dict.dm.liveUpdates}
            </p>
          </div>
          {!combatOpen && (
            <button
              onClick={() => setCombatOpen(true)}
              disabled={!combat && members.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-[13px] font-semibold
                cursor-pointer transition-colors duration-150 shrink-0
                disabled:opacity-30 disabled:cursor-not-allowed
                bg-[rgba(244,123,95,0.14)] text-[var(--color-coral)] border border-[rgba(244,123,95,0.25)]
                max-[768px]:bg-[rgba(244,123,95,1)] max-[768px]:text-white max-[768px]:border-[rgba(244,123,95,1)]"
            >
              <Swords size={14} />
              <span className="max-[480px]:hidden">{combat ? dict.dmCombat.resume : dict.dmCombat.start}</span>
            </button>
          )}
        </div>

        {/* Add player input */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={dict.dm.addPlayerPlaceholder}
            maxLength={40}
            className="flex-1 px-3 py-2 rounded-[10px] text-[14px] font-medium
              outline-none transition-colors duration-150 font-mono"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !inputValue.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
              transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{
              background: "rgba(244,123,95,0.18)",
              color: "var(--color-coral)",
              border: "1px solid rgba(244,123,95,0.3)",
            }}
          >
            <Plus size={14} />
            {dict.dm.add}
          </button>
        </div>
        {members.length === 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Users size={18} className="shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              {dict.dm.emptyHint}
            </p>
          </div>
        )}
      </div>

      {/* Party grid */}
      {members.length > 0 && (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {members.map((m) => (
            <PartyCard key={m.uid} member={m} onRemove={removePlayer} />
          ))}
        </div>
      )}

      <div className="h-4" />
      <BestiaryCard />

      <div className="h-4" />
      <NotesCard partyMemberIds={members.map((m) => m.uid)} />

      {combatOpen && (
        <DmCombatMode members={members} onClose={() => setCombatOpen(false)} />
      )}
    </div>
  );
}
