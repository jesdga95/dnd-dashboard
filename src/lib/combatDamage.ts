import { addDoc, collection, db } from "@/lib/data";
import { UNATTRIBUTED_KEY } from "@/lib/types";
import type { AttackerType, Combatant, DamageEvent, DmCombat } from "@/lib/types";

/** Stable identity for a combatant: synced players use `uid`, everything else `id`. */
export function combatantKey(c: Combatant): string {
  return c.type === "player" ? c.uid : c.id;
}

export function findCombatant(combat: DmCombat, key: string | null | undefined): Combatant | undefined {
  if (!key) return undefined;
  return combat.combatants.find((c) => combatantKey(c) === key);
}

export interface ResolvedAttacker {
  key: string;
  name: string;
  type: AttackerType;
}

/**
 * Who damage is currently credited to. Reads `activeAttackerKey`; falls back to
 * the Unattributed bucket when it's unset or points at a combatant that's gone.
 */
export function resolveAttacker(combat: DmCombat): ResolvedAttacker {
  const c = findCombatant(combat, combat.activeAttackerKey);
  if (!c) return { key: UNATTRIBUTED_KEY, name: "Unattributed", type: "unattributed" };
  return { key: combatantKey(c), name: c.name, type: c.type };
}

/**
 * Append a damage event to `dm_combats/{dmUid}/events`. Logs only positive
 * damage (healing is ignored) and only while a combat session is active. Used by
 * both the DM (player→monster) and players (monster→player).
 */
export async function writeDamageEvent(
  dmUid: string,
  combat: DmCombat,
  target: { key: string; name: string; type: "player" | "monster" | "offline" },
  amount: number,
): Promise<void> {
  if (amount <= 0 || !combat.combatId) return;
  const attacker = resolveAttacker(combat);
  const event: Omit<DamageEvent, "id"> = {
    combatId: combat.combatId,
    attackerKey: attacker.key,
    attackerName: attacker.name,
    attackerType: attacker.type,
    targetKey: target.key,
    targetName: target.name,
    targetType: target.type,
    amount,
    round: combat.round,
    at: Date.now(),
  };
  await addDoc(collection(db, "dm_combats", dmUid, "events"), event);
}

export interface LeaderboardTarget {
  key: string;
  name: string;
  type: AttackerType;
  amount: number;
}

export interface LeaderboardRow {
  key: string;
  name: string;
  type: AttackerType;
  dealt: number;
  taken: number;
  byTarget: LeaderboardTarget[];
  /** Combatant is no longer in the encounter but still has logged damage. */
  orphan: boolean;
}

/**
 * Roll events up into ranked rows. Current combatants are seeded so participants
 * with no damage still resolve; attackers/targets no longer present (removed,
 * or the Unattributed bucket) are kept so totals never silently vanish.
 */
export function aggregateLeaderboard(events: DamageEvent[], combatants: Combatant[]): LeaderboardRow[] {
  const currentKeys = new Set(combatants.map(combatantKey));
  const rows = new Map<string, LeaderboardRow>();

  const ensure = (key: string, name: string, type: AttackerType): LeaderboardRow => {
    let r = rows.get(key);
    if (!r) {
      r = { key, name, type, dealt: 0, taken: 0, byTarget: [], orphan: false };
      rows.set(key, r);
    } else if (!currentKeys.has(key)) {
      // Keep orphan labels fresh from the latest event we've seen.
      r.name = name;
      r.type = type;
    }
    return r;
  };

  for (const c of combatants) ensure(combatantKey(c), c.name, c.type);

  for (const e of events) {
    const atk = ensure(e.attackerKey, e.attackerName, e.attackerType);
    atk.dealt += e.amount;
    let bt = atk.byTarget.find((t) => t.key === e.targetKey);
    if (!bt) {
      bt = { key: e.targetKey, name: e.targetName, type: e.targetType, amount: 0 };
      atk.byTarget.push(bt);
    }
    bt.amount += e.amount;

    ensure(e.targetKey, e.targetName, e.targetType).taken += e.amount;
  }

  const list = [...rows.values()];
  for (const r of list) {
    r.orphan = !currentKeys.has(r.key) && r.key !== UNATTRIBUTED_KEY;
    r.byTarget.sort((a, b) => b.amount - a.amount);
  }
  list.sort((a, b) => b.dealt - a.dealt || b.taken - a.taken || a.name.localeCompare(b.name));
  return list;
}
