SAS VS ZOMBIES — ALPHA 1.21: IN-GAME PAUSE MENU

INSTALL
Replace the five root files in your GitHub Pages repository with the files in this ZIP. Upload the included assets folder, keeping its name and all PNG filenames unchanged. The five root files are index.html, game.js, style.css, manifest.json and README.txt.

CHANGES
- Expanded the in-game pause menu with Resume, Settings and Return to Menu.
- Settings opens the full Settings screen. Its Back button returns to the pause menu when Settings was opened during a match, leaving the match paused. From the Home Screen, Back returns to the Home Screen as before.
- Return to Menu asks for confirmation before ending the current arena session. Cancel returns to the pause menu; confirmation returns to the Home Screen and clears the current session.
- Escape closes the confirmation prompt, returns from Settings to its previous screen, or toggles the pause menu during gameplay.
- Updated the Home Screen version label and Settings changelog to Alpha 1.21.
- Preserved the existing arena, zombie assets, spawning, combat and controls. Multiplayer remains a placeholder.

TESTING
Archive integrity, required files, JavaScript syntax and asset references were checked. This package has not been live-tested on an iPhone or PC browser; please test pause/resume, Settings/back navigation, the confirmation prompt, and keyboard/touch controls after deploying.
