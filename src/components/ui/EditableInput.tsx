"use client";

interface EditableInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  dark?: boolean;
}

export function EditableInput({
  value,
  onChange,
  className = "",
  style,
  placeholder,
  dark = false,
}: EditableInputProps) {
  const focusCls = dark
    ? "hover:bg-white/[0.06] focus:bg-white/10 focus:shadow-[0_0_0_2px_var(--color-coral)]"
    : "hover:bg-black/[0.025] focus:bg-white focus:shadow-[0_0_0_2px_var(--color-coral)]";
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
      className={`bg-transparent border-none outline-none w-full rounded px-0.5 py-0
        font-[inherit] text-[inherit] font-[inherit] leading-[inherit] tracking-[inherit]
        ${focusCls} transition-[background,box-shadow] duration-[0.12s] ${className}`}
    />
  );
}
