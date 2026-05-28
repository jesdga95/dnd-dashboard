"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { DEFAULT_CHAR } from "@/lib/defaults";
import type { Character } from "@/lib/types";

export interface PartyMember {
  uid: string;
  char: Character;
  loading: boolean;
  error: string | null;
}

export function useDmParty() {
  const { user } = useAuth();
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [partyLoading, setPartyLoading] = useState(true);
  const [members, setMembers] = useState<PartyMember[]>([]);

  // Subscribe to DM's party list
  useEffect(() => {
    if (!user) {
      setPlayerIds([]);
      setPartyLoading(false);
      return;
    }

    setPartyLoading(true);
    const docRef = doc(db, "dm_parties", user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        setPlayerIds(snap.exists() ? (snap.data().playerIds as string[]) ?? [] : []);
        setPartyLoading(false);
      },
      () => {
        setPlayerIds([]);
        setPartyLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Subscribe to each player's character doc
  useEffect(() => {
    if (playerIds.length === 0) {
      setMembers([]);
      return;
    }

    setMembers(playerIds.map((uid) => ({ uid, char: DEFAULT_CHAR, loading: true, error: null })));

    const unsubscribes = playerIds.map((uid) => {
      const docRef = doc(db, "characters", uid);
      return onSnapshot(
        docRef,
        (snap) => {
          setMembers((prev) =>
            prev.map((m) =>
              m.uid !== uid
                ? m
                : {
                    uid,
                    loading: false,
                    error: snap.exists() ? null : "not_found",
                    char: snap.exists() ? { ...DEFAULT_CHAR, ...(snap.data() as Character) } : DEFAULT_CHAR,
                  }
            )
          );
        },
        () => {
          setMembers((prev) =>
            prev.map((m) =>
              m.uid !== uid ? m : { ...m, loading: false, error: "access_denied" }
            )
          );
        }
      );
    });

    return () => unsubscribes.forEach((u) => u());
  }, [playerIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPlayer = async (uid: string) => {
    if (!user || !uid.trim() || playerIds.includes(uid.trim())) return;
    const trimmed = uid.trim();
    const docRef = doc(db, "dm_parties", user.uid);
    await setDoc(docRef, { playerIds: arrayUnion(trimmed) }, { merge: true });
    await setDoc(doc(db, "player_dm_links", trimmed), { dmUid: user.uid });
  };

  const removePlayer = async (uid: string) => {
    if (!user) return;
    const docRef = doc(db, "dm_parties", user.uid);
    await updateDoc(docRef, { playerIds: arrayRemove(uid) });
    await deleteDoc(doc(db, "player_dm_links", uid)).catch(() => {});
  };

  return { playerIds, partyLoading, members, addPlayer, removePlayer };
}
