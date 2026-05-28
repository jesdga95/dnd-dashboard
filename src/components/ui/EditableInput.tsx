"use client";

import { useEffect, useRef, useState } from "react";

interface EditableInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  dark?: boolean;
  asDiv?: boolean;
}

const DASH = "–";

export function EditableInput({
  value,
  onChange,
  className = "",
  style,
  placeholder,
  dark = false,
  asDiv = false,
}: EditableInputProps) {
  const focusCls = dark
    ? "hover:bg-white/[0.06] focus:bg-white/10 focus:shadow-[0_0_0_2px_var(--color-coral)]"
    : "hover:bg-black/[0.025] focus:bg-white focus:shadow-[0_0_0_2px_var(--color-coral)]";

  const divRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);
  const [localVal, setLocalVal] = useState<string | null>(null);

  const isEmpty = value === "";
  const emptyOutline = isEmpty
    ? "[outline:1.5px_dashed_rgba(128,128,128,0.4)]"
    : "outline-none";

  // Sync external value to the div; show DASH when empty.
  useEffect(() => {
    if (divRef.current && !focusedRef.current) {
      const display = isEmpty ? DASH : value;
      if (divRef.current.textContent !== display) {
        divRef.current.textContent = display;
      }
    }
  }, [value, isEmpty]);

  const sharedCls = `rounded px-0.5 bg-transparent border-none
    font-[inherit] text-[inherit] leading-[inherit] tracking-[inherit]
    ${focusCls} ${emptyOutline} transition-[background,box-shadow] duration-[0.12s] ${className}`;

  if (asDiv) {
    return (
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={(e) => {
          focusedRef.current = true;
          e.currentTarget.textContent = "";
        }}
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
        onInput={(e) => {
          const text = (e.currentTarget.textContent ?? "").replace(/[\r\n]/g, "");
          onChange(text);
        }}
        onBlur={(e) => {
          focusedRef.current = false;
          if (!e.currentTarget.textContent) {
            e.currentTarget.textContent = isEmpty ? DASH : value;
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain").replace(/[\r\n]/g, "");
          document.execCommand("insertText", false, text);
        }}
        data-placeholder={placeholder}
        style={style}
        className={`w-full ${sharedCls}
          empty:before:content-[attr(data-placeholder)] empty:before:text-white/30`}
      />
    );
  }

  const displayVal = localVal !== null ? localVal : (isEmpty ? DASH : value);

  return (
    <input
      type="text"
      value={displayVal}
      onFocus={() => setLocalVal("")}
      onChange={(e) => { setLocalVal(e.target.value); onChange(e.target.value); }}
      onBlur={() => setLocalVal(null)}
      placeholder={placeholder}
      style={style}
      className={`w-full py-0 ${sharedCls}`}
    />
  );
}
