"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { usePartyId } from "./usePartyId";
import { useProfile } from "./useProfile";
import { generateId } from "@/lib/utils";
import type { PartyNote } from "@/lib/types";

export function useNotes(opts?: { characterName?: string }) {
  const { user } = useAuth();
  const { partyId } = usePartyId();
  const { role } = useProfile();
  const [myNotes, setMyNotes] = useState<PartyNote[]>([]);
  const [sharedNotes, setSharedNotes] = useState<PartyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const restampedRef = useRef(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "";
  const authorName = role === "dm"
    ? (displayName ? `DM (${displayName})` : "DM")
    : `${opts?.characterName?.trim() || "?"}${displayName ? ` (${displayName})` : ""}`;

  // Subscribe to MY notes (owner can read all — shared and private)
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear subscription state on sign-out
      setMyNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "party_notes"),
      where("ownerId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const notes = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<PartyNote, "id">) }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setMyNotes(notes);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user]);

  // Subscribe to party shared notes
  useEffect(() => {
    if (!partyId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear shared notes when party is absent
      setSharedNotes([]);
      return;
    }
    const q = query(
      collection(db, "party_notes"),
      where("partyId", "==", partyId),
      where("shared", "==", true)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const notes = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<PartyNote, "id">) }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setSharedNotes(notes);
      },
      () => setSharedNotes([])
    );
    return unsub;
  }, [partyId]);

  // Re-stamp partyId on my notes when the player gains/switches a DM
  useEffect(() => {
    if (!user || !partyId) return;
    if (restampedRef.current) return;
    const stale = myNotes.filter((n) => n.partyId !== partyId);
    if (stale.length === 0) return;
    restampedRef.current = true;
    const batch = writeBatch(db);
    stale.forEach((n) =>
      batch.update(doc(db, "party_notes", n.id), { partyId })
    );
    batch.commit().catch(() => {});
  }, [partyId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset restamp guard when partyId changes
  useEffect(() => {
    restampedRef.current = false;
  }, [partyId]);

  // Re-stamp authorName on my notes whenever it resolves to something meaningful
  useEffect(() => {
    if (!user || !authorName || authorName === "Unknown") return;
    const stale = myNotes.filter((n) => n.authorName !== authorName);
    if (stale.length === 0) return;
    const batch = writeBatch(db);
    stale.forEach((n) =>
      batch.update(doc(db, "party_notes", n.id), { authorName })
    );
    batch.commit().catch(() => {});
  }, [authorName, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup debounce timers on unmount
  useEffect(() => {
    const map = debounceRef.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const addNote = async () => {
    if (!user) return;
    const id = String(generateId());
    const now = generateId();
    await setDoc(doc(db, "party_notes", id), {
      ownerId: user.uid,
      partyId: partyId ?? "",
      authorName,
      title: "",
      body: "",
      shared: false,
      createdAt: now,
    });
  };

  const updateNote = (id: string, patch: Partial<Pick<PartyNote, "title" | "body">>) => {
    setMyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
    );
    const map = debounceRef.current;
    const existing = map.get(id);
    if (existing) clearTimeout(existing);
    map.set(
      id,
      setTimeout(() => {
        updateDoc(doc(db, "party_notes", id), patch).catch(() => {});
      }, 300)
    );
  };

  const toggleShare = (id: string, next: boolean) => {
    setMyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, shared: next } : n))
    );
    updateDoc(doc(db, "party_notes", id), {
      shared: next,
      partyId: partyId ?? "",
      authorName,
    }).catch(() => {});
  };

  const deleteNote = (id: string) => {
    const map = debounceRef.current;
    const existing = map.get(id);
    if (existing) clearTimeout(existing);
    map.delete(id);
    deleteDoc(doc(db, "party_notes", id)).catch(() => {});
  };

  const canShare = typeof partyId === "string" && partyId !== "";

  return {
    myNotes,
    sharedNotes,
    loading,
    canShare,
    addNote,
    updateNote,
    toggleShare,
    deleteNote,
    myUid: user?.uid ?? null,
  };
}
