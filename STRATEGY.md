# Strategic expansion

The current build loads `strategy-art.js` and `strategy.js` after the original game. Start a new battle after refreshing to use the new systems. Everything remains local and dependency-free.

## Merchant and economy

Construct a merchant (160 coins, eight seconds). Open **Merchant** or press **6**. Each purchase has three ranks; subsequent ranks cost 65% of the initial cost more per rank:

| Purchase | First cost | Per rank |
|---|---:|---|
| Tempered blade | 100 | +6 hero attack |
| Runic mail | 110 | +25 max HP, +2% armor |
| Field medicine | 90 | +1.5 HP/s after eight seconds without damage |
| Army weapons | 140 | +10% troop damage |
| Army endurance | 140 | +15% original troop HP, existing and future troops |
| Recruitment drill | 160 | 10 percentage points faster recruitment, up to 30% |

This replaces the player's unlimited generic equipment button. Starting coins and passive income remain 200 and 1/s. Hero purchases do not remove backdoor or king defenses.

## Troops and buildings

Soldiers take 20% less archer damage and deal 30% more to archers. Archers deal 40% more to wizards; wizards deal 35% more to soldiers and retain splash. Troop targeting favors their roles within local combat range. Siege engines prioritize nearby structures, move slowly, fire every three seconds, and deal 2.5× base damage to buildings versus 0.4× to units. Their 300 range leaves them vulnerable to towers. A siege workshop costs 260 and recruits every 22 seconds after its eight-second construction.

New buildings require eight seconds; towers require twelve. Starting buildings are already complete. Enemy construction also takes time. Click friendly buildings to inspect HP, construction/production progress, upgrade, repair, or demolish. The inspection panel updates live.

Tier 2 requires a finished merchant; tier 3 also requires hero level 8. Upgrades take eight seconds, pause production, and cost 80% of original building price multiplied by current tier. Each tier adds 25% original building HP, improves tower attack by 15%, speeds production by 15 percentage points, and gives new recruits 15% original HP and damage. Repair restores up to 30% max HP for 20% original price (minimum 20). Demolition returns 40% original cost. Maximum tier is 3.

## Hero identity

Each hero has a passive from level 1 and can choose one of two permanent paths at level 5 using **Hero path**:

| Hero | Passive | Paths |
|---|---|---|
| Aldric | 8% less non-guard damage while stationary | Bastion: armor and protection aura; Earthshaker: ability damage and slows |
| Sylva | 15% more basic damage beyond 180 range | Deadeye: range/attack speed; Trailblazer: speed and movement during Quickdraw |
| Orin | Every fourth basic hit deals 35% more damage | Pyromancer: spell power; Spellweaver: shorter cooldowns and healing blink |
| Nyx | 20% more basic damage after four seconds without a basic hit | Executioner: damage against wounded targets; Reaper: lifesteal and speed |

Enemy heroes spend one talent point per level in a capped rotating allocation, receive class milestones at 5/10/15/20, choose a path at 5, and use spell/attack/cooldown bonuses. Difficulty stat/economy bonuses remain disclosed. Enemy expansion has a budget and higher difficulties can construct a siege workshop.

## Controls, maps, and feedback

Click an enemy to select and follow it. **T**, then click, orders attack-move; the hero engages nearby enemies and resumes the route after they fall. **H** holds position with auto-attacks enabled. WASD returns to direct control. Click movement follows gate/bridge waypoints. Recall clears movement orders.

Select **Verdant Front** (three crossings) or **Stone Narrows** (two narrow crossings) before deployment. Crossings change collision, routes, bridges, and approach roads. Both preserve vertical north/south play and fortified keeps.

Troops have procedural gait/attack overlays; siege engines have original pixel silhouettes and traveling stone projectiles. Floating damage, death bursts, and synthesized attack/impact/ability/build/level/death sounds improve feedback. Use **Sound** to mute. No downloaded audio or new dependencies are required.

Victory/defeat opens a battle report with time, hero level, difficulty/map, last hits, deaths, earned coins, structure damage, hero combat damage, army losses, upgrades, and construction totals. Match upgrades reset between battles.

## Verification

Run `node verify.cjs` for the original regression suite and `node verify-strategy.cjs` for integrated merchant/building/progression/input/map/siege/report tests, original solo-dive checks, and eight 10-minute simulations (four heroes × two maps). Browser visual/audio QA could not run because the browser connection was unavailable; UI layout and sound should still receive a manual playtest.
