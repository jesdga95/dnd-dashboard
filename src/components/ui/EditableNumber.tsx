"use client";

import { useEffect, useRef, useState } from "react";

interface EditableNumberProps {
  value: number | null;
  onChange: (val: number | null) => void;
  min?: number;
  max?: number;
  maxLength?: number;
  signed?: boolean;
  format?: (val: number) => string;
  className?: string;
  style?: React.CSSProperties;
  asDiv?: boolean;
}

const DASH = "–";

export function EditableNumber({
  value,
  onChange,
  min,
  max,
  maxLength,
  signed = false,
  format,
  className = "",
  style,
  asDiv = false,
}: EditableNumberProps) {
  const [localVal, setLocalVal] = useState<string | null>(null);
  const focused = localVal !== null;
  const empty = localVal === "";

  const displayValue = focused
    ? localVal
    : value === null
      ? DASH
      : format
        ? format(value)
        : String(value);

  const commit = (raw: string | null) => {
    if (raw === "" || raw === null) { onChange(null); setLocalVal(null); return; }
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) { onChange(null); setLocalVal(null); return; }
    let final = parsed;
    const effectiveMin = min ?? (signed ? undefined : 0);
    if (effectiveMin !== undefined) final = Math.max(effectiveMin, final);
    if (max !== undefined) final = Math.min(max, final);
    onChange(final);
    setLocalVal(null);
  };

  const isNull = value === null;
  const showOutline = (!focused && isNull) || empty;

  // Editability hint that reads on any surface: light tiles/coins get a faint dark wash, the dark header a light one.
  const affordance = asDiv ? "cursor-text hover:bg-white/[0.10]" : "cursor-text hover:bg-black/[0.05]";

  const sharedCls = `bg-transparent border-none text-center
    font-[inherit] text-[inherit] leading-[inherit] tracking-[inherit]
    ${affordance} focus:shadow-[0_0_0_2px_var(--color-coral)]
    transition-[background,box-shadow] duration-[0.12s] rounded px-0.5
    ${showOutline ? "[outline:1.5px_dashed_rgba(128,128,128,0.4)]" : "outline-none"}
    ${className}`;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (asDiv && divRef.current && !focused) {
      divRef.current.textContent = displayValue;
    }
  }, [asDiv, displayValue, focused]);

  if (asDiv) {
    return (
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={(e) => { setLocalVal(""); e.currentTarget.textContent = ""; }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); return; }
          const editKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
          if (editKeys.includes(e.key)) return;
          if (!/[\d\-]/.test(e.key)) { e.preventDefault(); return; }
          if (maxLength !== undefined && (e.currentTarget.textContent ?? "").length >= maxLength) {
            e.preventDefault();
          }
        }}
        onInput={(e) => setLocalVal(e.currentTarget.textContent ?? "")}
        onBlur={(e) => commit(e.currentTarget.textContent)}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain").replace(/[^\d\-]/g, "");
          document.execCommand("insertText", false, text);
        }}
        style={style}
        className={sharedCls}
      />
    );
  }

  return (
    <input
      type={!focused && (isNull || format) ? "text" : "number"}
      value={displayValue ?? ""}
      onFocus={() => setLocalVal("")}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => commit(localVal)}
      style={style}
      className={sharedCls}
    />
  );
}
