DEADLINE - Alpha 1.1

Files:
- index.html
- style.css
- game.js
- manifest.json

Alpha 1.1 changes:
- Fixed Wave 1 immediately ending on load.
- Improved iPhone touch handling and suppressed text selection/touch callouts.
- Added stronger touch/gesture prevention for full-screen play.
- Added grenade travel/flash/explosion effects.
- Added simple muzzle flash and zombie hit/death feedback.
- Added wave transition banner.
- Added grenade count to the HUD.
- Added Alpha 1.1 version label to the start screen.

Run locally:
1. From this folder, run a local web server, e.g.:
   python3 -m http.server 8000
2. Open http://localhost:8000

For iPhone testing:
- Serve over HTTPS.
- Use landscape orientation.
- Touch controls: left stick moves, right stick aims/fires, R reload button, G grenade.
