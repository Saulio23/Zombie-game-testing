SAS VS ZOMBIES / DEADLINE — Alpha 1.26.2

FOCUS OF THIS RELEASE
- Corrected tutorial inner-wall collision boundaries to match the visible wall endpoints in assets/tutorial_interior.png. The vertical wall sections at x=37.5% and x=62.5% now stop at approximately y=39% and resume at y=60%, leaving the visible doorway span clear.
- Fixed Collision Debug display logic: Tutorial mode now draws the actual tutorial solid segments through the same tutorialPoint transform used by artwork and collision. It no longer displays the unrelated farmhouse collision lines while the tutorial is active.
- Shows the six interactive tutorial barricades separately in amber in collision-debug mode.

PROTECTED SYSTEMS
- The game logic, movement, shooting, reload, grenade, zombie, barricade damage/destruction/repair behavior, room layout, background PNG, and farmhouse collision definitions were otherwise kept unchanged from Alpha 1.25.2.
- Tutorial solid-wall collision coordinates changed only for the two inner partitions. The background asset remains 2400 x 1600 pixels.

TESTING
- JavaScript syntax and ZIP integrity checks passed.
- This package has not been tested in a live browser or on an iPhone; gameplay needs to be confirmed on the user's device.
- Use the in-game Settings/Pause menu to enable COLLISION DEBUG. In Tutorial mode, red lines now correspond to the active tutorial solid-wall segments; amber outlines mark the six separate interactive barricades. In Farmhouse mode, the existing red/blue/green/yellow legend remains in effect.

GitHub Pages: upload the contents of this ZIP to the repository root, preserving the assets/ folder.

Alpha 1.26.2: Made Developer Options scrollable on mobile and desktop, added a top-right close button, and retained Back to Pause. Added standard 7-round magazine/reload combat, player health/armour and zombie contact damage, plus PC mouse aim and held fire. Unlimited reserve ammo is always standard. Built from Alpha 1.25.5.

Alpha 1.26.2: visible draggable scrollbar for Developer Options; automatic reload on attempted fire with an empty magazine; RELOADING status; manual reload still dumps partial magazine.
