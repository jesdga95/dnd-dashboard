import type { Character, Spellcasting } from "./types";

export const STORAGE_KEY = "dnd_dashboard";

export const DEFAULT_SPELLCASTING: Spellcasting = {
  ability: "Intelligence",
  saveDC: null,
  attackBonus: null,
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
  abilities: {
    Strength: { score: null, mod: null },
    Dexterity: { score: null, mod: null },
    Constitution: { score: null, mod: null },
    Intelligence: { score: null, mod: null },
    Wisdom: { score: null, mod: null },
    Charisma: { score: null, mod: null },
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
