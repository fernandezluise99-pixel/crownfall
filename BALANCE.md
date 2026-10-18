# Siege balance pass

Early heroes should fight units and support a wave, rather than tank towers. Level and talent rewards remain valuable, but buildings require an army push.

| Champion | Starting HP | Attack | Basic interval |
| --- | ---: | ---: | ---: |
| Aldric | 300 | 28 | 0.75s |
| Sylva | 200 | 22 | 0.80s |
| Orin | 190 | 28 | 1.05s |
| Nyx | 220 | 32 | 0.55s |

Each level grants 4% starting HP and 5% starting attack, rounded up. Spellcraft grants 8% ability power per rank. Fortitude grants 20 HP / 1.5% armor. Alacrity grants 3% attack speed, 1% starting move speed and 2% cooldown reduction. Total armor caps at 40%, cooldown reduction at 30%. Aldric's five-level milestone grants 40 HP / 2% armor. Other milestone identities are unchanged.

Level-up healing is 10% maximum HP only after eight seconds without taking damage. Leveling does not reset active cooldowns. Equipment gives 12% damage and 10 HP per purchase; its small heal also requires being out of combat. Aldric's E restores 80 HP before spell scaling and has an 18-second base cooldown. Base regeneration restores 6% max HP + 8 per second inside the friendly walls, after four seconds without damage and with no enemy troop within 450 units. Recall is interrupted by incoming damage. Projectile deaths now start the respawn timer immediately; base respawn time is eight seconds plus one per three hero levels.

## Tower and base rules

- Towers: 1400 HP, 100 base damage, 380 range, one shot per 1.15 seconds. They outrange heroes, including the Ranger's maximum basic range.
- Repeated shots on the same hero ramp to 135%, 170%, then 205% damage. Ramp resets on a different target or a four-second break. Guard damage ignores 80% of hero armor.
- Towers prefer troops when choosing a new target, then hold that target until it dies or leaves range. A troop walking closer does not pull an existing lock away from the hero.
- Hero basics deal 50% damage to buildings; hero abilities deal 20%. Infantry, ranged units and wizards retain their normal building damage before protection.
- Without opposing troops within 450 units, buildings and kings take 85% less damage. Troops disable that protection for their push and leave a three-second grace window after disappearing.
- Unsupported towers and kings regenerate 1.5% maximum HP per second after five seconds without damage. This prevents repeated solo chip dives from being an efficient siege strategy.
- Kings: 2200 HP, 85 base damage and 360 range, using guard targeting/ramp rules. Their damage taken is further reduced by 75% while any friendly tower remains standing.
- Nearby hostile tower range is drawn in the field. Fortified towers show a troop requirement; a red in-frame warning announces hero aggro.

## Reproducible checks

`node verify.cjs` tests all four heroes at level 4 with each of the three talent allocations. Every unsupported solo dive fails. The isolated scenarios remove production and extra defenders to test the tower itself; normal base defenses can add more danger. Tests do not model player reaction or retreat skill.

At full health with three Fortitude ranks and automatic Q / Aldric E use:

| Level-4 champion | Support | Outcome | Tower HP left |
| --- | --- | --- | ---: |
| Aldric | none | Dies at 3.8s | 1385 / 1400 |
| Sylva | none | Dies at 2.6s | 1392 / 1400 |
| Orin | none | Dies at 2.6s | 1389 / 1400 |
| Nyx | none | Dies at 2.7s | 1397 / 1400 |
| Aldric | 8 soldiers | Survives; tower falls at 12.4s | 0 |

Regression checks cover wave support, structure reductions, backdoor regeneration, locked aggro, king protection, in-combat level rewards and projectile deaths. This is a measured prototype balance pass; match pacing and mixed armies still benefit from human playtesting.

