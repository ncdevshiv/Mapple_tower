# Clash Defense Cloud

A tower defense game with cloud save and leaderboard functionality.

## Overview

Clash Defense Cloud is a full-stack tower defense game featuring:
- Strategic tower placement and upgrades
- Wave-based enemy attacks
- Cloud save system with 3 save slots
- Real-time leaderboards
- User authentication
- Tech tree progression system

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                           │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVER (Node.js/Express)                │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼ SQL
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker

1. Clone the repository and navigate to the project:
```bash
cd clash-defense-cloud
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/

5. Stop services:
```bash
docker-compose down
```

To stop and remove volumes (clears database):
```bash
docker-compose down -v
```

### Local Development (without Docker)

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Game Saves
- `GET /api/saves` - List all saves
- `GET /api/saves/:slot` - Get specific save (slots 1-3)
- `POST /api/saves/:slot` - Save game
- `DELETE /api/saves/:slot` - Delete save
- `POST /api/saves/:slot/sync` - Sync with conflict detection

### Leaderboards
- `GET /api/leaderboard/:levelId` - Get leaderboard
- `GET /api/leaderboard/:levelId/me` - Get personal best
- `POST /api/leaderboard/:levelId/submit` - Submit score
- `GET /api/leaderboard/global/stats` - Global statistics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | clash_user |
| `DB_PASSWORD` | PostgreSQL password | clash_pass |
| `DB_NAME` | PostgreSQL database | clash_defense |
| `JWT_SECRET` | Secret for JWT signing | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `VITE_API_URL` | API URL for client | http://localhost:3001/api |
| `WORKOS_API_KEY` | WorkOS API key for authentication | (required) |
| `WORKOS_CLIENT_ID` | WorkOS client ID | (required) |

## Features

### Cloud Save
- 3 save slots per user
- Automatic conflict detection
- Sync local saves to cloud
- Resume game on any device

### Leaderboards
- Per-level leaderboards
- Global rankings
- Personal best tracking
- Score calculation based on waves, gold, lives, and efficiency

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Rate limiting on auth endpoints

### Tech Tree
- Upgrade towers and abilities
- Strategic progression system
- Unlock new tower types

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (database)
- Redis (caching/sessions)
- JWT (authentication)
- Zod (validation)
- WorkOS (authentication)

### Frontend
- React + TypeScript
- Vite (build tool)
- Zustand (state management)
- Axios (HTTP client)
- Tailwind CSS (styling)

### Infrastructure
- Docker + Docker Compose
- Nginx (reverse proxy - optional)

## Security

### Environment Variables

This project uses environment variables for configuration. **Never commit `.env` files to version control.**

The [`.gitignore`](.gitignore) file is configured to ignore:
- Root `.env` file
- `.env.local` file
- `server/.env` file

To set up your environment:
1. Copy `.env.example` to `.env`
2. Fill in your actual values

## Game Configuration

Game balance, tower stats, enemy types, and level designs are configured in JSON files located in:
- `client/src/config/towers.json`
- `client/src/config/enemies.json`
- `client/src/config/levels.json`
- `client/src/config/tech-tree.json`
- `client/src/config/game-balance.json`

## License

MIT
