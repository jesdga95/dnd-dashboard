"use client";

import { Skull, Check, X } from "lucide-react";
import { IconPill } from "@/components/ui/IconPill";
import { useDict } from "@/lib/DictContext";

interface DeathSavesProps {
  successes: number;
  failures: number;
  onToggleSuccess: (i: number) => void;
  onToggleFailure: (i: number) => void;
  onClear: () => void;
}

export function DeathSaves({ successes, failures, onToggleSuccess, onToggleFailure, onClear }: DeathSavesProps) {
  const dict = useDict();
  return (
    <div className="bg-[var(--color-card)] rounded-[22px] px-5 pt-[18px] pb-4
      shadow-[var(--shadow-md)] border border-black/[0.025] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2.5 text-[16px] font-extrabold tracking-tight">
          <IconPill tint="sand"><Skull size={14} /></IconPill>
          {dict.deathSaves.title}
        </span>
        <button
          onClick={onClear}
          className="font-[inherit] font-semibold text-[12px] px-2 py-[3px] rounded-full
            border border-[var(--color-line-soft)] bg-transparent text-[var(--color-muted)]
            cursor-pointer hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-ink)] transition-colors duration-150"
        >
          {dict.deathSaves.clear}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {/* Successes */}
        <div className="flex flex-col items-start justify-between bg-[var(--color-mint)] rounded-[14px] px-3 py-3">
          <span className="text-[12px] font-bold tracking-[0.04em] uppercase text-[var(--color-mint-deep)]">
            {dict.deathSaves.successes}
          </span>
          <div className="flex gap-2 max-[1024px]:w-full max-[1024px]:justify-between">
            {[0, 1, 2].map((i) => (
              <button
                key={"s" + i}
                onClick={() => onToggleSuccess(i)}
                className={`relative w-[32px] h-[32px] rounded-full cursor-pointer
                  transition-all duration-150 inline-flex items-center justify-center
                  text-[15px] font-extrabold p-0 border-2 active:scale-95
                  [@media(hover:none)]:before:absolute [@media(hover:none)]:before:content-[''] [@media(hover:none)]:before:-inset-1
                  ${i < successes
                    ? "border-[var(--color-mint-deep)] text-[var(--color-mint-deep)]"
                    : "border-white/50 text-transparent"
                  }`}
              >
                <Check size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Failures */}
        <div className="flex flex-col items-start justify-between bg-[var(--color-peach)] rounded-[14px] px-3 py-3">
          <span className="text-[12px] font-bold tracking-[0.04em] uppercase text-[var(--color-coral-deep)]">
            {dict.deathSaves.failures}
          </span>
          <div className="flex gap-2 max-[1024px]:w-full max-[1024px]:justify-between">
            {[0, 1, 2].map((i) => (
              <button
                key={"f" + i}
                onClick={() => onToggleFailure(i)}
                className={`relative w-[32px] h-[32px] rounded-full cursor-pointer
                  transition-all duration-150 inline-flex items-center justify-center
                  text-[15px] font-extrabold p-0 border-2 active:scale-95
                  [@media(hover:none)]:before:absolute [@media(hover:none)]:before:content-[''] [@media(hover:none)]:before:-inset-1
                  ${i < failures
                    ? "border-[var(--color-coral-deep)] text-[var(--color-coral-deep)]"
                    : "border-white/50 text-transparent"
                  }`}
              >
                <X size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
