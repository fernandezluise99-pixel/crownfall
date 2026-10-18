# Enemy champion and difficulty

Select one of eight difficulties on the champion selection screen before deploying. The choice is locked during the match and preserved when starting a new battle.

| Difficulty | Decision interval | Retreat HP | Construction interval | Gold/sec | Enemy hero/troop HP & ATK | Recruit interval multiplier |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Recruit | 1.30s | 10% | 48s | 0.7 | 80% | 1.30× |
| Casual | 1.00s | 16% | 39s | 0.8 | 90% | 1.15× |
| Standard | 0.70s | 24% | 30s | 1 | 100% | 1.00× |
| Veteran | 0.50s | 30% | 26s | 1.1 | 105% | 0.95× |
| Elite | 0.35s | 34% | 22s | 1.2 | 110% | 0.90× |
| Master | 0.23s | 38% | 19s | 1.3 | 116% | 0.85× |
| Nightmare | 0.16s | 42% | 16s | 1.5 | 123% | 0.80× |
| Warlord | 0.10s | 46% | 14s | 1.8 | 130% | 0.75× |

Tower and king base stats are unchanged across difficulty tiers. Bonuses affect newly recruited enemy troops and the enemy champion and are disclosed on the selection screen. Faster recruitment means shorter spawn intervals, not larger waves. Buildings cost gold; the enemy cannot construct or upgrade without enough budget.

## Champion behavior

The enemy chooses an opposing archetype: Ranger against Aldric, Arcanist against Sylva, Shade against Orin, and Warden against Nyx. It uses the existing generated hero sprites and animation sheets, a red health bar, an enemy name/level label and a HUD behavior readout.

- All tiers assemble with troops, fight local targets, retreat at their threshold, heal safely inside their own walls, gain experience and respawn after death.
- Recruit does not cast abilities. Casual and above use class-specific Q/E abilities.
- Standard and above prefer low-health targets, retreat under hostile guard focus and wait for wave support before sieging protected structures.
- Veteran and above kite when ranged, pursue weakened visible heroes and adapt production to infantry pressure or base threats.
- Master and above attempt lateral evasion when a hostile ranged projectile comes within 160 units, with a 1.5-second dodge decision cooldown.
- The champion senses combat targets within 620 units and nearby friendly waves within 850 units. Global troop counts and base structures inform production; no fog-of-war system is implemented.

Enemy champion XP comes from its kills and nearby allied kills. Its levels increase health/damage using the same base growth percentages as player champions. It does not spend the player's talent tree or receive the player's five-level class bonuses. Its respawn timer is 10 + floor(level / 3) seconds. Champions on either side cannot disable backdoor protection by themselves; guard shots ramp against either champion.

`node verify.cjs` checks all eight configurations, difficulty locking, ranged kiting, retreats, projectile evasion, spending limits, champion leveling/respawning and one minute of simulation at every tier. Existing solo-dive and wave-supported siege regression scenarios still pass at Standard difficulty. Match-wide difficulty calibration remains subject to playtesting.

