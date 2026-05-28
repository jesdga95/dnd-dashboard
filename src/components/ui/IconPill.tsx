type Tint = "mint" | "peach" | "blue" | "lavender" | "sand";

const tintClasses: Record<Tint, string> = {
  mint: "bg-[var(--color-mint)] text-[var(--color-mint-deep)]",
  peach: "bg-[var(--color-peach)] text-[var(--color-peach-deep)]",
  blue: "bg-[var(--color-blue)] text-[var(--color-blue-deep)]",
  lavender: "bg-[var(--color-lavender)] text-[var(--color-lavender-deep)]",
  sand: "bg-[var(--color-sand)] text-[var(--color-sand-deep)]",
};

export function IconPill({
  tint,
  children,
}: {
  tint: Tint;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`w-[30px] h-[30px] rounded-[10px] inline-flex items-center justify-center flex-shrink-0 ${tintClasses[tint]}`}
    >
      {children}
    </span>
  );
}
