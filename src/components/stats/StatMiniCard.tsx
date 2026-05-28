"use client";

import { EditableNumber } from "@/components/ui/EditableNumber";
import { EditableInput } from "@/components/ui/EditableInput";

type Tint = "mint" | "peach" | "blue" | "lavender" | "sand";

const tintBg: Record<Tint, string> = {
  mint: "bg-[var(--color-mint)]",
  peach: "bg-[var(--color-peach)]",
  blue: "bg-[var(--color-blue)]",
  lavender: "bg-[var(--color-lavender)]",
  sand: "bg-[var(--color-sand)]",
};

const tintLabel: Record<Tint, string> = {
  mint: "text-[var(--color-mint-deep)]",
  peach: "text-[var(--color-peach-deep)]",
  blue: "text-[var(--color-blue-deep)]",
  lavender: "text-[var(--color-lavender-deep)]",
  sand: "text-[var(--color-sand-deep)]",
};

interface StatMiniCardProps {
  label: string;
  tint: Tint;
  prefix?: string;
  suffix?: string;
  type?: "number" | "text";
  numValue?: number;
  textValue?: string;
  onChangeNum?: (val: number) => void;
  onChangeText?: (val: string) => void;
}

export function StatMiniCard({
  label,
  tint,
  prefix,
  suffix,
  type = "number",
  numValue,
  textValue,
  onChangeNum,
  onChangeText,
}: StatMiniCardProps) {
  return (
    <div className={`${tintBg[tint]} rounded-[16px] px-4 py-[14px]
      shadow-[var(--shadow-sm)] border border-black/[0.02] relative overflow-hidden`}>
      <div className={`text-[10px] font-bold tracking-[0.1em] uppercase ${tintLabel[tint]}`}>
        {label}
      </div>
      <div className="flex items-baseline gap-[3px] mt-1 text-[26px] font-extrabold tracking-tight leading-none">
        {prefix && <span className="text-[var(--color-muted)] text-[16px] font-bold">{prefix}</span>}
        {type === "number" && onChangeNum !== undefined && numValue !== undefined ? (
          <EditableNumber
            value={numValue}
            onChange={onChangeNum}
            style={{ width: 56, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}
          />
        ) : (
          <EditableInput
            value={textValue ?? ""}
            onChange={onChangeText ?? (() => {})}
            style={{ textAlign: "center", fontWeight: 800, fontSize: 22 }}
          />
        )}
        {suffix && (
          <small className="text-[12px] text-[var(--color-muted)] font-semibold">{suffix}</small>
        )}
      </div>
    </div>
  );
}
