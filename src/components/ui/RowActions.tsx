"use client";

import { Pencil, X } from "lucide-react";
import { Btn } from "./Btn";
import { useDict } from "@/lib/DictContext";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function RowActions({ onEdit, onDelete, className = "" }: RowActionsProps) {
  const dict = useDict();
  return (
    <div className={`flex gap-0.5 ${className}`}>
      <Btn variant="default" size="xs" iconOnly onClick={onEdit} aria-label={dict.common.edit}>
        <Pencil size={11} />
      </Btn>
      <Btn variant="default" size="xs" iconOnly
        className="hover:bg-[var(--color-peach)] hover:text-[var(--color-coral-deep)] hover:border-transparent"
        onClick={onDelete} aria-label={dict.common.delete}>
        <X size={11} />
      </Btn>
    </div>
  );
}
