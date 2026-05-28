export function abilityMod(score: number): { val: number; str: string } {
  const val = Math.floor((score - 10) / 2);
  return { val, str: val >= 0 ? `+${val}` : `${val}` };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}
