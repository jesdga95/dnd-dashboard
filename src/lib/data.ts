"use client";

// Data-access seam. Every hook imports its Firestore/auth primitives from here
// instead of "firebase/firestore" / "@/lib/firebase". In a normal build these are
// the real SDK; when NEXT_PUBLIC_DEMO=1 they are the local fakes in ./demo, which
// makes the whole app run offline against seeded data with live cross-window sync.
// The fakes are cast to the real types so every call site stays fully type-checked.

import * as realFs from "firebase/firestore";
import {
  onAuthStateChanged as realOnAuthStateChanged,
  signInWithPopup as realSignInWithPopup,
  signOut as realSignOut,
  GoogleAuthProvider as RealGoogleAuthProvider,
} from "firebase/auth";
import { auth as realAuth, db as realDb } from "./firebase";

import * as fakeFs from "./demo/store";
import * as fakeAuth from "./demo/auth";

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const fs = (DEMO ? (fakeFs as unknown) : realFs) as typeof realFs;

export const db = (DEMO ? fakeFs.db : realDb) as typeof realDb;
export const {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
} = fs;

export const auth = (DEMO ? fakeAuth.auth : realAuth) as typeof realAuth;
export const onAuthStateChanged = (DEMO ? fakeAuth.onAuthStateChanged : realOnAuthStateChanged) as typeof realOnAuthStateChanged;
export const signInWithPopup = (DEMO ? fakeAuth.signInWithPopup : realSignInWithPopup) as typeof realSignInWithPopup;
export const signOut = (DEMO ? fakeAuth.signOut : realSignOut) as typeof realSignOut;
export const GoogleAuthProvider = (DEMO ? fakeAuth.GoogleAuthProvider : RealGoogleAuthProvider) as typeof RealGoogleAuthProvider;
