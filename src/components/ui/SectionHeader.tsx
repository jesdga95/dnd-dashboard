interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({ icon, title, sub, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      {icon}
      <span className="text-[16px] font-extrabold tracking-tight">{title}</span>
      {sub && (
        <span className="text-[13px] font-medium text-[var(--color-muted-soft)]">{sub}</span>
      )}
      {actions && <span className="ml-auto flex gap-1.5">{actions}</span>}
    </div>
  );
}
