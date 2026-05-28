"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { CharacterSheet } from "@/components/character-sheet/CharacterSheet";
import { SignInScreen } from "@/components/auth/SignInScreen";
import { RoleSelect } from "@/components/auth/RoleSelect";
import { DmDashboard } from "@/components/dm/DmDashboard";

export default function Page() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { role, loading: profileLoading } = useProfile();

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      </div>
    );
  }

  if (!user) return <SignInScreen onSignIn={signIn} />;
  if (role === undefined) return <RoleSelect />;
  if (role === "dm") return <DmDashboard />;
  return <CharacterSheet />;
}
