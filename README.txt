SAS VS ZOMBIES — Alpha 1.29.5

MAIN MENU & PLAYER PROGRESSION
- Added a dedicated Home Screen with START and SETTINGS. The release/version number is pinned at the bottom-centre; final cover artwork is intentionally deferred.
- START opens the Main Menu, with the player callsign, player level, rank and credits in the profile header.
- Main Menu entries appear in the requested order: PLAY, BARRACKS, ARMOURY, RANKS & UNLOCKS, SETTINGS.
- PLAY opens SINGLE PLAYER and MULTIPLAYER. Multiplayer displays COMING SOON and has no action.
- BARRACKS shows the player and three permanent AI squadmate records. Squadmates unlock at player Levels 5, 10 and 15. Individual XP/level/rank records are persisted; AI combat deployment and full squad upgrade trees remain future work.
- RANKS & UNLOCKS lists all 100 levels, their game-progression rank/insignia, reward status, current-level marker and upcoming confirmed unlocks. Confirmed entries in this release are Level 1 Colt M1911A1, Level 2 Basic Fragmentation Grenade (planned tool unlock), Level 3 Healing Stim (planned field item), and AI squadmates at Levels 5, 10 and 15. Other level rewards are clearly reserved rather than guessed before the weapon/armour/toolbelt master list is finalised.
- Zombie kills award provisional 10 player XP alongside the existing credit reward. Each unlocked squadmate record gains 5 XP per kill, independently. The XP curve is provisional and can be balanced later.
- Settings supports a saved operator callsign and a UI size control from 80% to 120%, in addition to the existing mobile aim assist toggle and full version history.

PRESERVED SYSTEMS
- Existing Armoury layout, weapon roster placeholders, weapon upgrade selection/confirmation, loadout and ammunition persistence, credits, combat, movement, touch controls, developer options, mission selector, Farmhouse and Training Block maps, artwork, assets and collision definitions.
- No map art or collision geometry was changed in this release.

KNOWN SCOPE NOTES
- The Multiplayer screen remains a non-functional Coming Soon entry.
- AI teammates appear as Barracks progression records; active in-mission squadmate behaviour is not implemented in this release.
- Future level rewards for the full weapon, six-set armour and toolbelt plan are not assigned here. Those entries should be inserted after the relevant master lists are finalised and approved.

SAS VS ZOMBIES — Alpha 1.29.4

Armoury redesign in a SAS 3-inspired black/red visual style. Weapon-group tabs sit across the top; the selected group’s weapon list appears on the right and selected weapon panel on the left with a visual silhouette, magazine/reserve information, stat bars, ammunition purchasing where applicable, and a separate Upgrade button. Upgrade planning is a distinct screen with all ten stats and tier prices, selectable next-tier purchases, live total cost, Back-to-cancel, and Confirm-to-purchase. Confirm deducts credits and saves selected upgrades together; backing out does not spend credits. Existing primary/secondary loadout selectors remain available. Existing combat mechanics, credit prices, inventory storage, map art and collision definitions are retained.

SAS VS ZOMBIES — Alpha 1.29.2

Alpha 1.29.2 fixes an upgrade-tier lookup bug so purchased tiers display as owned and the correct next-tier price is shown. It also corrects weapon upgrade effects and improves Armoury feedback. Accuracy reduces base spread and recoil buildup; standard pistols have a 5% base critical-hit chance before upgrades; each penetration tier adds a consistent 15 percentage-point chance to continue to the next target; stagger applies a temporary slow rather than permanently reducing zombie speed. Armoury tier tiles show the per-tier effects, and the upgrade panel stays open after a purchase.

Map artwork, collision definitions, controls, credits, upgrade costs and ammunition/loadout persistence are retained.

SAS VS ZOMBIES — Alpha 1.29.1

Alpha 1.29.1 hardens weapon swapping, reload cancellation and upgraded magazine persistence. If an equipped pistol has an empty magazine but reserve rounds available, equipping it starts a reload automatically. Interrupting a Hi-Power reload returns the rounds reserved for that unfinished reload. The game now saves and displays magazine capacity consistently with per-weapon upgrades.

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
