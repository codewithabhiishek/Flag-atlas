<div align="center">

<img src="https://flagcdn.com/w80/un.svg" width="60" alt="Flag Atlas" />

# 🌍 FlagAtlas

### Learn the world's flags through a premium, gamified experience.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[**Live Demo**](https://github.com/codewithabhiishek/Flag-atlas) · [**Report Bug**](https://github.com/codewithabhiishek/Flag-atlas/issues) · [**Request Feature**](https://github.com/codewithabhiishek/Flag-atlas/issues)

</div>

---

## ✨ What is FlagAtlas?

**FlagAtlas** is a beautiful, fully offline-capable web app that helps you master the flags of every nation on Earth. Across **195 countries** and **6 continental regions**, it combines multiple study modes, spaced-repetition science, XP-based progression, and a living world map — all persisted locally in your browser. No account required to start learning.

> _Every territory on the Atlas fills with colour as you conquer its flag._

---

## 🎮 Game Modes

| Mode | How it works |
|---|---|
| 🔮 **Fragments** | A blurry flag clears with every wrong guess. Identify it before three misses. |
| ⚡ **Speed Run** | 45 seconds. Answer as many flags as you can. Combos multiply your score. |
| 👁️ **Recall** | Country name shown first. Visualise the flag in your mind, then reveal to self-assess. |
| 🎨 **Flag Builder** | Pick colours in order to reconstruct the flag's stripe pattern from a colour palette. |
| 📚 **Review Deck** | Smart review queue of your weakest flags, sorted by spaced-repetition due date. |
| ⚔️ **Multiplayer Battle** | Share a room code with a friend and race through flags in real time. |

---

## 🗺️ Features at a Glance

- **Interactive World Map** — territories colour-fill as you master each flag (locked → learning → mastered).
- **Spaced Repetition (SM-2)** — cards resurface at scientifically optimised intervals based on your performance.
- **XP & Levelling** — earn XP on every correct answer; gain levels and unlock ranks from _Cadet_ to _Grand Master_.
- **Daily Streaks** — play once a day to keep your streak alive.
- **Passport Stamps** — earn a stamp for every mastered flag. Your passport grows with you.
- **Regional Mastery** — track progress independently per continent: Europe, Asia, Africa, the Americas, Oceania.
- **Dark Mode** — a single click in the header; preference persists across visits.
- **Zero Dependencies on the Cloud** — all progress is stored in `localStorage`. Works offline after the first load.

---

## 🌐 Countries Covered

