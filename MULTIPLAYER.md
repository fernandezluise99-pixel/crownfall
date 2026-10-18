# Four Kingdoms online play

Play at https://crownfall-dyhx.onrender.com or https://crownfall-online.onrender.com. Both connect to the same battle service.

Choose **Online · 2–4 players** on champion selection. Enter a name, create a room, and share its six-character code or invite link. Everyone chooses a champion and presses **Ready**; the host starts when 2–4 players are connected and ready. Each player commands a separate kingdom. Destroy rival keeps; the last standing kingdom wins.

## Single-player Four Kingdoms

In champion selection, choose **Four Kingdoms · you vs 3 AI commanders** under **Battlefield**, select a difficulty, and deploy. This runs entirely in the browser without a room or server connection. Three independent AI kingdoms build armies, buy upgrades, choose talents, use abilities, retreat, and fight each other. The eight difficulties affect reactions, retreat thresholds, economy, recruitment, and starting hero strength. Pause is available; destroying all three rival keeps wins, and losing your own keep ends the battle. Desktop and phone controls share the same map and rules as online play.

`node verify-skirmish.cjs` checks offline startup, AI economies and expansion at every difficulty, player movement/skills, pause, victory/defeat, and return to the original solo maps.

## Map and mechanics

Four Kingdoms is a 4200 × 4200 top-down battlefield. Jade (south), Crimson (north), Violet (west), and Amber (east) have walled keeps, open gates, a starting barracks, a guard tower, and a recovery sanctuary. North/south and east/west lanes meet at the Crown Crossroads. All four gates are traversable in both directions. Only occupied kingdoms participate.

Online matches include all four heroes and Q/E skills, auto-attacks and selected targets, attack-move/hold, recall, safe base regeneration, death/respawn, XP and levels, talents and level-5 paths, 1 coin/sec income, construction timers, towers, merchants/shop upgrades, production buildings, siege engines, repairs, building tiers, and army production. Each kingdom has a 36-troop and 12-building cap. Backdoor protection, king protection while towers remain, guard aggro/ramping, and reduced hero structure damage apply online. Solo mode remains separate.

The lobby reports readiness and connection state. Refreshing the same tab restores its session while the room still exists. Lost connections stop movement, and the player can reconnect within 90 seconds. An abandoned kingdom is eliminated after that grace period; the lobby host role transfers to another connected player. Active matches cannot be paused. Once the match ends, the host can return everyone to the lobby.

## Architecture and limits

`multiplayer-core.js` defines shared map/rules and the authoritative simulation. `server.cjs` owns rooms, validates commands, runs 20 simulation ticks/sec, and streams 10 snapshots/sec over authenticated HTTP event streams. Clients send intentions, not position, HP, gold, or damage. Browser rendering interpolates received positions. Guest tokens stay in session storage and are excluded from all public snapshots and invite links. There are no accounts or passwords.

Rooms are in memory on one process: restarting/redeploying the server clears rooms and ongoing matches. There is no cross-server matchmaking or persistent multiplayer progression. The service allows 12 simultaneous rooms, expires rooms after three hours, bounds commands/request sizes, validates build ownership and placement, and restricts browser API origins. These are prototype capacity limits, not a load-test guarantee.

## Running and deployment

Run `node build.cjs`, then `node server.cjs`, and open `http://localhost:3000`. No dependencies are required. The server listens on `0.0.0.0` and uses Render's `PORT`; `/health` returns readiness. `online-config.js` points the existing static frontend to the deployed battle service. Localhost always uses its own origin.

The Render web service uses the free compute plan in Singapore. An idle service can take time to wake on its next request. Both the server-hosted game and the existing static game can join the same room. Keep the server on a single instance unless room state is moved into shared infrastructure.

## Verification

- `node verify-online.cjs`: four-kingdom routes/collision, command validation, economy, progression, construction, abilities, siege balance, respawns, caps, five-minute four-player simulation, victory; real HTTP four-client room/stream, ready/host/capacity checks, reconnection, and rematch tests.
- `node verify-online-ui.cjs`: runs the actual browser controllers in a DOM/canvas harness against a real local server; creates a four-player room, starts the match, renders map/HUD, sends movement and abilities, checks cooldowns, opens the shop, leaves and restores solo selection. This does not replace visual browser QA.
- `node verify.cjs` and `node verify-strategy.cjs`: solo regression suites.

Browser screenshot/playtest automation remains unavailable in this workspace. Live checks separately verify published assets and four authenticated network clients.
