import type { ButtonHTMLAttributes } from "react";

type BtnVariant = "default" | "dark" | "coral" | "mint" | "ghost";
type BtnSize = "base" | "sm" | "xs";

const variantClasses: Record<BtnVariant, string> = {
  default:
    "bg-[var(--color-card)] text-[var(--color-ink-soft)] border-[var(--color-line)] hover:bg-[var(--color-bg-warm)] hover:border-black/[0.08]",
  dark: "bg-[var(--color-ink)] text-white border-[var(--color-ink)] hover:bg-[#2a2520]",
  coral:
    "bg-gradient-to-b from-[var(--color-coral)] to-[var(--color-coral-deep)] text-white border-transparent shadow-[0_2px_6px_rgba(224,74,58,0.25)] hover:shadow-[0_4px_10px_rgba(224,74,58,0.3)]",
  mint: "bg-[var(--color-mint)] text-[var(--color-mint-deep)] border-transparent hover:bg-[#ddead4]",
  ghost:
    "bg-transparent border-transparent text-[var(--color-muted)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-ink)]",
};

const sizeClasses: Record<BtnSize, string> = {
  base: "px-3 py-[7px] text-[13px]",
  sm: "px-2.5 py-[5px] text-[12px]",
  xs: "px-2 py-[3px] text-[12px]",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  iconOnly?: boolean;
}

export function Btn({
  variant = "default",
  size = "base",
  iconOnly = false,
  className = "",
  children,
  ...props
}: BtnProps) {
  return (
    <button
      {...props}
      className={`
        font-[inherit] font-semibold rounded-full border cursor-pointer
        transition-all duration-150 leading-none inline-flex items-center justify-center gap-1.5
        active:translate-y-px active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:translate-y-0
        ${variantClasses[variant]}
        ${iconOnly ? "w-7 h-7 p-0 rounded-full" : sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
