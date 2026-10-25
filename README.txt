SAS VS ZOMBIES — ALPHA 1.31.1

ALPHA 1.31.1 CHANGES
- Added host-authoritative mission selection with a live briefing for Farmhouse Estate — Survival and Farmhouse — Training Grounds.
- Guests see the host's mission in a read-only selector and receive host mission updates.
- Guest mission changes are ignored; mission state updates are accepted from a peer identified as the host.
- Changing mission clears readiness so all operators must confirm the updated selection.
- Host deployment synchronization is enabled only when at least one guest is connected and all connected operators are READY.
- Added deployment sync status and clearer lobby notices.
- Updated manifest and changelog to Alpha 1.31.1.
- Preserved the Alpha 1.31 game and asset baseline.

IMPORTANT LIMITATIONS
- This remains a lobby/deployment-data prototype, not playable co-op. Shared player movement, zombies, combat, campaign progression, AI companion deployment, reconnect reservations, and host migration are not implemented.
- Public Nostr signalling relays and WebRTC connectivity depend on the player's network and browser. Some network combinations may require TURN relay infrastructure, which is not included.
- Multiplayer imports Trystero from https://esm.run/trystero at runtime; the game must be served over HTTPS/HTTP with internet access.
- This is an early prototype, not a production-grade identity or anti-cheat system.

TESTS PERFORMED FOR THIS PACKAGE
- ZIP structure/integrity check.
- JavaScript syntax check with Node.js.
- Static checks for mission UI, host authority guards, readiness gating, and Alpha 1.31.1 version labels.
- The user reported the Alpha 1.31 two-device lobby working. A live WebRTC session cannot be independently re-run in this packaging environment; please test mission changes with two devices.

INSTALLATION
Extract the ZIP and upload all files to your existing repository, keeping the assets folder intact. Open the hosted game over HTTPS. On two devices, host on one and join with the room code on the other. Change the mission on the host, confirm the guest sees the change and cannot edit the selection, then ready both operators and use SYNC DEPLOYMENT.
