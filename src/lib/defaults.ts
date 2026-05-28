import type { Character, Spellcasting } from "./types";

export const STORAGE_KEY = "dnd_dashboard";

export const DEFAULT_SPELLCASTING: Spellcasting = {
  ability: "Intelligence",
  slots: {} as Record<number, { max: number; used: number }>,
  spells: [],
};

export const DEFAULT_CHAR: Character = {
  name: "",
  race: "",
  className: "",
  subclass: "",
  background: "",
  alignment: "",
  level: 1,
  ac: null,
  proficiency: null,
  hitDice: "",
  speed: null,
  initiative: null,
  hp: null,
  hpMax: null,
  tempHp: 0,
  deathSaves: 0,
  deathFails: 0,
  gold: null,
  silver: null,
  inspiration: false,
  inCombat: false,
  conditions: [],
  isShared: false,
  abilities: {
    Strength: { score: null },
    Dexterity: { score: null },
    Constitution: { score: null },
    Intelligence: { score: null },
    Wisdom: { score: null },
    Charisma: { score: null },
  },
  traits: [],
  equipment: [],
  combat: {
    attacks: [],
  },
  inventory: [],
  notes: [],
  skills: {},
  spellcasting: DEFAULT_SPELLCASTING,
};
