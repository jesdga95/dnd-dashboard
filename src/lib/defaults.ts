import type { Character, Spellcasting } from "./types";

export const STORAGE_KEY = "dnd_dashboard";

export const DEFAULT_SPELLCASTING: Spellcasting = {
  ability: "Intelligence",
  saveDC: 0,
  attackBonus: 0,
  slots: Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [l, { max: 0, used: 0 }])
  ) as Record<number, { max: number; used: number }>,
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
  ac: 0,
  proficiency: 0,
  hitDice: "",
  speed: 0,
  initiative: 0,
  hp: 0,
  hpMax: 0,
  tempHp: 0,
  deathSaves: 0,
  deathFails: 0,
  gold: 0,
  silver: 0,
  inspiration: false,
  abilities: {
    Strength: { score: 0, mod: 0 },
    Dexterity: { score: 0, mod: 0 },
    Constitution: { score: 0, mod: 0 },
    Intelligence: { score: 0, mod: 0 },
    Wisdom: { score: 0, mod: 0 },
    Charisma: { score: 0, mod: 0 },
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
