import type { Character } from "./types";

const abilityMod = (score: number | null): string => {
  if (score === null) return "—";
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

const SKILL_ABILITY: Record<string, string> = {
  Acrobatics: "Dexterity",
  "Animal Handling": "Wisdom",
  Arcana: "Intelligence",
  Athletics: "Strength",
  Deception: "Charisma",
  History: "Intelligence",
  Insight: "Wisdom",
  Intimidation: "Charisma",
  Investigation: "Intelligence",
  Medicine: "Wisdom",
  Nature: "Intelligence",
  Perception: "Wisdom",
  Performance: "Charisma",
  Persuasion: "Charisma",
  Religion: "Intelligence",
  "Sleight of Hand": "Dexterity",
  Stealth: "Dexterity",
  Survival: "Wisdom",
};

export function charToMarkdown(char: Character): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${char.name}`);
  const parts = [
    `Level ${char.level}`,
    char.race,
    char.subclass ? `${char.className} (${char.subclass})` : char.className,
    char.background,
    char.alignment,
  ].filter(Boolean);
  lines.push(parts.join(" · "));
  lines.push("");

  // Combat stats
  lines.push("---");
  lines.push("");
  lines.push("## Combat Stats");
  lines.push("");
  lines.push("| HP | Max HP | Temp HP | AC | Initiative | Speed | Hit Dice | Proficiency |");
  lines.push("|---|---|---|---|---|---|---|---|");
  const ini = char.initiative != null ? (char.initiative >= 0 ? `+${char.initiative}` : `${char.initiative}`) : "—";
  lines.push(`| ${char.hp ?? "—"} | ${char.hpMax ?? "—"} | ${char.tempHp || 0} | ${char.ac ?? "—"} | ${ini} | ${char.speed ?? "—"} | ${char.hitDice || "—"} | ${char.proficiency != null ? `+${char.proficiency}` : "—"} |`);
  lines.push("");

  if (char.deathSaves > 0 || char.deathFails > 0) {
    const suc = "✓".repeat(char.deathSaves) + "☐".repeat(Math.max(0, 3 - char.deathSaves));
    const fail = "✗".repeat(char.deathFails) + "☐".repeat(Math.max(0, 3 - char.deathFails));
    lines.push(`**Death Saves:** ${suc} | **Death Fails:** ${fail}`);
    lines.push("");
  }

  if (char.gold != null || char.silver != null) {
    lines.push(`**Gold:** ${char.gold ?? 0} | **Silver:** ${char.silver ?? 0}`);
    lines.push("");
  }

  // Ability scores
  lines.push("---");
  lines.push("");
  lines.push("## Ability Scores");
  lines.push("");
  lines.push("| Ability | Score | Modifier | Save |");
  lines.push("|---|---|---|---|");
  for (const [ability, data] of Object.entries(char.abilities)) {
    lines.push(`| ${ability} | ${data.score ?? "—"} | ${abilityMod(data.score)} | ${data.saveProficient ? "✓" : "—"} |`);
  }
  lines.push("");

  // Skills
  const proficientSkills = Object.entries(char.skills ?? {}).filter(([, p]) => p !== "none");
  if (proficientSkills.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Skills");
    lines.push("");
    lines.push("| Skill | Ability | Bonus | Proficiency |");
    lines.push("|---|---|---|---|");
    const prof = char.proficiency ?? 0;
    for (const [skill, skillProf] of proficientSkills) {
      const abilityKey = SKILL_ABILITY[skill];
      const score = abilityKey ? (char.abilities[abilityKey as keyof typeof char.abilities]?.score ?? null) : null;
      const baseMod = score != null ? Math.floor((score - 10) / 2) : 0;
      const bonus = baseMod + (skillProf === "expert" ? prof * 2 : prof);
      const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
      lines.push(`| ${skill} | ${abilityKey ?? "—"} | ${bonusStr} | ${skillProf === "expert" ? "Expertise" : "Proficient"} |`);
    }
    lines.push("");
  }

  // Attacks
  if (char.combat?.attacks?.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Attacks");
    lines.push("");
    lines.push("| Name | Type | Hit | Damage | Notes |");
    lines.push("|---|---|---|---|---|");
    for (const atk of char.combat.attacks) {
      lines.push(`| ${atk.name} | ${atk.type} | ${atk.hit} | ${atk.dmg} | ${atk.note} |`);
    }
    lines.push("");
  }

  // Equipment
  if (char.equipment?.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Equipment");
    lines.push("");
    lines.push("| Name | Slot | Modifier | Description |");
    lines.push("|---|---|---|---|");
    for (const eq of char.equipment) {
      lines.push(`| ${eq.name} | ${eq.slot} | ${eq.mod} | ${eq.desc} |`);
    }
    lines.push("");
  }

  // Spellcasting
  const sc = char.spellcasting;
  if (sc && (sc.spells?.length > 0 || Object.keys(sc.slots ?? {}).length > 0)) {
    lines.push("---");
    lines.push("");
    lines.push("## Spellcasting");
    lines.push("");
    lines.push(`**Spellcasting Ability:** ${sc.ability}`);
    const abilityScore = char.abilities[sc.ability]?.score ?? null;
    if (abilityScore != null && char.proficiency != null) {
      const mod = Math.floor((abilityScore - 10) / 2);
      const dc = 8 + char.proficiency + mod;
      const atk = char.proficiency + mod;
      lines.push(`**Spell Save DC:** ${dc} | **Spell Attack:** +${atk}`);
    }
    lines.push("");

    const slots = Object.entries(sc.slots ?? {}).sort(([a], [b]) => Number(a) - Number(b));
    if (slots.length > 0) {
      lines.push("### Spell Slots");
      lines.push("");
      lines.push("| Level | Max | Used | Remaining |");
      lines.push("|---|---|---|---|");
      for (const [lvl, slot] of slots) {
        lines.push(`| ${lvl} | ${slot.max} | ${slot.used} | ${slot.max - slot.used} |`);
      }
      lines.push("");
    }

    if (sc.spells?.length > 0) {
      lines.push("### Spells");
      lines.push("");
      lines.push("| Name | Level | Prepared | Conc. | Ritual | Cast Time | Range | Duration |");
      lines.push("|---|---|---|---|---|---|---|---|");
      const sorted = [...sc.spells].sort((a, b) => a.level - b.level);
      for (const spell of sorted) {
        const lvlLabel = spell.level === 0 ? "Cantrip" : `${spell.level}`;
        lines.push(`| ${spell.name} | ${lvlLabel} | ${spell.prepared ? "✓" : "—"} | ${spell.concentration ? "✓" : "—"} | ${spell.ritual ? "✓" : "—"} | ${spell.castTime} | ${spell.range} | ${spell.duration} |`);
      }
      lines.push("");

      const withDesc = sorted.filter((s) => s.desc?.trim());
      if (withDesc.length > 0) {
        lines.push("#### Spell Descriptions");
        lines.push("");
        for (const spell of withDesc) {
          const lvlLabel = spell.level === 0 ? "Cantrip" : `Level ${spell.level}`;
          lines.push(`**${spell.name}** _(${lvlLabel})_`);
          lines.push("");
          lines.push(spell.desc);
          lines.push("");
        }
      }
    }
  }

  // Custom Resources
  const resources = char.customResources ?? [];
  if (resources.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Resources");
    lines.push("");
    lines.push("| Name | Used | Max | Resets On |");
    lines.push("|---|---|---|---|");
    for (const res of resources) {
      lines.push(`| ${res.name} | ${res.used} | ${res.max} | ${res.resetOn === "short" ? "Short Rest" : "Long Rest"} |`);
    }
    lines.push("");
  }

  // Traits
  if (char.traits?.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Traits & Features");
    lines.push("");
    for (const trait of char.traits) {
      lines.push(`### ${trait.name}`);
      lines.push("");
      if (trait.desc?.trim()) lines.push(trait.desc);
      lines.push("");
    }
  }

  // Inventory
  if (char.inventory?.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Inventory");
    lines.push("");
    lines.push("| Item | Qty | Notes |");
    lines.push("|---|---|---|");
    for (const item of char.inventory) {
      const name = item.checked ? `~~${item.name}~~` : item.name;
      lines.push(`| ${name} | ${item.qty || "—"} | ${item.note || "—"} |`);
    }
    lines.push("");
  }

  // Notes
  if (char.notes?.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Notes");
    lines.push("");
    for (const note of char.notes) {
      lines.push(`### ${note.title}`);
      lines.push("");
      if (note.body?.trim()) lines.push(note.body);
      lines.push("");
    }
  }

  return lines.join("\n");
}
