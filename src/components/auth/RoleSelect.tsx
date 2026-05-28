"use client";

import { useState } from "react";
import { Swords, Shield } from "lucide-react";
import { useDict } from "@/lib/DictContext";
import { useProfile } from "@/hooks/useProfile";
import type { UserRole } from "@/lib/types";

export function RoleSelect() {
  const dict = useDict();
  const { chooseRole } = useProfile();
  const [pending, setPending] = useState<UserRole | null>(null);

  const handleChoose = async (role: UserRole) => {
    setPending(role);
    await chooseRole(role);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse 800px 500px at 80% 0%, #f0e6d8 0%, transparent 60%), radial-gradient(ellipse 800px 500px at 0% 100%, #e8dfd2 0%, transparent 60%), #f4f1ec",
      }}
    >
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-extrabold text-ink tracking-tight">{dict.roleSelect.title}</h1>
          <p className="text-[13px] text-muted mt-1">{dict.roleSelect.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-[400px]:grid-cols-1">
          <RoleCard
            icon={<Shield size={32} strokeWidth={1.25} className="text-muted" />}
            title={dict.roleSelect.playerTitle}
            desc={dict.roleSelect.playerDesc}
            loading={pending === "player"}
            disabled={pending !== null}
            onClick={() => handleChoose("player")}
          />
          <RoleCard
            icon={<Swords size={32} strokeWidth={1.25} className="text-muted" />}
            title={dict.roleSelect.dmTitle}
            desc={dict.roleSelect.dmDesc}
            loading={pending === "dm"}
            disabled={pending !== null}
            onClick={() => handleChoose("dm")}
          />
        </div>

        <p className="text-center text-[11px] text-muted mt-5 opacity-60">{dict.roleSelect.warning}</p>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  desc,
  loading,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-card border border-line rounded-2xl p-7 flex flex-col items-center gap-4
        text-center cursor-pointer transition-all duration-150
        hover:shadow-md hover:border-[var(--color-muted-soft)] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      ) : (
        icon
      )}
      <div>
        <div className="text-[15px] font-bold text-ink">{title}</div>
        <div className="text-[12px] text-muted mt-1 leading-relaxed">{desc}</div>
      </div>
    </button>
  );
}
