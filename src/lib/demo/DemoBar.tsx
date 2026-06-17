"use client";

import { useState, useEffect } from "react";
import { getActiveDemoUid, setActiveDemoUid } from "./auth";
import { resetStore } from "./store";

const OPTIONS = [
  { uid: "demo-dm", label: "DM" },
  { uid: "demo-p1", label: "Lyra" },
  { uid: "demo-p2", label: "Borin" },
];

// Dev-only floating control: switch which seeded user "you" are, or reset the world.
// Open two windows on different identities to watch DM <-> player sync live.
export function DemoBar() {
  const [active, setActive] = useState(OPTIONS[0].uid);

  // Read the persisted identity on mount and keep in sync if another tab switches.
  useEffect(() => {
    const sync = () => setActive(getActiveDemoUid());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const choose = (uid: string) => {
    setActiveDemoUid(uid);
    setActive(uid);
  };

  const reset = () => {
    resetStore();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full border border-line bg-card/95 px-1.5 py-1.5 shadow-lg backdrop-blur">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Demo</span>
      {OPTIONS.map((o) => (
        <button
          key={o.uid}
          onClick={() => choose(o.uid)}
          className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
            active === o.uid ? "bg-ink text-card" : "text-ink hover:bg-bg-warm"
          }`}
        >
          {o.label}
        </button>
      ))}
      <button
        onClick={reset}
        title="Reset demo data to its seeded state"
        className="ml-1 cursor-pointer rounded-full px-2.5 py-1.5 text-[12px] text-muted hover:bg-bg-warm"
      >
        Reset
      </button>
    </div>
  );
}
