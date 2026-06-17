import { DEFAULT_CHAR } from "../defaults";
import type { Character, DmCombat, PartyNote } from "../types";

// A path-keyed snapshot of the whole fake datastore: "collection/id" -> document data.
export type Store = Record<string, Record<string, unknown>>;

function char(overrides: Partial<Character>): Character {
  return { ...DEFAULT_CHAR, ...overrides };
}

// Builds a coherent demo world: one DM, two players (each with a fleshed-out
// sheet), the party wiring, an active combat, and a shared note — so every view
// is exercisable the moment the demo loads.
export function seedData(): Store {
  const lyra = char({
    name: "Lyra Meadowlight",
    race: "Half-Elf",
    className: "Bard",
    subclass: "College of Lore",
    background: "Entertainer",
    alignment: "Chaotic Good",
    level: 5,
    ac: 15,
    proficiency: 3,
    hitDice: "5d8",
    speed: 30,
    initiative: 3,
    hp: 26,
    hpMax: 38,
    gold: 74,
    silver: 12,
    inspiration: true,
    isShared: true,
    abilities: {
      Strength: { score: 8 },
      Dexterity: { score: 16, saveProficient: true },
      Constitution: { score: 14 },
      Intelligence: { score: 12 },
      Wisdom: { score: 10 },
      Charisma: { score: 18, saveProficient: true },
    },
    skills: { Persuasion: "expert", Deception: "proficient", Perception: "proficient" },
    spellcasting: {
      ability: "Charisma",
      slots: { 1: { max: 4, used: 1 }, 2: { max: 3, used: 0 }, 3: { max: 2, used: 0 } },
      spells: [
        { id: 1, name: "Vicious Mockery", level: 0, prepared: true, concentration: false, ritual: false, castTime: "1 action", range: "60 ft", duration: "Instant", desc: "1d4 psychic, disadvantage on next attack." },
        { id: 2, name: "Healing Word", level: 1, prepared: true, concentration: false, ritual: false, castTime: "1 bonus action", range: "60 ft", duration: "Instant", desc: "Heal 1d4 + mod at a distance." },
        { id: 3, name: "Hypnotic Pattern", level: 3, prepared: true, concentration: true, ritual: false, castTime: "1 action", range: "120 ft", duration: "1 min", desc: "Charm creatures in a 30-ft cube." },
      ],
    },
  });

  const borin = char({
    name: "Borin Stonefist",
    race: "Mountain Dwarf",
    className: "Fighter",
    subclass: "Battle Master",
    background: "Soldier",
    alignment: "Lawful Good",
    level: 5,
    ac: 18,
    proficiency: 3,
    hitDice: "5d10",
    speed: 25,
    initiative: 1,
    hp: 44,
    hpMax: 49,
    gold: 31,
    silver: 8,
    isShared: true,
    abilities: {
      Strength: { score: 17, saveProficient: true },
      Dexterity: { score: 12 },
      Constitution: { score: 16, saveProficient: true },
      Intelligence: { score: 10 },
      Wisdom: { score: 13 },
      Charisma: { score: 8 },
    },
    skills: { Athletics: "proficient", Intimidation: "proficient" },
    combat: {
      attacks: [
        { id: 1, name: "Warhammer", type: "melee", hit: "+6", dmg: "1d8+3", note: "Versatile (1d10)" },
        { id: 2, name: "Handaxe", type: "ranged", hit: "+6", dmg: "1d6+3", note: "Thrown 20/60" },
      ],
    },
  });

  const combat: DmCombat = {
    round: 1,
    currentTurnIndex: 0,
    combatId: "demo-combat-1",
    status: "active",
    activeAttackerKey: "demo-p1",
    combatants: [
      { type: "player", uid: "demo-p1", name: "Lyra", initiativeRoll: 18 },
      { type: "monster", id: "m1", name: "Goblin Boss", hp: 21, hpMax: 21, ac: 17, initiativeRoll: 15, conditions: [], visibility: 2 },
      { type: "player", uid: "demo-p2", name: "Borin", initiativeRoll: 12 },
      { type: "monster", id: "m2", name: "Hidden Lurker", hp: 11, hpMax: 11, ac: 14, initiativeRoll: 9, conditions: [], visibility: 0 },
    ],
  };

  const note: Omit<PartyNote, "id"> = {
    ownerId: "demo-dm",
    partyId: "demo-dm",
    authorName: "DM (Game Master)",
    title: "The Sunless Citadel",
    body: "The party descends into the ravine. A twisted, leafless tree grows at the bottom — its branches bearing a single glowing apple.",
    shared: true,
    createdAt: 1700000000000,
  };

  return {
    "profiles/demo-dm": { role: "dm" },
    "profiles/demo-p1": { role: "player" },
    "profiles/demo-p2": { role: "player" },
    "characters/demo-p1": lyra,
    "characters/demo-p2": borin,
    "dm_parties/demo-dm": { playerIds: ["demo-p1", "demo-p2"] },
    "player_dm_links/demo-p1": { dmUid: "demo-dm" },
    "player_dm_links/demo-p2": { dmUid: "demo-dm" },
    "dm_combats/demo-dm": combat,
    "party_notes/demo-note-1": note,
  } as unknown as Store;
}
