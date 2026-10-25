SAS VS ZOMBIES — ALPHA 1.31

ALPHA 1.31 CHANGES
- Added a dedicated Multiplayer menu with Host Game and Join Game flows.
- Added a peer-to-peer lobby prototype using Trystero (WebRTC) with its default public Nostr signalling strategy; no dedicated game server or account is required.
- Added six-character private room codes, room-code copy, up to four human-player slots, connection/disconnection status, callsigns, Ready status, host-only mission selection, and deployment-state synchronization.
- Added visible networking error handling and explanatory status messages.
- Updated Home Screen version, web app manifest, and changelog to Alpha 1.31.
- Preserved Alpha 1.30 game code and assets as the baseline; no single-player combat or weapon balance was intentionally changed.

IMPORTANT LIMITATIONS
- This is a networking/lobby prototype, not playable co-op. Shared player movement, zombies, combat, campaign progression, AI companion deployment, reconnect reservations, and host migration are not implemented.
- Public Nostr signalling relays and WebRTC connectivity depend on the player's network and browser. Some network combinations may require TURN relay infrastructure, which is not included because it may introduce cost or hosting requirements.
- Multiplayer networking imports Trystero from https://esm.run/trystero at runtime, so the game must be served over HTTPS/HTTP and have internet access. Opening index.html directly as a file will not reliably support this module import.
- Room codes are random and intended for friend invites, but this prototype is not a production-grade identity or anti-cheat system.

TESTS PERFORMED FOR THIS PACKAGE
- ZIP structure/integrity check.
- JavaScript syntax check with Node.js.
- Static checks for required menu IDs, Trystero import, action handlers, and Alpha 1.31 version labels.
- Automated source-structure checks only. A live two-device WebRTC session was not available in this packaging environment and still needs testing on the hosted game from two devices.

INSTALLATION
Extract the ZIP and upload all files to your existing game repository, keeping the assets folder and its contents intact. Open the hosted game over HTTPS. For a connection test, open the game on two devices, select PLAY > MULTIPLAYER, host on one device, and enter the displayed six-character room code on the other.
