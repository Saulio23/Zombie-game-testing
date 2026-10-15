SAS VS ZOMBIES — Alpha 1.29.0

Alpha 1.29 adds functional persistent upgrades for the M1911A1 and Browning Hi-Power prototype. Upgrade tiers are purchased with credits and each weapon has independent upgrade levels.

M1911A1 prices by tier: 10, 15, 20, 25, 30 credits.
Hi-Power prices by tier: 15, 21, 27, 33, 39 credits.

All previous Alpha 1.28.0 features and assets are retained. Open index.html through GitHub Pages; keep the ZIP contents at the repository root.

SAS VS ZOMBIES / DEADLINE — Alpha 1.28.0

CHANGES IN THIS RELEASE
- Added weapon-specific accuracy/spread, accumulating recoil that settles while not firing, and effective projectile range for the Colt M1911A1 and Browning Hi-Power prototype.
- Added optional mobile aim assist, enabled by default and adjustable in Settings; it gently nudges aim toward nearby zombies inside the current aim direction. Mouse aiming is unaffected.
- Preserved the two-slot loadout, per-weapon magazine/reserve persistence, M1911A1 unlimited reserve, limited Hi-Power reserve, and non-destructive developer Unlimited Ammo override.
- Preserved map assets, collision geometry, mobile controls, Armoury upgrade placeholders, and existing developer options.


- Added a two-slot pre-mission loadout selector in the Armoury and in-game swapping via SWAP or keyboard 1/2.
- Added the Browning Hi-Power as a functional prototype specifically to test per-weapon magazine/reserve persistence; its stats are provisional.
- Colt M1911A1 reserve is now unlimited, while its 7-round magazine remains finite. Hi-Power reserve is limited and purchased in 35-round packs for 10 credits.
- Ammo is stored independently per weapon and persists across weapon swaps and missions. The developer Unlimited Ammo override remains separate and non-destructive.
- Reduced the reserve ammunition pack price from 100 to 10 credits. A pack still provides 35 reserve rounds for the Hi-Power prototype.
- Added a separate expandable upgrades panel to every listed pistol and SMG in the Armoury.
- The upgrade framework displays all 10 planned upgrade stats for each weapon: Magazine Capacity, Fire Rate, Damage, Reload Speed, Critical Hit Chance, Accuracy, Range, Critical Damage, Penetration and Stagger.
- Every stat displays five planned tiers (50 planned upgrades per weapon). All upgrade tiers are marked Coming Soon and cannot yet be purchased.
- Preserved the Alpha 1.27.0 Armoury, local credits/ammunition profile, limited reserve ammo, mission-to-mission reserve persistence and non-destructive Unlimited Ammo override.
- Other planned weapon categories remain listed but empty until their exact roster is integrated. Armour/character/AI teammate upgrade systems remain future work.

PROVISIONAL ECONOMY VALUES
- Starting magazine: 7 rounds.
- Starting reserve: 35 rounds.
- Ammunition pack: +35 reserve rounds for 10 credits.
- Zombie kill reward: 10 credits.
These economy values can be balanced after testing.

PROTECTED BASELINE
- Built from the confirmed Alpha 1.26.4 benchmark through Alpha 1.27.0.
- Existing movement, aiming, firing/reload behaviour, farm/tutor map art and collision geometry, touch controls, responsive menu sizing, direct swipe scrolling and Developer Options were preserved.

TESTING
- JavaScript syntax check, archive integrity, and browser-based UI checks for Armoury navigation, weapon upgrade accordion expansion, 10 stat rows per weapon, five tiers per stat, and ammo purchasing were performed.
- No live iPhone testing has been performed from this environment.

DEPLOYMENT
Upload the contents of this ZIP to the GitHub repository root, preserving the assets/ folder.
