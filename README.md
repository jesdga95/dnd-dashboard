# D&D Dashboard

A digital D&D 5e character sheet built with Next.js, React, and Firebase. Track everything about your character in one place — abilities, skills, combat, inventory, spellcasting, and more.

## Features

- **Character header** — name, race, class, subclass, background, alignment, level, and key stats (AC, speed, initiative, proficiency bonus, hit dice)
- **Ability scores** — all six core abilities with modifiers and saving throw proficiency
- **Skills** — full skill list with none / proficient / expert proficiency levels
- **Combat** — attack list with hit bonus, damage, type (melee / ranged / special), and notes
- **Health** — current / max / temp HP tracker, death saving throws
- **Equipment** — gear slots with modifiers and descriptions
- **Inventory** — item list with quantity, notes, icons, and check-off
- **Spellcasting** — spell save DC, attack bonus, spell slots by level, prepared spells with concentration / ritual flags
- **Traits** — custom trait cards with name and description
- **Notes** — freeform note cards
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
