# Crownfall — prototype 01

An original, dependency-free browser game inspired by Starrows' solo hero + autonomous army + base-building loop. Open `index.html` directly in a browser, or run `python -m http.server 8000` here and visit http://localhost:8000.

Prototype 04 expands the vertical world to 1680 × 3360 world units, six times the previous map area. The 420 × 560 pixel viewport follows your hero and includes a minimap showing troops, buildings, kings, and the camera bounds. Your keep is south; the enemy keep is north. Original pixel sprites and the retro interface remain.

## Champions and interface

Choose a champion before deployment; **New battle** returns to selection. All play controls now sit inside the game frame in a MOBA-style HUD: health/XP and portrait at bottom-left, clickable talents directly above the bottom-center Q/E/B skill bar, and six construction slots at bottom-right. Pause, fullscreen and new battle are on the in-frame top bar with gold and king health. The lower-left minimap stays in the battlefield. The wider 1260 × 800 camera viewport retains the vertical 1680 × 3360 world. Portraits, troop sprites, and distinct building sprites share the original pixel art in `art.js` and generated atlases.

An opposing AI champion now fights alongside the Crimson army. Choose **Recruit, Casual, Standard, Veteran, Elite, Master, Nightmare, or Warlord** before deployment. Higher tiers improve reaction time, retreating, wave support, ranged kiting, skill use, projectile evasion and adaptive base construction; harder tiers also have disclosed stat and economy bonuses. See [AI.md](AI.md) for the exact settings and behavior. Enemy name, level, behavior and respawn status are visible during the match.

Hover or keyboard-focus skills for details, and use the **?** control for help and the next class milestone. **F** or the fullscreen button expands the frame when supported. Small screens rearrange construction into a six-slot row below the skill bar, still within the same frame. Clicks on HUD buttons do not issue movement commands.

| Champion | Role | Q | E |
| --- | --- | --- | --- |
| Aldric | Durable melee Warden | Shield quake: area damage | Second wind: heal 80 |
| Sylva | Ranged Ranger | Piercing volley: strike up to four enemies | Quickdraw: faster attacks for five seconds |
| Orin | Ranged Arcanist with splash attacks | Arcane nova: damage a distant cluster | Blink: teleport forward |
| Nyx | Fast melee Shade | Shadow lunge: dash and strike | Siphon: damage up to three nearby enemies and steal health |

These are original characters inspired by the reference's distinct hero roles, with prototype balance. Browser visual QA was unavailable because the browser bridge could not connect; simulation checks cover all four heroes and rendering calls.

## Play

- WASD / arrow keys or click the field: move the Warden.
- Automatically strike nearby enemies; Space keeps focus on combat without scrolling.
- Q / E: champion-specific abilities; see the HUD for cooldowns.
- Select a building with a button or key, then click an open tile in the southern base to place it. Escape cancels. Gold is spent only when placement succeeds.
- 1: barracks (100), 2: archery (140), 3: mage tower (200), 4: merchant (160), 5: guard tower (180).
- 6: equipment upgrade (180, then +100 per level). Requires a living merchant; adds 12% hero/army damage and 10 hero health.
- B: recall to base after 3 seconds. Moving cancels recall.
- P: pause. Restart resets the battle.
- Protect your king and defeat the enemy king. Fallen heroes respawn in 8 seconds. Heal gradually near your base.

Both sides start with a barracks and guard tower. Barracks recruit soldiers every 8 seconds; archery recruits archers every 10 seconds; mage towers recruit wizards every 13 seconds. Wizards deal splash damage. Recruitment pauses at 60 troops per side. Units independently seek enemies and march toward the opposing king. All buildings have health and can be destroyed, stopping their recruitment or defense. Guard towers attack enemies in range. The enemy adds a structure every 30 seconds up to 12 buildings, then improves equipment. Gold accrues over time; hero last hits grant extra gold and XP. Leveling improves hero health and damage.

## Research / scope

