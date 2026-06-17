"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DamageEvent } from "@/lib/types";

/**
 * Live damage log for a combat. Subscribes to `dm_combats/{dmUid}/events` and
 * keeps only the current `combatId` (so leftovers from a prior combat never leak
 * into the leaderboard). The DM passes its own uid; players pass their DM's uid.
 */
export function useCombatEvents(
  dmUid: string | null | undefined,
  combatId: string | null | undefined,
): DamageEvent[] {
  const [events, setEvents] = useState<DamageEvent[]>([]);

  useEffect(() => {
    if (!dmUid || !combatId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear when there's no active combat
      setEvents([]);
      return;
    }

    const col = collection(db, "dm_combats", dmUid, "events");
    const unsubscribe = onSnapshot(
      col,
      (snap) => {
        const list: DamageEvent[] = [];
        snap.forEach((d) => {
          const data = d.data() as Omit<DamageEvent, "id">;
          if (data.combatId === combatId) list.push({ ...data, id: d.id });
        });
        list.sort((a, b) => a.at - b.at);
        setEvents(list);
      },
      () => setEvents([]),
    );

    return unsubscribe;
  }, [dmUid, combatId]);

  return events;
}
