"use client";

import { useAuth } from "@/hooks/useAuth";
import { CharacterSheet } from "@/components/character-sheet/CharacterSheet";
import { SignInScreen } from "@/components/auth/SignInScreen";

export default function Page() {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <SignInScreen onSignIn={signIn} />;
  }

  return <CharacterSheet />;
}
