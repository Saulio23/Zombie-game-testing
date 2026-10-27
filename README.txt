SAS VS ZOMBIES — Alpha 1.32.1
==============================
===========================

This release builds on Alpha 1.32 and fixes pre-game lobby sizing. It focuses on the multiplayer menu/preparation flow and keeps the existing single-player game intact.

WHAT'S NEW
- Fixed the pre-game lobby expanding beyond its narrower parent menu. The parent panel now sizes to the available viewport width/height and safe areas.
- Short landscape screens use a compact two-column preparation layout so mission/loadout controls and the roster are visible together where space permits. On especially constrained viewports, the panel scrolls vertically instead of clipping content.
- No peer networking or gameplay logic changed.
- Split multiplayer preparation into two clear stages that use the existing black/red tactical menu styling.
- Network Staging: connect through the existing private room-code system, view the operator roster and ready to proceed.
- When the host and every connected guest are ready, the host moves the group into the Pre-Game Lobby.
- Pre-Game Lobby: the operator roster is on the right on wider screens; mission selection and preparation controls are on the left. The layout adapts to phone-sized screens.
- Mission selection is now in the Pre-Game Lobby and is host-only. The options are Farmhouse Estate — Survival and Farmhouse — Training Grounds. Mission changes reset readiness.
- Added a separate Ready Up stage for deployment and a synchronized 3–2–1 countdown prototype. The countdown is cancelled if an operator becomes unready or disconnects.
- Added a Player Loadout preparation panel. Player 1 uses the existing saved profile; Player 2 has a separate local test loadout so the two slots do not share the same weapon selection.
- Added AI Team Loadouts preparation panels with local-only weapon/armour preference settings.
- Added Alpha 1.32.1 version labels, manifest metadata and changelog entry.

IMPORTANT LIMITATIONS
- This is a menu and lobby foundation, not full co-op gameplay. Completing the countdown synchronizes lobby data only; it does not launch a shared playable mission.
- The Player 2 test loadout is stored locally on the device and is not transmitted to another player yet.
- AI loadout preferences are saved locally for UI testing and do not yet change AI combat behaviour.
- The existing game only has functional M1911A1 and Hi-Power prototype weapons. Other weapon, armour and upgrade options remain part of the broader roadmap.
- Live two-device WebRTC validation was not available during packaging. Please test staging, the pre-game lobby, mission updates and readiness on your devices.

PRESERVATION
- Existing game.js/index.html/style.css structure and all original assets are retained.
- Single-player gameplay, maps, collision data, existing weapon implementations, progression, and mobile controls were not intentionally changed.
- The 22 original asset files were retained byte-for-byte.

TESTS PERFORMED
- JavaScript syntax check with Node.js.
- HTML parser check.
- manifest.json parse check.
- ZIP integrity/CRC check.
- Static checks for the two-stage UI, host-only mission selection, separate Player 2 local loadout storage, and countdown readiness gates.
- Live two-device networking was not tested as part of this package.

INSTALL
1. Keep a copy of Alpha 1.31.2 as your rollback backup.
2. Extract this ZIP and upload its contents to your existing web host/repository, preserving the assets/ folder.
3. Open the game on the devices and test the new two-stage multiplayer menu.
