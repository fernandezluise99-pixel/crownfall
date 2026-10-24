# Last Light — playable prototype

Open `last-light.html`, or follow **Play Last Light** in Crownfall's header. The two games use separate pages and scripts, and are built/deployed together. No new service, package, account, or database is required. Run `node build.cjs`, then `node server.cjs`, and visit `http://localhost:3000/last-light.html`.

Last Light is an original single-player survival card game informed by the researched AP/ammo/barricade design of Shelter. All content, art, and rules here are original prototype choices. The UI uses a complete set of 35 generated survival illustrations, material-based card frames, enemy and ally portraits, mission scenes, a battle-table background, and a lantern card back. The card-details dialog enlarges each illustration and its rules. See [the art guide](assets/art/LAST-LIGHT-ART-DIRECTION.md) and [full prompts](assets/art/LAST-LIGHT-PROMPTS.json).

## Playing

Select a mission and one ally. Deploy firearms by selecting a card and then an equipment slot. Select a deployed gun and then an enemy to fire. Select other cards and then their highlighted targets. Repair, stun, reload, or invest in future AP before ending the turn. The Field guide contains full rules. Cards, enemies, armor, ammunition, and next-action intentions are visible without hover. The hand scrolls horizontally on phones.

Clear the finite enemy deck and all active enemies to win. Choose one collection reward, edit the deck between encounters, and advance to the next mission. Missions can be replayed for additional card choices. Defeat gives no reward; retry with the same seed or adjust the loadout. Progress and active encounters save to the separate `last-light-save-v1` localStorage key. Closing/reopening restores the current encounter. If browser storage is blocked, a visible banner explains that play remains available without saving.

## Rules v1

- 50 survivor HP; 4 starting AP, refreshed each player turn. Unspent AP expires. Rations cost 3 AP and permanently add 1 AP from the next turn, capped at 6, then exhaust until the encounter ends.
- 20 base cards, at most two copies per card and within owned copies, plus one fixed five-card ally package. Six opening cards, with a guaranteed long-range firearm; two drawn on subsequent turns, up to an eight-card hand. No silent overflow discard. Discard reshuffles when necessary; deployed equipment and exhausted cards stay out of the draw pile.
- Five equipment slots. Guns remain in play, have limited ammunition, cost AP to fire, and fire once per turn. Reloads restore ammunition, not the firing action. Replacing a gun returns it and its modification to the discard pile. One modification per gun.
- Barricades start with 14/13/12 durability by mission and 1 armor. Armor absorbs each incoming hit; reinforcement caps at 3 armor. A destroyed barricade does not rebuild through ordinary repairs. Rebuild cards require an unoccupied breach.
- Existing enemies activate in stable lane order, breached enemies before approaching enemies. A barricade attack, advance into a breach, and survivor attack require separate activations. Occupied breaches block another advance. Delays skip a stated number of activations. A living Chorus adds 1 attack to other enemies, even if the Chorus is delayed.
- After enemy activations, the horde makes one spawn attempt per turn. Missions 2–3 make two attempts after turn 3. D6 successes: Drifter 5/6; Rushling 4/6; Ironback/Chorus 3/6. After two failed rolls, the third attempt succeeds. Failed rolls retain the top enemy. If every approach slot is occupied, spawning pauses without consuming an enemy. New arrivals cannot attack during that phase.
- Enemy defeat and survivor defeat are resolved before further actions. Victory requires an empty horde and no active enemies. Emergency strike costs 1 AP, deals 2 damage ignoring armor, and can hit a breached enemy once per turn.
- Complete health/barricade reset between missions. Rewards expand the collection rather than automatically diluting the active deck. A completed encounter can be settled only once. Rewards never raise ownership beyond two copies.

## Content

16 base card types, two allies (Mara the mechanic / Eli the scout) with five cards each, four enemy archetypes, and three missions. Later missions add more armored/support enemies and increase spawn pressure. Starter guns, AP cost, per-turn firing, ammunition, and barricade armor make target selection and setup matter.

## Initial tuning evidence

`node last-light-balance.cjs` runs a fixed greedy policy that uses only legal player commands and the unchanged starter deck. For seeds 1–100 at each mission and ally (600 complete encounters):

| Ally | Garage wins | Supply wins | Relay wins |
| --- | --- | --- | --- |
| Mechanic | 100/100 | 84/100 | 60/100 |
| Scout | 100/100 | 91/100 | 66/100 |

The first mission is deliberately forgiving. These are bot benchmarks, not measured human win rates. They do not establish optimal-play balance. Human feedback should include encounter seed, ally, deck, turn, and the surprising event. Focus the next tuning pass on repair usefulness, novice difficulty, ally parity, card-draw frustration, and whether late-game losses are predictable and recoverable.

## Verification

- `node verify-last-light.cjs`: command legality, resource boundaries, card conservation, opening gun, armor, stuns, breach timing, rebuilding, blocked spawning, spawn guarantee, reshuffle/exhaust, rewards, save/RNG continuation, and all 600 encounters.
- `node verify-last-light-ui.cjs`: executes the real page controller in a DOM harness, plays through deploy/fire/end-turn to victory/reward, exercises deck editing, reload/resume, help, and blocked storage. This is not visual browser QA.
- `node verify-last-light-http.cjs`: verifies the actual existing Node service returns both pages and all new assets correctly.
- Existing Crownfall and online tests remain applicable. `verify-live.cjs` now checks both games' runtime files and artwork.

The browser preview bridge was unavailable during implementation; visual verification in a real browser remains a follow-up check. No multiplayer, account sync, generated illustration set, or multi-run campaign persistence beyond this local three-mission prototype is claimed.
