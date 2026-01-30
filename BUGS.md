# Known Issues / Bugs

## Critical
- **None known** (Core verified).

## Major
- **Replay Verification Stub**: The server currently accepts replays and performs a "mock" check. The `Headless GameEngine` simulation is hooked up but requires full testing with complex replays to ensure Identical Determinism across all OS environments (Float math determinism).
- **Docker Dependency**: Database requires Docker. No fallback SQLite implementation for purely local/offline dev without Docker.

## Minor
- **Input Logger Overhead**: Creating an object for *every* tick might scale poorly for 1-hour sessions. Needs batching/compression.
- **Leaderboard Pagination**: UI only loads Top 50. Pagination is implemented in Backend but not Frontend.
- **VFX cleanup**: Some particles might not be collected aggressively enough, causing memory drift over long sessions.
