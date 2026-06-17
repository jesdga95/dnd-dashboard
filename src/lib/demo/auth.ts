"use client";

// A fake auth provider for demo mode. "Who am I" is just an entry in localStorage,
// switched by the DemoBar. onAuthStateChanged re-fires on switches (same tab via a
// custom event, other tabs via the storage event) so the app re-routes between the
// DM and player views exactly as a real sign-in would. Only used when NEXT_PUBLIC_DEMO=1.

import type { User } from "firebase/auth";

export type AuthUser = Pick<User, "uid" | "displayName" | "email">;

const ACTIVE_KEY = "demo:activeUid";
const IDENTITY_EVENT = "demo:identity";
const DEFAULT_UID = "demo-dm";

const USERS: Record<string, { displayName: string; email: string }> = {
  "demo-dm": { displayName: "Game Master", email: "dm@demo.local" },
  "demo-p1": { displayName: "Lyra", email: "lyra@demo.local" },
  "demo-p2": { displayName: "Borin", email: "borin@demo.local" },
};

export function getActiveDemoUid(): string {
  if (typeof window === "undefined") return DEFAULT_UID;
  return localStorage.getItem(ACTIVE_KEY) ?? DEFAULT_UID;
}

export function setActiveDemoUid(uid: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, uid);
  // storage events only reach *other* tabs, so nudge this tab's listeners directly.
  window.dispatchEvent(new Event(IDENTITY_EVENT));
}

function currentUser(): AuthUser | null {
  const uid = getActiveDemoUid();
  const info = USERS[uid];
  return info ? { uid, displayName: info.displayName, email: info.email } : null;
}

export const auth = { __demo: true as const };

export function onAuthStateChanged(_auth: unknown, cb: (user: AuthUser | null) => void): () => void {
  const fire = () => cb(currentUser());
  queueMicrotask(fire);
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === ACTIVE_KEY) fire();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(IDENTITY_EVENT, fire);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(IDENTITY_EVENT, fire);
  };
}

// In demo mode identity is chosen via the DemoBar, so popup sign-in is a no-op and
// sign-out is intentionally inert (there is no real sign-in screen to return to).
export async function signInWithPopup(): Promise<void> {}
export async function signOut(): Promise<void> {}
export class GoogleAuthProvider {}
