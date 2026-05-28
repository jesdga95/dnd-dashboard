"use client";

import { useState } from "react";

interface EditableNumberProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  format?: (val: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

export function EditableNumber({
  value,
  onChange,
  min,
  max,
  format,
  className = "",
  style,
}: EditableNumberProps) {
  const [localVal, setLocalVal] = useState<string | null>(null);
  const focused = localVal !== null;

  const displayValue = focused ? localVal! : (format ? format(value) : String(value));

  return (
    <input
      type={format && !focused ? "text" : "number"}
      value={displayValue}
      onFocus={() => setLocalVal("")}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => {
        if (localVal === "" || localVal === null) {
          setLocalVal(null);
          return;
        }
        const parsed = parseInt(localVal, 10);
        let final = isNaN(parsed) ? value : parsed;
        if (min !== undefined) final = Math.max(min, final);
        if (max !== undefined) final = Math.min(max, final);
        onChange(final);
        setLocalVal(null);
      }}
      style={style}
      className={`bg-transparent border-none outline-none text-center
        font-[inherit] text-[inherit] font-[inherit] leading-[inherit] tracking-[inherit]
        hover:bg-black/[0.025] focus:shadow-[0_0_0_2px_var(--color-coral)]
        transition-[background,box-shadow] duration-[0.12s] rounded px-0.5 ${className}`}
    />
  );
}
