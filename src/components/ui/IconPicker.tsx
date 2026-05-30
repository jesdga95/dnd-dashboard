"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useDict } from "@/lib/DictContext";
import { iconMatchesQuery, normalize } from "@/lib/icons";
import { Search, X } from "lucide-react";
import {
  Sword, Swords, Shield, Axe, Crosshair, Target, Bolt, Zap,
  FlaskConical, FlaskRound, Beaker, TestTube, TestTube2, Pill,
  Wand, Wand2, Sparkles, Flame, Star, Bomb,
  Backpack, Package, Package2, Box, Briefcase, Archive, Wallet, Barrel,
  Gem, Key, Lock, Coins, Crown, Skull, Heart, Moon, Sun,
  Book, BookOpen, BookMarked, BookLock, Scroll, ScrollText,
  Map, MapPin, Compass, Telescope, Hourglass, Microscope, Binoculars, Glasses,
  Hammer, Shovel, Wrench, Music,
  Bug, Fish, Feather, Leaf, Flower,
  Diamond, Circle, Square, Triangle, Hexagon,
  GlassWater, Wine, Coffee, Apple, Wheat, Carrot, Beef, Drumstick, Shirt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Combat & Weapons
  Sword, Swords, Shield, Axe, Crosshair, Target, Bolt, Zap, Bomb,
  // Magic
  FlaskConical, FlaskRound, Beaker, TestTube, TestTube2, Pill,
  Wand, Wand2, Sparkles, Flame, Star,
  // Containers & Items
  Backpack, Package, Package2, Box, Briefcase, Archive, Wallet, Barrel,
  // Valuables & Status
  Gem, Key, Lock, Coins, Crown, Skull, Heart, Moon, Sun,
  // Books & Documents
  Book, BookOpen, BookMarked, BookLock, Scroll, ScrollText,
  // Tools & Navigation
  Map, MapPin, Compass, Telescope, Hourglass, Microscope, Binoculars, Glasses,
  Hammer, Shovel, Wrench, Music,
  // Nature
  Bug, Fish, Feather, Leaf, Flower,
  // Shapes
  Diamond, Circle, Square, Triangle, Hexagon,
  // Food & Drink
  GlassWater, Wine, Coffee, Apple, Wheat, Carrot, Beef, Drumstick,
  // Clothing
  Shirt,
};

const ALL_ICON_NAMES = Object.keys(ICON_REGISTRY);

// Humanize "FlaskConical" → "Flask Conical"
function humanize(name: string) {
  return name.replace(/([A-Z])/g, " $1").trim();
}

interface IconPickerProps {
  value: string;
  onChange: (v: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const dict = useDict();
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return ALL_ICON_NAMES;
    return ALL_ICON_NAMES.filter((n) => iconMatchesQuery(n, q));
  }, [query]);

  // Keep the selected icon in view (e.g. editing an item whose icon sits far down the grid).
  // Scoped to the grid container and only when off-screen, so it never scrolls the modal or jumps mid-search.
  useEffect(() => {
    const c = gridRef.current, el = selectedRef.current;
    if (!c || !el) return;
    const cRect = c.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    if (eRect.top < cRect.top || eRect.bottom > cRect.bottom) {
      c.scrollTop += eRect.top - cRect.top - (c.clientHeight - el.clientHeight) / 2;
    }
  }, [value, filtered]);

  return (
    <div className="flex flex-col gap-2">
      {/* Selected preview + search bar */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 flex-shrink-0 rounded-[10px] border border-[var(--color-line)]
          bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-ink-soft)]">
          <InventoryIcon name={value} size={18} />
        </div>
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2
            text-[var(--color-muted)] pointer-events-none" />
          <input
            className="w-full border border-[var(--color-line)] rounded-[10px] bg-[var(--color-bg)]
              pl-[30px] pr-[30px] py-[9px] text-[15px] text-[var(--color-ink)] font-[inherit] outline-none
              focus:border-[var(--color-coral)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(244,123,95,0.15)]
              transition-all duration-150"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.iconPicker.searchPlaceholder}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]
                hover:text-[var(--color-ink)] transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Icon grid */}
      <div ref={gridRef} className="border border-[var(--color-line)] rounded-[10px] bg-[var(--color-bg)]
        p-2 max-h-[168px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-[13px] text-[var(--color-muted)] text-center py-4">
            {dict.iconPicker.noMatch} &quot;{query}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {filtered.map((name) => {
              const Icon = ICON_REGISTRY[name];
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  ref={isSelected ? selectedRef : undefined}
                  title={humanize(name)}
                  onClick={() => onChange(name)}
                  className={`w-full aspect-square rounded-[8px] flex items-center justify-center
                    transition-all duration-100 cursor-pointer
                    ${isSelected
                      ? "bg-[var(--color-coral)] text-white shadow-[0_2px_6px_rgba(244,123,95,0.4)]"
                      : "text-[var(--color-ink-soft)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-ink)]"
                    }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

/** Renders a lucide icon by name, falling back to emoji/text display. */
export function InventoryIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_REGISTRY[name];
  if (Icon) return <Icon size={size} className={className} />;
  // Legacy emoji or plain text fallback
  return <span className="leading-none" style={{ fontSize: size }}>{name || "•"}</span>;
}
