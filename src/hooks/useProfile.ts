"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { UserRole } from "@/lib/types";

export function useProfile() {
  const { user } = useAuth();
  // undefined = no profile doc yet (show role select); null = loading
  const [role, setRole] = useState<UserRole | undefined | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state on sign-out
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "profiles", user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        setRole(snap.exists() ? (snap.data().role as UserRole) : undefined);
        setLoading(false);
      },
      () => {
        setRole(undefined);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const chooseRole = async (r: UserRole) => {
    if (!user) return;
    await setDoc(doc(db, "profiles", user.uid), { role: r });
  };

  const resetProfile = async (currentRole: UserRole | undefined) => {
    if (!user) return;
    await deleteDoc(doc(db, "profiles", user.uid));
    if (currentRole === "player") {
      await deleteDoc(doc(db, "characters", user.uid)).catch(() => {});
    } else if (currentRole === "dm") {
      await deleteDoc(doc(db, "dm_parties", user.uid)).catch(() => {});
      await deleteDoc(doc(db, "dm_combats", user.uid)).catch(() => {});
    }
  };

  return { role, loading, chooseRole, resetProfile };
}
