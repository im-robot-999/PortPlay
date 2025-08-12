# PortPlay

**A lighthearted, story-driven multiplayer 3D web game** where friends connect via a lobby/room (by username or short room code/port) and play episodic chapters full of platforming, combat, stealth, investigation, and goofy puzzles.

---

## Table of Contents

1. Project Overview
2. Tech Stack
3. Key Features (MVP + Stretch)
4. High-level Architecture
5. Gameplay Systems & Functions
6. Characters, Enemies & Items
7. Story & Narrative Structure
8. Scenes / Levels / Biomes
9. Art, Audio & Assets
10. Data Models & API Endpoints
11. File Structure (suggested)
12. Development Setup
13. Testing & CI/CD
14. Roadmap & Milestones
15. Contribution Guidelines
16. License & Credits

---

## 1. Project Overview

PortPlay is a multiplayer episodic 3D web game designed for short sessions and emergent cooperative antics. Players "code-enter" a mysterious port (room code) to join friends and play chapters that combine platforming, combat, puzzle-solving, and clue-based investigations. Tone is playful and comedic; stakes are silly but stakes escalate across chapters toward a central mystery: the origin of the "mystery port." The frontend uses React + TypeScript with shadcn UI + TailwindCSS and 3D built with react-three-fiber. The backend is Node.js (Socket.io/WebSocket) and handles authoritative state, matchmaking, persistence, and event scripting.

---

## 2. Tech Stack

* **Frontend**: React, TypeScript, Vite
* **UI**: shadcn UI components, TailwindCSS
* **3D**: react-three-fiber, @react-three/drei, GLTF assets
* **Physics**: cannon-es (client + server authoritative checks)
* **State**: Zustand (client), React Query or SWR for REST
* **Networking**: Socket.io (real-time sync), REST (Express)
* **Backend**: Node.js, Express, Socket.io
* **DB**: PostgreSQL (or MongoDB) for player profiles; Redis for sessions and ephemeral state
* **Storage / CDN**: Cloud storage (S3/Cloudflare) for GLTF, textures, audio
* **Auth**: JWT, optional OAuth providers
* **DevOps**: Docker, GitHub Actions, Vercel/Netlify (frontend), Dockerized Node services to cloud (AWS/GCP/DO)
* **Testing**: Playwright (E2E), Jest/Testing Library (unit)
* **Analytics / Error**: Sentry (errors), Plausible or PostHog (analytics)

---

## 3. Key Features

### MVP (must-have for first playable version)

* Friend/room code (port) system to join private lobbies
* Realtime multiplayer for up to 8 players per room (Socket.io)
* Basic run / jump platforming with deterministic physics
* 1-2 combat types (melee + ranged) and one enemy type
* One chapter/level with platforming + a short investigation case
* Inventory (small) and XP progression
* Basic UI (lobby, in-game HUD, pause menu) using shadcn + Tailwind
* Server authoritative snapshots + client prediction
* Asset streaming from CDN (GLTF + textures)

### Stretch (post-MVP)

* More biomes and episodic chapters
* Roguelite mini-quests and daily challenges
* Customization: skins, quirky gadgets
* Spectator, replay recording, and highlights
* Cross-server matchmaking and region selection
* Mod tools / level editor (community content)

---

## 4. High-level Architecture

* **Client**: Renders UI and 3D, handles input, runs local physics prediction for responsiveness, reconciles with server snapshots. Uses Zustand for local game UI state and React Query for server REST calls.
* **Server**: Node.js + Socket.io: authoritative game loop (20-60Hz tick), validates critical physics interactions, applies game logic (damage, quest state), persists key events to DB. Redis for locks and ephemeral synced state. Postgres for persistent user data.
* **Asset CDN**: GLTF models, textures, audio streamed and cached for fast load.
* **Auth & API**: REST endpoints for profile, inventory, and content. JWT-based auth for secure session tokens.