| Region | Countries |
|---|---|
| 🌍 Africa | 54 |
| 🌏 Asia | 47 |
| 🌎 North America | 23 |
| 🌎 South America | 12 |
| 🌍 Europe | 47 |
| 🌊 Oceania | 14 |
| **Total** | **197** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev) |
| Bundler | [Vite 8](https://vite.dev) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) + custom design tokens |
| UI Components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| Routing | [React Router v6](https://reactrouter.com) |
| Animations | [Framer Motion](https://motion.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Typography | Fraunces (display) · Inter (body) — Google Fonts |
| State / Persistence | React Context + `localStorage` |
| Flag Images | [flagcdn.com](https://flagcdn.com) SVG CDN |
| Map | [react-simple-maps](https://react-simple-maps.io) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+

### Installation

```bash
# 1 — Clone the repository
git clone https://github.com/codewithabhiishek/Flag-atlas.git
cd Flag-atlas

# 2 — Install dependencies
npm install

# 3 — Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. That's it — no environment variables, no accounts, no API keys needed.

### Production Build

```bash
npm run build      # outputs to /dist
npm run preview    # serve the production build locally
```

### Multiplayer deployment

The Vite site can remain on Vercel, but real-time battles need a long-lived
WebSocket process. This repository includes one in `server/battle-server.mjs`
and a Render Blueprint in `render.yaml`.

1. Create a new Render Blueprint from this repository; it runs `npm run server:start`.
2. Copy the service's public HTTPS URL and change its scheme from `https` to
   `wss` (for example, `wss://flag-atlas-battle.onrender.com`).
3. In the Vercel project, add `VITE_BATTLE_WS_URL` with that `wss://` value to
   Production, Preview, and Development, then redeploy the frontend.

For local development, run `npm run server:start` in one terminal and
`npm run dev` in another. The frontend automatically connects to
`ws://localhost:8787` when no environment variable is set.

Rooms are intentionally in-memory and hold exactly two players. A room ends
when both players finish; if someone disconnects during a battle, the remaining
player is allowed to finish instead of being left in a stuck room.

---

## 📁 Project Structure

```
Flag-Atlas/
├── public/                 # Static assets & PWA manifest
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui primitive components
│   │   ├── FlagImage.jsx   # Flag renderer (flagcdn.com SVG)
│   │   ├── Layout.jsx      # App shell with nav + dark mode
│   │   ├── WorldMap.jsx    # Interactive SVG world map
│   │   └── PassportStamps.jsx
│   ├── data/
│   │   ├── countries.js    # 197-country dataset with helpers
│   │   ├── regions.js      # Continental regions
│   │   └── buildableFlags.js  # Stripe data for Flag Builder
│   ├── lib/
│   │   ├── AuthContext.jsx    # Auth state (localStorage-based)
│   │   ├── ProgressContext.jsx # XP / streak / flags state
│   │   ├── spacedRepetition.js # SM-2 algorithm
│   │   ├── scoring.js          # XP → level math
│   │   └── derive.js           # Mastery / accuracy helpers
│   ├── pages/
│   │   ├── Home.jsx         # Dashboard + world map
│   │   ├── FlagFragments.jsx
│   │   ├── SpeedRun.jsx
│   │   ├── Recall.jsx
│   │   ├── FlagBuilder.jsx
│   │   ├── ReviewDeck.jsx
│   │   ├── Battle.jsx       # Multiplayer (requires WebSocket server)
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🧠 Spaced Repetition

FlagAtlas implements a simplified **SM-2** algorithm to schedule flag reviews. Each time you answer a flag:

- **Correct (quality 5)** → interval doubles; card deferred further into the future.
- **Correct with hints (quality 3–4)** → interval grows more slowly.
- **Wrong (quality ≤ 2)** → card resets and re-enters the short-term review queue.

The **Review Deck** page surfaces cards that are _due today_ or have a wrong-answer history, ordered by urgency.

---

## 🏆 Rank System

Progress through ranks as you master more flags:

| Flags Mastered | Rank |
|---|---|
| 0 | Cadet |
| 10 | Scout |
| 25 | Wanderer |
| 50 | Explorer |
| 80 | Navigator |
| 110 | Cartographer |
| 150 | Geographer |
| 197 | Grand Master |

---

## ⚔️ Multiplayer Battle

The **Battle** mode lets two players race through the same set of flag questions simultaneously:

1. One player creates a room and shares the 4-character code.
2. The second player joins with the code.
3. Both players answer flags independently — the one with more correct answers wins; ties go to the fastest finisher.

> **Note:** Multiplayer requires a WebSocket server to be deployed separately. The frontend logic is ready — see `src/pages/Battle.jsx` for the room actor code.

---

## 🎨 Design System

FlagAtlas uses a hand-crafted design system built on Tailwind CSS:

| Token | Purpose |
|---|---|
| `forest` | Primary success / mastered colour |
| `terra` | Warm accent / learning colour |
| `gold` | Highlight / correct answer |
| `ocean` | World map background |
| `land` | Unvisited territory fill |
| `ink` | High-contrast text |
| `cream` | Paper-like card backgrounds |

Typography is set in **Fraunces** (serif display) and **Inter** (UI body).

---

## 🤝 Contributing

Contributions are very welcome!

```bash
# Fork → clone → branch
git checkout -b feature/your-feature-name

# Make your changes, then
git commit -m "feat: your concise description"
git push origin feature/your-feature-name
# Open a Pull Request
```

### Ideas for contributions

- 🌐 Add missing territories or overseas dependencies
- 🌏 Add capital city quiz mode
- 📱 Add PWA install prompt
- 🔊 Add audio pronunciation of country names
- 🌍 Add continent-level leaderboards

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Flag images are served from [flagcdn.com](https://flagcdn.com) — free and open under CC license.

---

<div align="center">

Made with ❤️ and a love for geography.

**[⬆ back to top](#-flagatlas)**

</div>
