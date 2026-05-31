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
  initiativeRoll: number;
  conditions: string[];
  visibility: 0 | 1 | 2; // 0=hidden, 1=name only, 2=name+stats
}

export type Combatant = PlayerCombatant | MonsterCombatant | OfflinePlayerCombatant;

export interface DmCombat {
  round: number;
  currentTurnIndex: number;
  combatants: Combatant[];
}
