"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { DmCombat } from "@/lib/types";

export function usePlayerCombat() {
  const { user } = useAuth();
  const [dmUid, setDmUid] = useState<string | null>(null);
  const [combat, setCombat] = useState<DmCombat | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: find this player's DM via player_dm_links
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state on sign-out
      setDmUid(null);
      setLoading(false);
      return;
    }

    const linkRef = doc(db, "player_dm_links", user.uid);
    const unsubscribe = onSnapshot(
      linkRef,
      (snap) => {
        setDmUid(snap.exists() ? (snap.data().dmUid as string) : null);
      },
      () => setDmUid(null)
    );

    return unsubscribe;
  }, [user]);

  // Step 2: subscribe to that DM's active combat
  useEffect(() => {
    if (!dmUid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state when DM link is absent
      setCombat(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const combatRef = doc(db, "dm_combats", dmUid);
    const unsubscribe = onSnapshot(
      combatRef,
      (snap) => {
        setCombat(snap.exists() ? (snap.data() as DmCombat) : null);
        setLoading(false);
      },
      () => {
        setCombat(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [dmUid]);

  return { combat, dmUid, loading };
}
