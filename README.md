# D&D Dashboard

A digital D&D 5e character sheet built with Next.js, React, and Firebase. Track everything about your character in one place — abilities, skills, combat, inventory, spellcasting, and more.

## Features

- **Character header** — name, race, class, subclass, background, alignment, level, and key stats (AC, speed, initiative, proficiency bonus, hit dice, passive perception)
- **Auto-derived stats** — ability modifiers, saving throw bonuses, spell save DC, spell attack bonus, and passive perception are all computed from base scores — no manual entry
- **Ability scores** — all six core abilities with read-only computed modifiers and saving throw proficiency toggles
- **Skills** — full skill list with none / proficient / expert proficiency levels, all bonuses derived from ability scores
- **Combat** — attack list with hit bonus, damage, type (melee / ranged / special), and notes
- **Health** — current / max / temp HP tracker, death saving throws
- **Short & Long rest** — rest buttons in the character header; short rest resets only resources tagged as short-rest resources; long rest resets HP to max, all spell slots, death saves, and all resources
- **Equipment** — gear slots with modifiers and descriptions
- **Inventory** — item list with quantity, notes, icons, and check-off
- **Spellcasting** — computed spell save DC and attack bonus, spell slots by level, prepared spells with concentration / ritual flags
- **Traits** — custom trait cards with name and description
- **Notes** — freeform note cards
- **Resources** — custom class resource tracker (ki points, sorcery points, Channel Divinity, etc.) with pip-based usage UI; each resource is tagged S (short rest) or L (long rest) for automatic resets
- **DM party view** — separate Dungeon Master dashboard showing a live party grid; add players by UID and monitor everyone's HP, temp HP, conditions, passive perception, spell save DC, and spell slots in real time
- **DM combat mode** — initiative tracker built into the DM dashboard; requires at least 1 player, 1 monster, and an initiative value for every combatant before starting. DM controls the turn order, adjusts monster HP via pill quick-buttons or custom damage/heal input, manages conditions, and explicitly reveals each monster — players see "????" until revealed. Player rows in the DM combat view show live HP, temp HP, and active conditions
- **Player combat view** — full-screen overlay shown automatically when the DM starts combat; includes the HP hero card (large editable HP, ±1/±5/±10 quick buttons, custom damage/heal input, temp HP row), status conditions, and a live turn-order list. Players can dismiss it and return via a floating "Combat" pill
- **Role selection** — on first sign-in, choose Player or DM; role determines which view is shown
- **Localization** — English and Spanish (`/en`, `/es`)
- **Firebase auth** — Google sign-in; character data persisted per user

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Icons | lucide-react |
| Backend | Firebase (Auth + Firestore) |
| Language | TypeScript |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase setup

Create a Firebase project, enable Google Authentication, and add your config to a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
