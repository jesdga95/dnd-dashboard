"use client";

import { Check, X, Trash2, Swords } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import type { PartyMember } from "@/hooks/useDmParty";

type Tint = "mint" | "peach" | "blue" | "lavender" | "sand";

const tintBg: Record<Tint, string> = {
  mint: "bg-[rgba(72,200,160,0.10)]",
  peach: "bg-[rgba(244,123,95,0.10)]",
  blue: "bg-[rgba(99,149,225,0.10)]",
  lavender: "bg-[rgba(155,135,210,0.10)]",
  sand: "bg-[rgba(200,168,100,0.10)]",
};

const tintText: Record<Tint, string> = {
  mint: "text-[#2a9d75]",
  peach: "text-[var(--color-coral)]",
  blue: "text-[#3a6fbb]",
  lavender: "text-[#6a55b0]",
  sand: "text-[#8a6e20]",
};

const tintLabel: Record<Tint, string> = {
  mint: "text-[rgba(42,157,117,0.6)]",
  peach: "text-[rgba(200,80,50,0.6)]",
  blue: "text-[rgba(58,111,187,0.6)]",
  lavender: "text-[rgba(106,85,176,0.6)]",
  sand: "text-[rgba(138,110,32,0.6)]",
};

function StatChip({ label, value, tint }: { label: string; value: string | number; tint: Tint }) {
  return (
    <div className={`${tintBg[tint]} rounded-[12px] px-2 py-2 border border-black/[0.02]`}>
      <div className={`text-[8.5px] font-bold tracking-[0.1em] uppercase ${tintLabel[tint]} mb-1`}>{label}</div>
      <div className={`text-[18px] font-extrabold tracking-tight leading-none ${tintText[tint]}`}>{value}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-[22px] overflow-hidden shadow-[var(--shadow-md)] border border-black/[0.025] animate-pulse">
      <div className="h-[80px] bg-[#2a2420]" />
      <div className="bg-[var(--color-card)] p-5 space-y-3">
        <div className="h-8 bg-[var(--color-line-soft)] rounded-lg w-3/4" />
        <div className="h-2 bg-[var(--color-line-soft)] rounded-full" />
        <div className="grid grid-cols-5 gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[52px] bg-[var(--color-line-soft)] rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ uid, message }: { uid: string; message: string }) {
  const dict = useDict();
  const isNotShared = message === "access_denied";
  return (
    <div className="rounded-[22px] overflow-hidden shadow-[var(--shadow-md)] border border-black/[0.025]">
      <div className="h-[6px]" style={{ background: "rgba(244,123,95,0.3)" }} />
      <div className="bg-[var(--color-card)] px-5 py-6">
        <p className="text-[13px] font-semibold text-[var(--color-coral)]">
          {isNotShared ? dict.dm.notShared : "Character not found"}
        </p>
        <p className="text-[11px] text-[var(--color-muted)] mt-1">
          {isNotShared ? dict.dm.notSharedHint : "Check the ID and try again."}
        </p>
        <p className="text-[10px] text-[var(--color-muted)] mt-3 font-mono opacity-50 truncate">{uid}</p>
      </div>
    </div>
  );
}

interface PartyCardProps {
  member: PartyMember;
  onRemove: (uid: string) => void;
}

export function PartyCard({ member, onRemove }: PartyCardProps) {
  const dict = useDict();
  const { char, loading, error, uid } = member;

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorCard uid={uid} message={error} />;

  const hp = char.hp ?? 0;
  const hpMax = Math.max(1, char.hpMax ?? 1);
  const tempHp = char.tempHp ?? 0;
  const hpPct = Math.max(0, Math.min(100, (hp / hpMax) * 100));
  const tempPct = tempHp > 0 ? Math.max(0, Math.min(100 - hpPct, (tempHp / (hpMax + tempHp)) * 100)) : 0;

  const percProf = char.skills?.["Perception"] ?? "none";
  const wisdomMod = char.abilities?.Wisdom?.mod ?? 0;
  const profBonus = char.proficiency ?? 0;
  const passivePerception =
    10 +
    wisdomMod +
    (percProf === "expert" ? profBonus * 2 : percProf === "proficient" ? profBonus : 0);

  const spellcasting = char.spellcasting;
  const slotLevels = spellcasting
    ? Object.entries(spellcasting.slots)
        .filter(([, slot]) => slot.max > 0)
        .sort(([a], [b]) => Number(a) - Number(b))
    : [];

  const conditions = char.conditions ?? [];
  const identity = [char.race, char.className, char.subclass].filter(Boolean).join(" · ");
  const initDisplay = (char.initiative ?? 0) >= 0 ? `+${char.initiative ?? 0}` : `${char.initiative ?? 0}`;

  return (
    <div className="rounded-[22px] overflow-hidden shadow-[var(--shadow-md)] border border-black/[0.025]">
      {/* Identity strip */}
      <div className="bg-[var(--color-ink)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[18px] font-extrabold text-white tracking-tight truncate">
                {char.name || "—"}
              </div>
              {char.inCombat && (
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] shrink-0 text-[10px] font-bold"
                  style={{ background: "rgba(244,123,95,0.18)", color: "var(--color-coral)", border: "1px solid rgba(244,123,95,0.3)" }}
                >
                  <Swords size={9} />
                </span>
              )}
            </div>
            {identity && (
              <div className="text-[11px] text-white/40 mt-0.5 truncate">{identity}</div>
            )}
          </div>
          <div className="flex items-stretch gap-2 shrink-0">
            <div
              className="rounded-[10px] border border-[rgba(180,80,45,0.45)]
                bg-[rgba(255,255,255,0.03)] px-3 py-2 text-center w-[52px]"
            >
              <div className="text-[7px] font-bold tracking-[0.2em] uppercase text-[rgba(200,100,60,0.7)]">
                {dict.dm.lv}
              </div>
              <div className="text-[20px] font-extrabold text-white leading-none">{char.level ?? 1}</div>
            </div>
            <button
              onClick={() => onRemove(uid)}
              className="w-[52px] flex items-center justify-center rounded-[10px] cursor-pointer
                transition-colors duration-150"
              style={{ border: "1px solid rgba(180,80,45,0.45)", background: "rgba(255,255,255,0.03)", color: "rgba(200,100,60,0.7)" }}
              title={dict.dm.remove}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* HP section */}
      <div className="bg-[var(--color-card)] px-5 pt-4 pb-3">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-[28px] font-extrabold tracking-tight text-[var(--color-ink)]">{hp}</span>
          {tempHp > 0 && (
            <span className="text-[13px] font-bold" style={{ color: "#818cf8" }}>(+{tempHp})</span>
          )}
          <span className="text-[14px] text-[var(--color-muted)]">/ {char.hpMax ?? "—"}</span>
          {char.inspiration && <span className="ml-auto text-[16px]" style={{ color: "#c8a84b" }}>★</span>}
        </div>

        {/* HP bar */}
        <div className="h-[7px] rounded-full overflow-hidden flex mb-3" style={{ background: "var(--color-line-soft)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${hpPct}%`,
              background: hp <= (hpMax * 0.25) ? "#e05050" : hp <= (hpMax * 0.5) ? "#e0a030" : "var(--color-coral)",
            }}
          />
          {tempPct > 0 && (
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${tempPct}%`, background: "linear-gradient(90deg, #818cf8, #60a5fa)" }}
            />
          )}
        </div>

        {/* Death saves */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--color-mint-deep)", opacity: 0.6 }}>S</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[18px] h-[18px] rounded-full border flex items-center justify-center"
                  style={{
                    borderColor: i < (char.deathSaves ?? 0) ? "var(--color-mint-deep)" : "var(--color-line)",
                    color: i < (char.deathSaves ?? 0) ? "var(--color-mint-deep)" : "transparent",
                  }}
                >
                  <Check size={9} />
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[18px] h-[18px] rounded-full border flex items-center justify-center"
                  style={{
                    borderColor: i < (char.deathFails ?? 0) ? "var(--color-coral)" : "var(--color-line)",
                    color: i < (char.deathFails ?? 0) ? "var(--color-coral)" : "transparent",
                  }}
                >
                  <X size={9} />
                </span>
              ))}
            </div>
            <span className="text-[9px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--color-coral)", opacity: 0.6 }}>F</span>
          </div>
        </div>
      </div>

      {/* Stat chips — 2 + 3 layout */}
      <div className="flex flex-col gap-1.5 px-5 pb-3 bg-[var(--color-card)]">
        <div className="grid grid-cols-2 gap-1.5">
          <StatChip label={dict.stats.armor} value={char.ac ?? "—"} tint="mint" />
          <StatChip label={dict.stats.speed} value={char.speed ?? "—"} tint="peach" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <StatChip label={dict.stats.initiative} value={initDisplay} tint="blue" />
          <StatChip label={dict.stats.proficiency} value={`+${char.proficiency ?? 0}`} tint="lavender" />
          <StatChip label={dict.dm.passivePerception} value={passivePerception} tint="sand" />
        </div>
      </div>

      {/* Spell slots — only if spellcasting with slots */}
      {spellcasting && slotLevels.length > 0 && (
        <div className="px-5 pb-3 bg-[var(--color-card)]">
          <div className="border-t border-[var(--color-line-soft)] pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-muted)] opacity-70">
                {dict.dm.slots}
              </span>
              {spellcasting.saveDC && (
                <span className="ml-auto text-[10px] text-[var(--color-muted)]">
                  {dict.dm.spellSaveDC} <span className="font-bold text-[var(--color-ink)]">{spellcasting.saveDC}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-y-1.5 gap-x-3">
              {slotLevels.map(([lvl, slot]) => {
                const remaining = slot.max - slot.used;
                const allUsed = remaining === 0;
                return (
                  <div key={lvl} className="flex items-center gap-1">
                    <span
                      className="text-[9px] font-bold w-[14px]"
                      style={{ color: allUsed ? "var(--color-muted)" : "var(--color-ink)", opacity: allUsed ? 0.4 : 0.6 }}
                    >
                      {dict.spellcasting.ordinals[Number(lvl)]}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(slot.max)].map((_, i) => (
                        <span
                          key={i}
                          className="w-[8px] h-[8px] rounded-full border"
                          style={{
                            background: i < remaining ? "var(--color-lavender-deep, #8b6fd4)" : "transparent",
                            borderColor: i < remaining ? "var(--color-lavender-deep, #8b6fd4)" : "var(--color-line)",
                            opacity: allUsed ? 0.4 : 1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="px-5 pb-4 bg-[var(--color-card)]">
          <div className="flex flex-wrap gap-1.5">
            {conditions.map((c, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: "rgba(244,123,95,0.12)",
                  color: "var(--color-coral)",
                  border: "1px solid rgba(244,123,95,0.2)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
