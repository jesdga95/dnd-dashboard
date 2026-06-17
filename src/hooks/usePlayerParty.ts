"use client";

import { useState, useEffect } from "react";
import { db, doc, onSnapshot } from "@/lib/data";
import { DEFAULT_CHAR } from "@/lib/defaults";
import type { Character } from "@/lib/types";

export interface PartyMemberInfo {
  uid: string;
  char: Character;
  loading: boolean;
}

export function usePlayerParty(dmUid: string | null) {
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [partyLoading, setPartyLoading] = useState(true);
  const [members, setMembers] = useState<PartyMemberInfo[]>([]);

  useEffect(() => {
    if (!dmUid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state when DM link is absent
      setPlayerIds([]);
      setPartyLoading(false);
      return;
    }

    setPartyLoading(true);
    const ref = doc(db, "dm_parties", dmUid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setPlayerIds(snap.exists() ? (snap.data().playerIds as string[]) ?? [] : []);
        setPartyLoading(false);
      },
      () => {
        setPlayerIds([]);
        setPartyLoading(false);
      }
    );
    return unsub;
  }, [dmUid]);

  useEffect(() => {
    if (playerIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear member subscriptions when party is empty
      setMembers([]);
      return;
    }

    setMembers(playerIds.map((uid) => ({ uid, char: DEFAULT_CHAR, loading: true })));

    const unsubscribes = playerIds.map((uid) => {
      const ref = doc(db, "characters", uid);
      return onSnapshot(
        ref,
        (snap) => {
          setMembers((prev) =>
            prev.map((m) =>
              m.uid !== uid
                ? m
                : {
                    uid,
                    loading: false,
                    char: snap.exists() ? { ...DEFAULT_CHAR, ...(snap.data() as Character) } : DEFAULT_CHAR,
                  }
            )
          );
        },
        () => {
          setMembers((prev) =>
            prev.map((m) => (m.uid !== uid ? m : { ...m, loading: false }))
          );
        }
      );
    });

    return () => unsubscribes.forEach((u) => u());
  }, [playerIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { members, loading: partyLoading };
}
