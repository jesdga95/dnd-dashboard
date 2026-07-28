export type AbilityKey =
  | "Strength"
  | "Dexterity"
  | "Constitution"
  | "Intelligence"
  | "Wisdom"
  | "Charisma";

export interface AbilityScore {
  score: number | null;
  saveProficient?: boolean;
}

export interface Abilities {
  Strength: AbilityScore;
  Dexterity: AbilityScore;
  Constitution: AbilityScore;
  Intelligence: AbilityScore;
  Wisdom: AbilityScore;
  Charisma: AbilityScore;
}

export type AttackType = "melee" | "ranged" | "special";

export interface Attack {
  id: number;
  name: string;
  type: AttackType;
  hit: string;
  dmg: string;
  note: string;
}

export interface Combat {
  attacks: Attack[];
}

export interface EquipmentItem {
  id: number;
  name: string;
  slot: string;
  mod: string;
  desc: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  qty: number | "";
  note: string;
  icon: string;
  checked: boolean;
}

export interface Trait {
  id: number;
  name: string;
  desc: string;
}

export interface PartyNote {
  id: string;
  ownerId: string;
  partyId: string;
  authorName: string;
  title: string;
  body: string;
  shared: boolean;
  createdAt: number;
}

export type SkillProficiency = "none" | "proficient" | "expert";

export type SpellcastingAbility = "Intelligence" | "Wisdom" | "Charisma";

export interface SpellSlot {
  max: number;
  used: number;
}

export interface Spell {
  id: number;
  name: string;
  level: number;
  prepared: boolean;
  concentration: boolean;
  ritual: boolean;
  castTime: string;
  range: string;
  duration: string;
  desc: string;
}

export interface Spellcasting {
  ability: SpellcastingAbility;
  slots: Record<number, SpellSlot>;
  spells: Spell[];
}

export interface CustomResource {
  id: number;
  name: string;
  max: number;
  used: number;
  resetOn: "short" | "long";
}

export interface Character {
  name: string;
  race: string;
  className: string;
  subclass: string;
  background: string;
  alignment: string;
  level: number;
  ac: number | null;
  proficiency: number | null;
  hitDice: string;
  speed: number | null;
  initiative: number | null;
  hp: number | null;
  hpMax: number | null;
  tempHp: number;
  /** Temporary AC modifier (buff/debuff) applied during combat; cleared on a long rest. */
  tempAc?: number;
  deathSaves: number;
  deathFails: number;
  gold: number | null;
  silver: number | null;
  inspiration?: boolean;
  inCombat?: boolean;
  conditions: string[];
  isShared: boolean;
  abilities: Abilities;
  traits: Trait[];
  equipment: EquipmentItem[];
  combat: Combat;
  inventory: InventoryItem[];
  skills: Record<string, SkillProficiency>;
  spellcasting?: Spellcasting;
  customResources?: CustomResource[];
}

export type UserRole = "player" | "dm";

export interface UserProfile {
  role: UserRole;
}

export interface DmParty {
  playerIds: string[];
}

export interface PlayerCombatant {
  type: "player";
  uid: string;
  name: string;
  initiativeRoll: number;
}

/**
 * A player who is at the table but not using the app (offline). The DM tracks
 * their HP/AC/conditions manually, like a monster, but they're an ally so they
 * render as a player and are always visible to the online party.
 */
export interface OfflinePlayerCombatant {
  type: "offline";
  id: string;
  name: string;
  hp: number;
  hpMax: number;
  ac?: number;
  /** Temporary AC modifier (buff/debuff) set by the DM; lives only for this combat. */
  tempAc?: number;
  initiativeRoll: number;
  conditions: string[];
}

export interface MonsterCombatant {
  type: "monster";
  id: string;
  name: string;
  hp: number;
  hpMax: number;
  ac?: number;
  /** Temporary AC modifier (buff/debuff) set by the DM; lives only for this combat. */
  tempAc?: number;
  initiativeRoll: number;
  conditions: string[];
  visibility: 0 | 1 | 2; // 0=hidden, 1=name only, 2=name+stats
  /** Bestiary card this monster was spawned from — lets combat show its stat card. */
  templateId?: string;
}

export type Combatant = PlayerCombatant | MonsterCombatant | OfflinePlayerCombatant;

export interface DmCombat {
  round: number;
  currentTurnIndex: number;
  combatants: Combatant[];
  /** Generated when combat starts; tags damage events so stale ones from a prior combat are ignored. */
  combatId?: string;
  /** undefined ⇒ active. "finished" keeps the doc alive so the party can review the results. */
  status?: "active" | "finished";
  /** How it ended (set on finish): all foes down ⇒ victory, whole party down ⇒ defeat. */
  outcome?: "victory" | "defeat";
  /** Combatant key (uid|id) damage is currently credited to; null ⇒ Unattributed. Pre-filled by the turn. */
  activeAttackerKey?: string | null;
}

/**
 * A reusable monster stat card in the DM's private bestiary
 * (`monster_library/{dmUid}`). Combat spawns copies from these instead of the DM
 * re-typing a stat block every session.
 */
export interface MonsterTemplate {
  id: string;
  name: string;
  /** Max HP a spawned copy starts at. */
  hp: number;
  ac?: number;
  /** Initiative modifier, added to a d20 when the card is dropped into combat. */
  initBonus?: number;
  /** Free-form stat block: attacks, abilities, tactics. Readable during combat. */
  notes?: string;
  createdAt: number;
}

export interface MonsterLibrary {
  monsters: MonsterTemplate[];
}

export type AttackerType = "player" | "monster" | "offline" | "unattributed";

/** Sentinel attacker key used when damage has no clear actor. */
export const UNATTRIBUTED_KEY = "unattributed";

/**
 * A single attribution-tagged damage event, stored at
 * `dm_combats/{dmUid}/events/{autoId}`. Written by the DM (player→monster) and
 * by players (monster→player), since players can't write the combat doc itself.
 */
export interface DamageEvent {
  id: string;
  combatId: string;
  attackerKey: string;
  attackerName: string;
  attackerType: AttackerType;
  targetKey: string;
  targetName: string;
  targetType: "player" | "monster" | "offline";
  /** Positive damage swing entered (healing is never logged). */
  amount: number;
  /** True when this hit dropped the target from >0 to 0 HP — the killing blow. */
  kill?: boolean;
  round: number;
  at: number;
}
