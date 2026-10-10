DEADLINE — ALPHA 1.23: OPEN DOORWAYS & ZOMBIE COLLISION

INSTALL
Replace the five root files in your GitHub Pages repository with the files in this ZIP. Upload the included assets folder, keeping its name and all PNG filenames unchanged. The five root files are index.html, game.js, style.css, manifest.json and README.txt. Keep the ZIP structure flat at the root, with assets/ alongside the root files.

CHANGES
- Alpha 1.23: Removed visible interior door leaves and added open doorway gaps between rooms. Zombie movement now checks farmhouse collision geometry, slides along walls and tries nearby directions when blocked.
- Single Player now opens MAP SELECT.
- Added four SAS 3-inspired blood-stained Polaroid map cards: FARMHOUSE is playable and the other three say COMING SOON.
- Added a detailed, layered farmhouse environment: ground-floor rooms, floorboard textures, furniture, broken boards, garden beds, fence, barn, yard clutter, blood stains and blood-written HELP.
- Separated map collision/navigation data from drawing code and established data records for future windows, doors and repairable barriers.
- Farmhouse starts with 85 zombies per wave, a 100-active-zombie cap and paced spawning; the per-wave target increases by 5. These are initial tuning values, not final balance.
- Preserved the 700-zombie arena stress test through a separate ARENA STRESS TEST option on Map Select.
- Updated title, Home Screen version and Settings changelog to Alpha 1.22.
- Existing pause/settings/return confirmation and touch/keyboard controls retained.

IMPORTANT CURRENT LIMITATIONS
- This is the first playable map foundation, not a finished commercial-quality map. Art is procedurally drawn on layered canvas passes rather than a final hand-painted tile atlas.
- Static collision/navigation metadata and future barrier object records are in place, but full route-planning/pathfinding around complex room layouts and interactive break/repair mechanics are not implemented yet; current zombie steering is local collision-aware movement. Those should be added in subsequent releases before treating the farmhouse as complete.
- The four card previews are stylized CSS concepts and should be replaced with final map thumbnails when those maps are developed.

TESTING
Archive integrity, JavaScript syntax, expected root files and zombie asset references were checked. This package has not been live-tested in iPhone Safari or desktop browsers. After deploying, test Single Player -> Map Select -> Farmhouse, Back, all Coming Soon cards, Arena Stress Test, movement/shooting, pause/resume, Settings navigation and return confirmation.
