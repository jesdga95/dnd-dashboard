"use client";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Btn } from "./Btn";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      setMounted(false);
    };
  }, [onClose]);

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center max-[600px]:items-end
        p-5 max-[600px]:p-0 bg-[rgba(20,15,10,0.45)] backdrop-blur-[6px]"
      onClick={onClose}
      style={{ animation: "fadeIn 0.15s ease-out" }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUpFull { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        className="w-full max-w-[460px] max-h-[85vh] overflow-y-auto
          bg-[var(--color-card)] rounded-[22px] max-[600px]:rounded-b-none
          p-[22px_22px_20px] max-[600px]:p-[20px_20px_36px]
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        style={{ animation: "slideUp 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[18px] font-extrabold tracking-tight mb-[14px]">{title}</div>
        <div className="grid gap-3">{children}</div>
        <div className="flex justify-end gap-2 mt-[18px]">{footer}</div>
      </div>
    </div>,
    document.body
  );
}

// Reusable form field wrapper
export function ModalField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--color-muted)] tracking-[0.04em] mb-[5px]">
        {label}
      </label>
      {children}
    </div>
  );
}

// Reusable modal input
export function ModalInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
}) {
  return (
    <input
      className="w-full border border-[var(--color-line)] rounded-[10px] bg-[var(--color-bg)]
        px-3 py-[9px] text-[15px] text-[var(--color-ink)] font-[inherit] outline-none
        focus:border-[var(--color-coral)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(244,123,95,0.15)]
        transition-all duration-150"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      maxLength={maxLength}
    />
  );
}

export function ModalTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <textarea
      className="w-full border border-[var(--color-line)] rounded-[10px] bg-[var(--color-bg)]
        px-3 py-[9px] text-[15px] text-[var(--color-ink)] font-[inherit] outline-none
        resize-y min-h-[64px] leading-[1.4]
        focus:border-[var(--color-coral)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(244,123,95,0.15)]
        transition-all duration-150"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}

export function ModalBtn({
  onClick,
  variant = "default",
  disabled,
  children,
}: {
  onClick: () => void;
  variant?: "default" | "dark";
  /** Greys out Save until the form has the minimum a row needs to be useful. */
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Btn variant={variant} size="base" onClick={onClick} disabled={disabled}>
      {children}
    </Btn>
  );
}
