SAS VS ZOMBIES — ALPHA 1.31.2

ALPHA 1.31.2 BUG FIXES
- Fixed guest readiness being unintentionally reversed by removing the redundant hello handshake from the READY toggle.
- Added revisioned, host-authoritative mission updates. Guests only apply mission changes from the host and only when a newer mission revision arrives.
- Incoming lobby snapshots update peer status but do not reset the local player's readiness.
- Changing the host-selected mission resets readiness for the host and connected guests, requiring everyone to ready up again.
- Fixed mission selection on mobile and desktop by listening to the native select change event instead of the generic touch/click binder.
- Deployment synchronization is locked unless at least one guest is connected and every connected operator, including the host, is READY.
- Updated the home-screen version label, web app manifest and full changelog to Alpha 1.31.2.
- Preserved existing game assets, campaign and single-player code.

IMPORTANT LIMITATIONS
- This remains a lobby/deployment-data prototype, not playable co-op. Shared player movement, zombies, combat, campaign progression, AI companion deployment, reconnect reservations and host migration are not implemented.
- Public Nostr signalling relays and WebRTC connectivity depend on the player's network and browser. Some network combinations may require TURN relay infrastructure, which is not included.
- Multiplayer imports Trystero from https://esm.run/trystero at runtime; the game must be served over HTTPS/HTTP with internet access.
- This is an early prototype, not a production-grade identity or anti-cheat system.

TESTS PERFORMED FOR THIS PACKAGE
- ZIP archive structure and CRC integrity check.
- JavaScript syntax check with Node.js.
- Static regression checks for host-only mission changes, revisioned mission updates, ready-state persistence, selector event wiring, and deployment readiness gating.
- Source-level tests for READY toggle behaviour, mission-change readiness reset, and deployment gate logic.
- A live two-device WebRTC session could not be independently run in this packaging environment. Please validate on two devices after uploading, especially guest READY persistence and host mission changes.

INSTALLATION
Extract the ZIP and upload all files to your existing repository, keeping the assets folder intact. Open the hosted game over HTTPS. On two devices, host on one and join with the room code on the other. Confirm the guest can toggle READY on and off, both devices show consistent readiness, mission selection is host-only and updates on the guest, changing the mission resets readiness, and SYNC DEPLOYMENT remains locked until all connected operators are ready.

NOTE
The ZIP supplied for this update contained Alpha 1.31-labelled files rather than an Alpha 1.31.1-labelled package. This release is based on the actual supplied ZIP contents and preserves that code/assets baseline while applying the requested fixes.
