SAS VS ZOMBIES — Alpha 1.33
===========================

Alpha 1.33 builds on the confirmed Alpha 1.32.1 multiplayer-menu baseline. This is a preparation and ownership update; it does not add shared co-op combat.

WHAT'S NEW
- Removed the Player 1 / Player 2 loadout selector. The local player edits only their own operator loadout, saved through the existing player profile used by single-player and the Armoury.
- Each connected player configures their own loadout on their own device. No player can use this menu to edit another player's weapons.
- Reworked AI setup labels and guidance so the menu clearly configures only the local player's three AI squadmates.
- AI squad preferences use a dedicated Alpha 1.33 local-storage key and persist on the device. Existing Alpha 1.32 AI preferences are migrated by reading them as a fallback; new saves use the 1.33 key.
- Added deployment validation: the local player must have two distinct supported weapons and the selected mission must be valid before they can ready up for deployment.
- Preserved the existing black/red tactical menu style and two-stage multiplayer staging/pre-game flow.

IMPORTANT LIMITATIONS
- This remains a lobby and preparation prototype, not shared co-op gameplay. The countdown synchronizes lobby data only and does not launch a shared playable mission.
- Player loadouts and AI preferences are local to each device and are not transmitted to other players.
- AI loadout preferences do not yet affect AI combat behaviour.
- Only the M1911A1 and Hi-Power prototype are selectable in this menu.
- Live two-device WebRTC validation was not available during packaging.

PRESERVATION
- Single-player gameplay, existing player profile, Armoury, progression, maps, collision data, weapons, and mobile controls are retained.
- All original asset files are retained byte-for-byte.
- Existing network staging, host-only mission selection, readiness handling, and countdown cancellation behavior are retained.

TESTS PERFORMED
- JavaScript syntax check with Node.js.
- HTML parser check.
- manifest.json parse check.
- ZIP integrity/CRC check.
- Static checks for removal of the player selector, use of the existing local player profile, separate local AI squad persistence, distinct-weapon validation, and deployment readiness gating.
- Automated regression checks for required DOM IDs and JavaScript element references.
- Live two-device networking and in-browser visual testing are not available in this packaging environment.

INSTALL
1. Keep Alpha 1.32.1 as your rollback backup.
2. Extract this ZIP and upload its contents to your existing web host/repository, preserving the assets/ folder.
3. Open the game on devices and test staging, per-device loadout editing, AI preference persistence, mission selection, readiness cancellation, and countdown behavior.


Alpha 1.33 ownership correction (revision): Host owns AI teammates 1–3; Players 2, 3, and 4 each own exactly one AI teammate. Joining players see a single AI selection and save validation rejects any AI slot outside their ownership. Four humans + six AI teammates = ten deployment characters.
