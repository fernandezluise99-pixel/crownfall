# Shelter reference research and original game design

Research date: 24 October 2026. This is a design brief, not an implemented game. Crownfall is a separate project and is unchanged.

## Reference and evidence

The reference is Survivalist Games' mobile **Shelter: A Survival Card Game**, not the multiplayer bunker-debate game or Sheltered. Research used the developer's description and contemporary reviews; it did not include running the original executable, viewing a complete playthrough, or extracting its source/assets.

| Finding | Evidence |
| --- | --- |
| Single-player deck customization against an automated zombie deck using rules and dice; rewards expand the collection. | [Developer overview](https://www.survivalistgames.co.uk/shelter/) |
| Five-column, three-row board: enemies above, barricades between, deployed weapons below. Barricades have durability and per-attack armor. Survivor health is reported as 50. | [Hardcore Droid review](https://www.hardcoredroid.com/shelter-review/) |
| Action points pay for cards and deployed-item actions. Missions branch into optional resupply and survivor encounters. | [148Apps review](https://www.148apps.com/shelter-scg/shelter-review/) |
| Guns persist with limited ammunition; melee cards are consumable. Reloading and modifications support weapon strategies. | [Hardcore Droid review](https://www.hardcoredroid.com/shelter-review/) |
| AP refreshes each turn; breaches allow closer enemies to threaten survivor health. Allies bring additional card options. | [Contemporary hands-on review](https://geekgirls.fi/wp/blog/2013/08/11/shelter/) |
| Campaign encounters are selected from map markers, and tutorial presentation was criticized as slow. | [Jay Is Games review](https://jayisgames.com/review/shelter.php) |

The developer advertised over 100 cards, allies, a deck builder, and five campaign levels. These establish the larger product scope, not the minimum needed to reproduce its strategic appeal. The later physical adaptation is a separate edition; its rules should not silently fill gaps in the mobile rules.

## What remains unverified

Exact starting AP, draw/refill policy, deck size and copy limits, legal firing targets across lanes, attack/advance/spawn ordering, armor edge cases, exhaustion/reshuffle rules, dice thresholds, ally selection limits, and every card's numerical balance remain unverified. A review describes six cards being dealt, but does not establish the full draw rule. A working reconstruction should choose explicit original rules instead of labeling guesses as the original game's rules.

## Why the design works — interpretation

Three resources compete: AP controls tempo, ammunition limits sustained damage, and barricade durability buys time. A card in hand is also an opportunity cost: carrying too many reloads delays finding guns, while too many guns can leave the player unable to maintain defenses. Persistent guns turn early investment into later efficiency; emergency attacks rescue bad turns at the cost of future resources. Five lanes turn one health total into several simultaneous deadlines.

Armor can make chip attacks ineffective, creating reasons to carry penetration or heavier attacks. Stun and traps can purchase a turn when killing is too expensive. Between encounters, collection rewards let players change the answer to the next mission rather than only increase a numerical level. These are design interpretations of the observed systems, not claims about hidden implementation.

## Original game direction

Working title: **Last Light**. A survivor convoy crosses a ruined floodplain, defending temporary safehouses while searching for a working evacuation beacon. Use original survivors, dialogue, card names, illustrations, UI, audio, and mission layouts. Preserve the broad AP/ammo/barricade decisions, while making intent and timing clearer.

Presentation: an illustrated tabletop with distressed ink-and-paper cards, muted olive and rust, warm lantern light, and restrained red threat indicators. It should feel different from Crownfall's pixel-art battlefield. Each card exposes AP cost, damage, ammunition or duration, target restrictions, and a concise effect sentence.

## Proposed prototype rules — original tuning, not verified Shelter values

### Board and resources

- Five independent defense lanes; each has an enemy approach position and a barricade/breach position. A separate five-slot equipment row holds persistent weapons.
- Survivor health starts at 50. Each starting barricade has 12 durability and 1 armor.
- Start each player turn with 4 AP, including the opening turn. Unspent AP expires. Permanent AP improvements cap at 6.
- A deck contains 20 player-selected base cards plus one selected ally's five-card package. A base card has a maximum of two copies, subject to collection ownership.
- Draw six cards initially; draw two on subsequent turns, up to an eight-card hand. Draw actions do not silently discard overflow. When the draw pile empties, shuffle the discard pile; deployed/attached cards stay in play.

### Explicit turn order

1. Refresh AP and resolve start-of-turn effects; draw where applicable.
2. Player deploys cards, activates weapons, chooses targets, and repairs defenses in any affordable order.
3. Show a preview before committing End Turn: likely damage, threatened barricades, and enemy advances.
4. Resolve existing enemies in stable lane order. A distant enemy attacks its barricade. Destroying it does not also advance that enemy. On a later activation, that enemy advances into the breach instead of attacking. On subsequent activations it damages survivor health.
5. Resolve enemy spawn attempts from the mission's finite enemy deck into legal approach slots. Newly spawned enemies cannot attack during the same phase.
6. Remove defeated enemies and expired effects, check defeat, then check victory. Victory requires no active enemies and no remaining enemy cards.

Enemy activation order and breach timing must be shown in the tutorial and event log. The prototype's random rolls use a seed so a reported encounter can be replayed. Spawn rules and blocked-slot behavior must be explicit in code and tests; do not hide extra enemy spawns as difficulty scaling.

### Card families

| Family | Purpose | Example original card |
| --- | --- | --- |
| Firearm | Persistent weapon with a deployment cost, fire cost, magazine, and targeting rule | Service Revolver: economical single-target shots |
| Heavy firearm | Burst or armor-breaking damage with expensive setup | Breach Gun: powerful close-range shot |
| Melee | Single-use emergency response, restricted to a breached enemy | Wrecking Bar: damage and pushback |
| Reload | Restores ammunition to a chosen deployed weapon | Spare Magazine |
| Barricade repair | Restores existing durability within its maximum | Salvaged Boards |
| Reinforcement | Improves maximum durability or per-hit armor | Steel Bracing |
| Control | Trades immediate damage for time | Snare Wire: delay a lane's next activation |
| Modification | Gives a deployed weapon a specialized role | Penetrator Kit: ignores a stated amount of armor |
| Tempo | Converts a card or AP now into future efficiency | Field Rations: limited AP acceleration |

Do not make every weapon merely a damage upgrade. Tune deployment AP, fire AP, ammunition, reach, armor handling, and special effects independently. Include a weak always-available emergency attack so a run cannot become mechanically stuck with no legal actions; it must remain worse than building a functioning deck.

### Enemies and missions

First enemies: shambling basic attacker, low-health fast attacker, slow armored attacker, and a support enemy that strengthens another lane. Give each visible health, armor, attack, activation intent, and status durations. Add more exotic behavior only after the basic resource economy is enjoyable.

First missions: an onboarding garage defense, a supply-store encounter introducing armor, and a relay-station defense mixing multiple enemy roles. Reward victory with a choice of one of three cards. Deck editing occurs between encounters; rewards expand the collection rather than forcibly diluting the active deck.

Two first allies: a mechanic with repair/fortification options and a scout with control/draw options. Each adds five original themed cards. The player selects one before a mission. Keep defeat/retry behavior clear: no reward on defeat and a visible choice to adjust the deck before retrying.

## First playable scope

One responsive battle screen, five lanes, AP and ammo, persistent guns, consumable cards, finite enemy deck, explicit enemy phases, victory/defeat/retry, a simple deck editor, 16 base card definitions, two five-card ally packages, four enemy types, three missions, reward selection, local save, and a short interactive tutorial.

Use placeholder original card illustrations during mechanics validation; generate a coherent final art set after card identities stabilize. On phones, keep the five-lane battle readable and put the hand in a horizontal scroll tray, with tap-to-select and tap-to-target. Show enlarged card details on demand and a prominent End Turn button. Avoid requiring hover or drag-only interactions.

## Implementation structure

- A deterministic rules module owns state and validates commands. Rendering must not apply damage, consume ammunition, or decide random outcomes.
- Data definitions describe cards, enemies, allies, and missions separately from the rules.
- Commands: play card, select target, fire weapon, emergency attack, end turn, choose reward, edit deck, start mission.
- Events: card drawn, AP spent, weapon deployed, ammo spent, damage absorbed, barricade destroyed, enemy advanced, survivor damaged, reward offered.
- Local saves use a schema version and store collection, deck, ally selection, and campaign progress. Mid-battle saves also include the RNG seed/state and turn phase.
- Automated checks cover AP/ammo overspend, target legality, armor, breach grace timing, empty decks, attachment ownership, ally packages, defeated-enemy activation, victory only after the full horde is cleared, and save/load round trips.

## Balancing questions for the first playtest

Can a balanced starter deck win reliably without a lucky opening? Does repair sometimes beat shooting, without producing an endless stall? Are depleted guns still worth reloading? Do armored enemies encourage specialization without invalidating the starter deck? Does choosing an ally change decisions? Can a new player predict what End Turn will do? Can the player recover from one breached lane without an automatic loss?

The next implementation milestone is this small battle/deck/reward loop. A large campaign, extensive card collection, multiplayer, monetization, and final illustration production should follow evidence that the tactical loop works.
