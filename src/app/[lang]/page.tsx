"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { CharacterSheet } from "@/components/character-sheet/CharacterSheet";
import { SignInScreen } from "@/components/auth/SignInScreen";
import { RoleSelect } from "@/components/auth/RoleSelect";
import { DmDashboard } from "@/components/dm/DmDashboard";
import { DEMO } from "@/lib/data";
import { DemoBar } from "@/lib/demo/DemoBar";

export default function Page() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { role, loading: profileLoading } = useProfile();

  let screen;
  if (authLoading || (user && profileLoading)) {
    screen = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
      </div>
    );
  } else if (!user) {
    screen = <SignInScreen onSignIn={signIn} />;
  } else if (role === undefined) {
    screen = <RoleSelect />;
  } else if (role === "dm") {
    screen = <DmDashboard />;
  } else {
    screen = <CharacterSheet />;
  }

  return (
    <>
      {screen}
      {DEMO && <DemoBar />}
    </>
  );
}
