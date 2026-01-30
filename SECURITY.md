# Security & Multiplayer Architecture

## Core Philosophy
To achieve an "impossible to hack" system with **minimal server load**, we use **Deterministic Replay Verification**.

Instead of the server simulating every frame for every user (high load), the server acts as a **Judge**.

## 1. Deterministic Game Engine
The client verification model relies on **Determinism**: given the same **Seed** and **Inputs**, the game state must evolve identically on any machine.
- **Seeded RNG**: Implemented in `SeededRNG.ts`. Replaced `Math.random` throughout the codebase.
- **Input Logging**: Implemented in `InputLogger.ts` and integrated into `GameEngine`.

## 2. Anti-Cheat Workflow (Implemented)
1.  **Game Start**: Engine initializes with a `Seed` (currently Client-Time based, moved to Server-Gen for PVP).
2.  **Gameplay**: User actions (Build, Move, Upgrade) are logged with Tick timestamps.
3.  **Submission**: Client sends `ReplayData` (Seed + Inputs) to `/api/leaderboard/submit`.
4.  **Verification**: Server accepts payload and runs `VerificationService.verify()`.
    - *Current State*: Verification checks basic structure. To fully enable server-side simulation, the server needs to run a Headless version of `GameEngine`.

## 3. Multiplayer (PVP) Architecture
- **Input Sync**: Lockstep model designed.
- **Headless Mode**: `GameEngine` now supports `headless: true` (Mock logic for Sound/VFX), allowing it to run in Node.js environments.

## 4. Vulnerability Analysis
| Vulnerability | Fix |
|---|---|
| **Score Injection** | Client must submit a valid *Replay* that results in the score. Hard to forge without playing. |
| **Speed Hacking** | Replays are tick-based. Playing faster locally doesn't affect the replay's validity, but "impossible" input rates can be flagged. |

## 5. Next Steps
1.  **Server Engine Build**: Create a build step to transpile `GameEngine` for server usage (Shared Library).
2.  **PVP Socket Server**: Implement `socket.io` relay for multiplayer packet exchange.
