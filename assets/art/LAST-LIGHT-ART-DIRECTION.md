# Last Light illustrated set v1

Generated with the built-in imagegen tool for the original Last Light survival card game. The complete prompt set and asset mapping are in `LAST-LIGHT-PROMPTS.json`.

## Visual language

A grounded survival illustration set with graphic-novel ink edges, rich worn-material detail, muted olive/charcoal shadows, rust-red accents, parchment text panels, oxidized brass frames, and selective amber lantern light. Art is full-bleed and contains no baked card rules or costs. Card text remains accessible HTML so balancing does not require regenerating images.

## Complete coverage

- 24 unique supply illustrations: all 16 base card designs and eight distinct ally card designs. Identical copies of a card share their illustration; different designs do not.
- Four enemy portraits: Drifter, Rushling, Ironback, and Chorus, with visibly different poses and silhouettes.
- Two survivor portraits: Mara Voss and Eli Reed.
- Three mission establishing scenes: garage, flooded supply store, and relay station.
- One safehouse battle-table background.
- One ornamental lantern card-back design, used on supply counters.

## Card hierarchy

AP cost is presented in a large brass-edged medallion. The illustration occupies the upper card window, followed by the title, readable rules panel, and compact combat statistics. Weapons use brass/ochre frames; attacks use rust; repair and fortification use moss; control uses blue-green; ally cards add a jade edge. Type names and descriptions identify functions independently of color.

Enemies retain visible HP, armor, and intent outside their portrait window. Deployed equipment uses the same art as its corresponding card. Targets retain their existing high-contrast outline. The card-details dialog provides a larger illustration and full rules on both desktop and phones.

## Files and delivery

Generated full-resolution originals: `assets/art/last-light-*-v1.png` (35 files). They remain untouched locally. Web delivery copies: `assets/art/last-light-*-v1.jpg` (35 files), exported at the same dimensions with JPEG quality 87. Encoding changes delivery size, not composition. `export-last-light-art.ps1` regenerates missing delivery files without overwriting existing versions.

Only the JPEG delivery copies are added to the deployment/repository for this set. The build includes the original Crownfall PNG assets and the Last Light JPEG set, without publishing the large Last Light source PNGs. The main hero loads eagerly; other illustrations load lazily. A failed image reveals the original vector fallback without removing card text or controls.

## Verification

`verify-last-light-art.cjs` checks all 35 mappings, source PNGs, delivery JPEGs, coverage, total delivery size, loading policy, detail-dialog behavior, and UI integration. The existing UI-flow test now loads the actual art script and exercises the larger card-details dialog. The HTTP test covers the new runtime scripts and stylesheet; live verification checks the deployed JPEG set as well as existing artwork.

The browser preview bridge remains unavailable in this session. Generated images were inspected individually; final in-browser layout verification is not claimed.