Primary source: [Starrows by Arkounay, official Google Play listing](https://play.google.com/store/apps/details?id=com.outerark.starrows), researched October 18, 2026. The developer describes a solo-oriented MOBA / action RTS: control one hero, spend gold on buildings, recruit independent units, improve combat stats through merchants, earn extra gold and experience from last hits, defend your king and defeat the opposing king.

This prototype adapts the documented hero/army/base/merchant/last-hit loop with original art and balance. Exact Starrows map dimensions and internal balance were not available from the developer listing; the larger map and camera are prototype design choices. Four heroes and one battlefield are implemented. Sound, mobile movement controls, saved progression and general obstacle pathfinding remain future work. Keep walls and deep river areas now block movement; armies use gate and bridge waypoints. Forest props remain decorative.

## Files

- `game.js`: simulation, AI, combat, rendering, input and UI.
- `art.js`: original pixel sprites shared by portraits, building icons, and battlefield units.
- `generated-art.js`: generated atlas loading and runtime sprite/terrain sampling, with procedural fallbacks.
- `animation-art.js`: generated four-direction walk and attack frames, plus projectile and impact sprites.
- `assets/art/`: generated heroes, troops, buildings, terrain, art-library page, and exact generation prompts.
- `style.css`: responsive interface.
- `index.html`: entry point.

No build, dependencies, external assets or account needed. Desktop keyboard and mouse recommended. Run `node verify.cjs` for simulation and rendering checks.

## Rewarding champion progression

Champions start each battle at level 1 and can reach level 20. XP and talent choices survive death. A new battle resets the build; progression is currently per battle, not saved between sessions.

- Hero last hits grant 30 XP for soldiers, 40 for archers, 55 for wizards, 120 for production/merchant buildings and 160 for towers. Enemies damaged by the hero within the last 8 seconds grant 40% assist XP when an ally finishes them. Unassisted army kills do not grant hero XP.
- Last hits within 10 seconds form a chain, adding 10% XP per extra kill up to +40%. Death or 10 seconds without a last hit resets the chain.
- XP needed for the next level is `80 + 35 × (level−1) + 5 × (level−1)²`. Three ordinary last hits reach level 2. Overflow carries forward, including across multiple levels.
- Each level grants 4% of the champion's starting health (rounded up), 5% of starting attack (rounded up), one talent point, a 10% max-health heal if alive and out of combat for 8 seconds, and `10 + 2 × new level` gold coins. It also reduces skill cooldowns by 0.5%; active cooldowns are not refreshed. Dead champions stay dead when earning XP from a projectile already in flight.
- Spend points through the talent buttons or **7 / 8 / 9**: Spellcraft gives +8% ability power per rank; Fortitude gives +20 HP and +1.5% armor; Alacrity gives +3% attack speed, +1% starting movement speed, and −2% ability cooldown. Each talent caps at rank 8. Total cooldown reduction caps at 30% and armor caps at 40%.
- Every fifth level adds a cumulative class bonus: Warden +40 HP / +2% armor; Ranger +20 range / +6% attack speed; Arcanist +15% spell power; Shade +12 movement speed / +6% lifesteal. Each milestone also adds 5% damage to allied troops and the hero.

The HUD shows XP, kill chains, available points, current combat stats and the next milestone. Floating XP, expanding gold rings and a reward banner make each level visible during combat.

## Animated combat

Each champion now uses eight generated walk frames and four attack frames in each of four directions. Walk phases advance with distance traveled and stay continuous through turns. Idle uses the same walk sheet to avoid changes in apparent size. Pixel-derived frame anchors align the feet and normalize reference body scale across sheets. Walk loops run only during actual movement; attacks play a 0.44-second anticipation/strike/recovery sequence. Walking retains its gait and movement direction during automatic attacks. The simulation clock freezes animations while paused. Static portraits keep using the standing character sheet.

Arrows and magic orbs now travel toward targets after a short attack wind-up; damage and wizard splash happen on impact. Warden and Shade attacks land after the wind-up and show sword/dagger slash effects. Each champion has a four-frame effect sequence. Army attacks also use the appropriate projectile or slash effect; army body sprites currently retain directional poses and movement bobbing.

Open [the animation viewer](assets/art/animations.html) to preview walk/attack sequences by direction. Exact generation prompts are in `assets/art/ANIMATION-PROMPTS.json`. Generated directional poses can have small alignment and perspective variations; browser visual QA remains unavailable in this environment.

The polished walk assets are `assets/art/*-walk-v2.png`; their exact built-in image generation prompts are in `assets/art/WALK-POLISH-PROMPTS.json`. `sprite-registration.js` supplies alpha-derived pivot data, generated non-destructively by `register-sprites.ps1`. Original v1 sheets are retained. The preview uses the same animation renderer and registration as the game.

See [BALANCE.md](BALANCE.md) for current siege rules, tower threat, stat values, and measured solo-versus-wave tests.

## Walled keeps, recovery, and death

Both kingdoms now occupy stone-walled baileys with corner bastions, bannered open gates, interior paving, gardens, braziers and a sanctuary fountain. The main road crosses the river at a broad central bridge; two narrower side crossings support flanking. Trees form side groves, with reeds along the banks and smaller rocks, fallen timber, shrubs and flowers outside the lane. `environment.js` owns the layout, collision and troop waypoints; `foliage-v1.png` and `fortifications-v1.png` supply the generated art.

Heroes heal anywhere inside their own keep walls at **6% max HP + 8 HP per second**, after four seconds without taking damage and while no living enemy troop is within 450 units. A sanctuary status label and green hero effect indicate active regeneration. Enemy territory and the open field do not heal the player.

Death displays an in-frame countdown and respawn progress bar. The timer is **8 + floor(level / 3) seconds**, stops while paused, and ends with a full-health return inside the friendly keep. Levels and talents are retained. Construction remains available while dead; movement and abilities resume after respawn.

The walls and river have collision, including swept movement for dashes, and troops route through the gates and crossings. New buildings must fit inside the friendly bailey. These changes preserve the tower balance checks. Exact environment art prompts are saved in `assets/art/ENVIRONMENT-PROMPTS.json`; generated sheets can be viewed in the art library.



## Gold coins economy

**Latest expansion:** see [STRATEGY.md](STRATEGY.md) for the merchant shop, hero passives/paths, troop counters and siege engines, timed construction and tiers, target/attack-move controls, two selectable maps, audio/animation feedback, and battle report. The expansion replaces the player's old generic equipment upgrade. Run both `node verify.cjs` and `node verify-strategy.cjs` to check the integrated build.

Start with 200 gold coins. Passive income is 1 coin per second (previously 5). Hero last hits pay 10 coins for troops, 25 for an enemy champion, and 35 for buildings. Army kills pay 3 coins for troops/champions and 15 for buildings. Level-ups pay 10 + 2 × new level coins. Building prices remain unchanged. Standard AI also earns 1 coin/second; difficulty multipliers retain their existing relative advantages.

