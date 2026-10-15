SAS VS ZOMBIES / DEADLINE — Alpha 1.27.0

FOCUS OF THIS RELEASE
- Added an Armoury screen from the Main Menu with the planned classes: Pistols, SMGs, Assault Rifles, Marksman Rifles, LMGs, Shotguns, Explosives, Special, and Armour.
- Added Coming Soon entries for the confirmed pistol and SMG roster. Only the Colt M1911A1 is implemented as a usable starting weapon in this release; other weapons are not selectable.
- Added persistent local player inventory: credits, Colt M1911A1 magazine ammunition and reserve ammunition persist across missions and browser sessions where local storage is available.
- Added limited reserve ammunition and a buy-ammunition pack in the Armoury. Reloads consume reserve rounds; manual reloads discard the partial magazine as before. Magazine and unused reserve ammunition are carried between missions.
- Added a Developer Options Unlimited Ammo override. It temporarily allows firing/reloading without consuming the player's saved magazine/reserve inventory; disabling the toggle restores the real inventory snapshot.
- Zombies award provisional currency. Balance values are intentionally easy to tune after testing.

PROVISIONAL ECONOMY VALUES
- Starting magazine: 7 rounds.
- Starting reserve: 35 rounds.
- Ammunition pack: +35 reserve rounds for 100 credits.
- Zombie kill reward: 10 credits.
These values are placeholders for first-pass testing and are not final balance decisions.

PROTECTED BASELINE
- Built directly from SAS_VS_ZOMBIES_Alpha_1_26_4.zip.
- Existing movement, aiming, reload animation duration, map art, tutorial collision geometry, farmhouse collision data, touch controls, responsive menu sizing and native swipe scrolling were preserved except for the ammunition inventory integration and new Armoury UI.
- Armour equipment and additional weapon class rosters remain Coming Soon. The Assault Rifle roster was not guessed where exact planned names were unavailable in the context available for this build.

TESTING
- JavaScript syntax check and ZIP integrity check performed.
- No live iPhone/browser testing has been performed from this environment.

DEPLOYMENT
Upload the contents of this ZIP to the GitHub repository root, preserving the assets/ folder.
