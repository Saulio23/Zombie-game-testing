SAS VS ZOMBIES / DEADLINE — Alpha 1.25.4

Alpha 1.25.4: Replaced assets/tutorial_interior.png with the supplied dark weathered timber image, converted to PNG at 2400x1600 to match the existing asset dimensions. No gameplay code, map geometry, collision barriers, or interactive barricade rendering changed.


Collision diagnostic build. Start Farmhouse, then pause and choose COLLISION DEBUG: ON. On desktop, press D to toggle the overlay.

Overlay legend: RED = solid movement/projectile barriers; BLUE = breakable windows; GREEN = movement-only obstacles (bullets pass); YELLOW = gate/climb points. Grid labels are world-space percentages, aligned to the map image. Player position is shown as normalized percentages.

The overlay is diagnostic; it does not automatically correct collision placement. Send a screenshot with the overlay ON, ideally one of the whole estate and one close-up around a mismatched wall/doorway.

Separate 700-zombie Arena Stress Test remains available from Map Select.

Alpha 1.24.15: Replaced the tutorial map artwork and collision barriers from scratch. Five rooms: tall central rectangle, two equal stacked square rooms on each side, with passages between all adjacent rooms. Home Screen version and Settings version history updated.

Alpha 1.24.18: Doubled the width of the two openings connecting the central rectangle to the side-room columns. Updated tutorial_interior.png and tutorial collision barriers to match. Retained all other gameplay systems.

Alpha 1.24.18: Added six tutorial perimeter barriers with damage states, destruction/opening, repair, and zombie targeting. Farmhouse and 700-zombie Arena Stress Test kept separate.

Alpha 1.24.18: Improved tutorial barrier navigation, repair from any damaged state, player collision at destroyed barriers, and bullet pass-through in every barrier state.

Alpha 1.24.19: Rebuilt from the known-good 1.24.18 base. Added a separate repair action button beside reload within the existing mobile-controls container, shown only near damaged barriers. Reload is reload-only. Destroyed tutorial barriers remain visible as rubble while remaining passable to zombies.

Alpha 1.25: upgraded the tutorial interior PNG to 2400x1600 with additional floor wear, broken-board details, blood smears, small corpse silhouettes and stained mattresses. The existing room/wall layout remains unchanged; interactive tutorial barriers are still rendered separately by JavaScript. Improved wood grain, nails and damage detail in the barrier renderer.

Alpha 1.25.4: Corrected only the four internal tutorial wall collision openings. Upper openings are 26%-43% of map height; lower openings are 57%-74%. No other gameplay or collision geometry changed.