Diagram (simple): Client <-> Socket.io <-> Game Server <-> DB/Redis

---

## 5. Gameplay Systems & Functions

### Core Controls

* Move, Run (hold), Jump, Double-jump (depending on level), Dash (ability), Attack (melee), Aim & Shoot (ranged), Interact (pick up clues, open chest), Use item

### Systems

* **Movement & Physics**: deterministic for platforming; client predicts and smoothly reconciles
* **Combat**: hit detection server-side; simple combo state machine client-side for animations
* **Investigation / Case System**: players collect clues; clues update a shared case log. Cases have evidence hierarchy and puzzles / mini-games to decode clues.
* **Quest & Progression**: XP, chapter progression, cosmetic unlocks
* **Inventory & Items**: consumables (health, temporary buff), gadgets (hook, jam tool), keys
* **UI / HUD**: party list, objective tracker, case log, mini-map (optional)

---

## 6. Characters, Enemies & Items

### Player Characters (examples)

1. **Quinn (The Tinkerer)**

   * Role: utility/tech
   * Abilities: deployable small drone (reveals clues), fast cooldown on gadgets
2. **Rae (The Scout)**

   * Role: platforming specialist
   * Abilities: longer jump, faster sprint, stealth dash
3. **Mako (The Brawler)**

   * Role: melee tank
   * Abilities: short-range stomp, ragdoll taunt
4. **Lumi (The Trickster)**

   * Role: crowd control
   * Abilities: decoy, temporary invisibility, comedic pranks that disorient NPCs

*(Characters are cosmetic + small mechanical differences — balance for fun.)*

### Enemies / NPCs

* **Dock Rats** (basic melee enemy)
* **Security Bots** (patrol, ranged)
* **Curator Ghost** (spooky museum boss — puzzle-based)
* Friendly NPCs with comedic dialog who give clues or side quests.

### Items

* Health pack
* Jump boots (temporary double-jump)
* Clue scanner (reveals hidden evidence)
* Port Key (unlocks secret rooms)
* Cosmetic skins and emotes

---

## 7. Story & Narrative Structure

### Overarching Premise

A mysterious network port (the "mystery port") appears as a neon-tinged door at different ports around the world. Friends who "code-enter" find episodic micro-worlds inside — each chapter reveals pieces of a larger puzzle: who (or what) is hosting the mystery port and why it collects player laughter as energy.

### Episode Structure (example)

* **Chapter 1 — Neon Docks: A Slippery Start**

  * Hook: Players enter a neon-drenched shipping yard. A crate containing a clue to the mystery has been misplaced. Platforming + light combat. The case: locate the manifest to identify a suspicious container.
* **Chapter 2 — Forest of Lost Ladles**

  * Hook: Wooden pathways & swinging platforms. Players hunt for an NPC chef who holds an old map. Puzzle: assemble map from fragments.
* **Chapter 3 — Spooky Museum**

  * Hook: Day/night museum with puzzles that change between visits. Mini-boss: Curator Ghost whose memory is fragmented — restore memories to get port coordinates.

### Tone & Writing

Playful, meta-humor with lots of small gags. NPC dialog is short, memorable, and full of one-liners. Keep mysteries intriguing but accessible to casual players.

---

## 8. Scenes / Levels / Biomes

Design each biome with a mix of traversal, combat, and a unique puzzle.

1. **Neon Docks (City Port)**

   * Features: conveyor belts, crates as platforms, cranes, small water hazards
   * Mechanic: timed crane lifts and magnet puzzles
2. **Neon Alley / Cyber Market (optional hub)**

   * Features: shop NPCs, cosmetic vendors, side-quest kiosks
3. **Forest of Lost Ladles**

   * Features: swinging logs, vines, hidden springs, collectible map fragments
   * Mechanic: dynamic trails that open/close with levers
4. **Spooky Museum**

   * Features: shifting floors, time-locked doors, puzzle exhibits
   * Mechanic: change museum room states by toggling exhibit lights

