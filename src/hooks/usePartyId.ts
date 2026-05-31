"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

// Returns the partyId for the current user.
// null = still loading, "" = player with no DM yet, string = resolved DM uid.
export function usePartyId() {
  const { user } = useAuth();
  const { role } = useProfile();
  const [partyId, setPartyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || role == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset while auth/role is still resolving
      setPartyId(null);
      return;
    }
    if (role === "dm") {
      setPartyId(user.uid);
      return;
    }
    // Player: read player_dm_links/{uid}.dmUid (same pattern as usePlayerCombat)
    const ref = doc(db, "player_dm_links", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => setPartyId(snap.exists() ? (snap.data().dmUid as string) : ""),
      () => setPartyId("")
    );
    return unsub;
  }, [user, role]);

  return { partyId };
}
