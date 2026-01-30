# Clash Defense: Competitive Tower Defense

**Version**: 1.0.0 (Secure Release)
**Status**: Stable / Feature Complete

A high-performance Tower Defense game built for competitive play, featuring **Deterministic Replay Verification** to prevent cheating.

## 🌟 Key Features
- **Anti-Cheat**: Server-side replay verification ensures every leaderboard score is legitimate.
- **Cloud Save**: Progress follows you across devices.
- **Dynamic Difficulty**: The game scales to your skill level in real-time.
- **Tech Tree**: Deep progression system.

## 📚 Documentation
- **[SECURITY.md](./SECURITY.md)**: Deep dive into the Deterministic Engine and Replay System.
- **[ROADMAP.md](./ROADMAP.md)**: Future plans (PVP, Mobile).
- **[BUGS.md](./BUGS.md)**: Current known issues.

## 🛠️ Setup Guide

### prerequisites
- Node.js v18+
- Docker (for PostgreSQL database)

### Quick Start
1.  **Start Database**:
    ```bash
    docker-compose up -d
    ```
2.  **Install & Run Backend**:
    ```bash
    cd server
    npm install
    # Apply Database Schema
    npx ts-node src/scripts/migrate.ts
    # Start Server
    npm run dev
    ```
3.  **Install & Run Frontend**:
    ```bash
    # (In project root)
    npm install
    npm run dev
    ```
4.  **Play**: Open `http://localhost:3000`.

## 🏗️ Architecture
- **Frontend**: React + Vite + TailwindCSS.
- **Backend**: Express + TypeScript + PostgreSQL.
- **Engine**: Shared `GameEngine` class (Seeded RNG) used by Client (View) and Server (Verification).

## 🤝 Contributing
See `ROADMAP.md` for what's next. PRs welcome!