Level Design Notes:

* Break each chapter into 3 acts: Intro (narrative + tutorial), Mid (challenges + combat), Finale (case resolution + reward)
* Use verticality for platforming, sightlines for clue discovery
* Design encounters to scale with party size

---

## 9. Art, Audio & Assets

* **Models**: GLTF / GLB, modular pieces for rapid iteration
* **Textures**: PBR where needed, compressed for web (KTX2/basis)
* **Animation**: humanoid rigs with retargetable skeletons; separate idle/run/jump/attack layers
* **Audio**: small ambient loops + short SFX (avoid long tracks to save bandwidth). World music tailored per biome.
* **Naming conventions**: `model_[type]_[version].glb`, `sfx_[event]_[v1].ogg`, `amb_[biome].loop.mp3`

---

## 10. Data Models & API Endpoints

### Core DB Models (simplified)

* **User**: id, username, email (optional), hashedPassword, profileSkin, xp
* **Room**: id, code, hostId, players\[], state, tick
* **PlayerState**: userId, roomId, position, rotation, health, inventory
* **Quest/Case**: id, chapterId, cluesFound\[], state
* **InventoryItem**: id, ownerId, type, metadata

### Sample REST Endpoints

* `POST /api/auth/login` — returns JWT
* `POST /api/auth/register`
* `GET /api/profile/:id`
* `GET /api/content/chapter/:id` — chapter metadata and asset manifests
* `POST /api/room/create` — create a new room (returns room code)

### Sample Socket Events

* `connect` / `disconnect`
* `join_room` (roomCode, userToken) → server ack
* `input_update` (client → server; input snapshot)
* `snapshot` (server → clients; authoritative state)
* `chat_message` (in-room chat)
* `quest_update` (server announces clues/unlocks)

Security: validate actions server-side; rate-limit input\_update; sanitize chat messages.

---

## 11. File Structure (suggested)

```
/ (repo root)
├─ /frontend
│  ├─ /src
│  │  ├─ /components (shadcn components)
│  │  ├─ /scenes (r3f scene components)
│  │  ├─ /hooks
│  │  ├─ /store (Zustand)
│  │  └─ main.tsx
│  └─ vite.config.ts
├─ /server
│  ├─ /src
│  │  ├─ /controllers
│  │  ├─ /sockets (socket logic)
│  │  ├─ /game (authoritative game loop)
│  │  └─ index.ts
│  └─ Dockerfile
├─ /assets (small local assets for dev)
├─ docker-compose.yml
├─ README.md
└─ .github/workflows/ci.yml
```

---

## 12. Development Setup

### Prereqs

* Node.js (18+), pnpm/npm/yarn
* Docker (recommended for server & DB)

### Quick start (local dev)

1. Clone repo
2. Copy `.env.example` to `.env` and fill values (JWT secret, DB connection, CDN base URL)
3. `cd server` → `pnpm install` → `pnpm dev` (or `docker-compose up --build`)
4. `cd frontend` → `pnpm install` → `pnpm dev`
5. Open `http://localhost:3000` (or configured port)

.env variables to include (example):

```
PORT=4000
JWT_SECRET=supersecret
DATABASE_URL=postgres://user:pass@localhost:5432/portplay
REDIS_URL=redis://localhost:6379
CDN_BASE_URL=https://cdn.example.com/assets/
```

---

## 13. Testing & CI/CD

