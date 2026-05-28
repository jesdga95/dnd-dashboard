export type AbilityKey =
  | "Strength"
  | "Dexterity"
  | "Constitution"
  | "Intelligence"
  | "Wisdom"
  | "Charisma";

export interface AbilityScore {
  score: number | null;
  mod: number | null;
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

export interface Note {
  id: number;
  title: string;
  body: string;
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
  saveDC: number | null;
  attackBonus: number | null;
  slots: Record<number, SpellSlot>;
  spells: Spell[];
}

export interface CustomResource {
  id: number;
  name: string;
  max: number;
  used: number;
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
  notes: Note[];
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