* **Unit & Integration**: Jest + Testing Library for frontend components and server logic. Keep critical game logic (physics reconciliation, combat resolution, quest state transitions) covered by unit tests.
* **E2E**: Playwright (or Cypress) for end‑to‑end flows: lobby creation, join room, simple cooperative chapter run, and disconnect/reconnect handling.
* **Load & Network Simulation**: Use a small harness to simulate latency, packet loss, and multiple clients (e.g., Artillery, custom headless clients) to validate netcode and authoritative server behavior.
* **Static Analysis & Formatting**: ESLint + Prettier + TypeScript strict mode enforced in CI.
* **CI Pipeline**: GitHub Actions (or equivalent): run lint → unit tests → build (frontend + server) → optional E2E on a staging environment.
* **CD**: Frontend auto-deploy on merge to `main` via Vercel/Netlify. Server deploy via Docker images pushed to a container registry and deployed to the cloud provider (ECS/Cloud Run/DigitalOcean App Platform). Use feature flags for staged rollouts.

---

## 14. Roadmap & Milestones

**Phase 0 — Planning & Spikes (Weeks 0–2)**

* Finalize tech choices and asset pipeline
* Prototype r3f scene, basic movement, and Socket.io handshake
* Define DB schema and simple game loop

**Phase 1 — Core MVP (Weeks 2–10)**

* Implement lobby/room system and friend invite code
* Build one chapter (Neon Docks) with traversal, enemies, and a single investigation case
* Implement authoritative server loop, simple persistence, and client prediction
* Add basic UI with shadcn and Tailwind and a minimal profile system

**Phase 2 — Content & Systems (Weeks 10–20)**

* Add two more chapters (Forest, Spooky Museum)
* Character abilities and inventory mechanics
* Cosmetic unlocks, XP, and progression
* Spectator mode & simple recording

**Phase 3 — Polish & Launch (Weeks 20–30)**

* Optimize asset pipeline and CDN integration
* Accessibility pass, localization scaffolding
* Analytics, telemetry, and Sentry integration
* Stress testing and launch checklist

**Post-Launch (ongoing)**

* New chapters & community content tools
* Seasonal events, daily challenges, leaderboards
* Monetization (cosmetics), governance for community mods

---

## 15. Contribution Guidelines

* Follow code style: ESLint rules + Prettier formatting. Use `pnpm format` and `pnpm lint` before PRs.
* Branching: `feature/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`.
* PRs: include a short description, screenshots or recordings for visual changes, and link to related issues.
* Tests: add unit tests for new logic; E2E tests for critical flows.
* Assets: provide source files (Blender/FBX) in a separate `assets/source` folder; exports go to `assets/exports` with LODs and compressed textures.
* Security: do not commit secrets. Use environment variables and `.env.example`.

---

## 16. License & Credits

* **Code**: Recommended MIT License (or choose a permissive license that fits your goals).
* **Assets**: Track per-asset licensing (Creative Commons, purchased asset packs, or in-house). Keep an `ASSETS_LICENSES.md` listing origins and attribution requirements.
* **Third-party**: Acknowledge major libraries and services used (react, react-three-fiber, cannon-es, Socket.io, shadcn, Tailwind, etc.).

---

## Appendix: Quick Design Notes, Safety & Next Steps

### Quick Design Notes

* Keep the server authoritative for game-critical outcomes (damage, item grant, quest completion). Visual polish and non-critical animations should be client-side.
* Design puzzles to be discoverable by multiple senses (visual cues + small text hints) to improve accessibility.
* Implement progressive loading: show a minimal playable zone quickly while streaming the rest of the level.

### Security & Safety

* Rate-limit input updates and chat messages. Validate client inputs server-side.
* Sanitize and escape all player-provided strings for chat and usernames.
* Use HTTPS/WSS in production; rotate JWT secrets and monitor for unusual activity.

### Next Steps (pick from these)

1. Export a trimmed `README.md` suitable for GitHub (one or two pages).
2. Generate `docker-compose.yml` + `.env.example` for quick local dev.
3. Create a starter scaffold: `frontend` (Vite + React + r3f + Tailwind + shadcn) and `server` (Express + Socket.io + TypeScript) with minimal example scenes and a basic authoritative tick loop.
4. Build a sample Neon Docks scene with placeholder GLTF assets and movement sync demo.

Tell me which next step you'd like and I will generate it.
