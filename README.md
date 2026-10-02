# Where Will the Magic Take Me?

A one-page site comparing four Disney vacations side by side (Walt Disney World, Disneyland Resort, Aulani, and Disney Cruise Line), with:

- **Price your dates:** pick travel dates, see which official events are on, enter the quotes you get from each official site, and see which trip is cheapest (with per-person, per-night, and budget checks)
- **Which trip fits you?:** a 4-question quiz (group, trip length, budget, vibe) that recommends one destination; the budget can be picked from a $ scale or typed in as a dollar amount

Built by **Marisa Vodrazka** assisted by **Claude** as a student portfolio project. Not affiliated with, endorsed by, or sponsored by The Walt Disney Company.

## What's inside

| File | Purpose |
|---|---|
| `index.html` | All page content, with semantic HTML and inline SVG icons |
| `styles.css` | Design tokens and mobile-first responsive layout |
| `script.js` | Quiz and price calculator logic (vanilla JavaScript) |
| `research.md` | Research notes: every fact, its official source, and the access date |

No frameworks or build step, and no image files. Fonts come from Google Fonts (Nunito Sans).

## Design

The visual language is inspired by the My Disney Experience app: white cards on a light gray page, navy type, a single action blue, pill-shaped buttons, chip-style tags, and pale periwinkle section bands. It's adapted for the web with a sticky top nav and a four-column comparison grid on desktop (rows aligned with CSS subgrid) that stacks on mobile. All icons are original drawings; no Disney logos, characters, or photos are used.

## Accessibility

- Semantic landmarks, a skip link, and a logical heading order
- Quiz uses real radio buttons inside `fieldset`/`legend`, so it works fully with the keyboard (Tab, arrow keys, Space, Enter)
- Focus moves to each new question and to the result; the step counter is announced to screen readers
- Text colors meet WCAG AA contrast; visible focus rings throughout
- Respects `prefers-reduced-motion`

## Pricing approach

Disney doesn't publish a single price list (prices vary by date and appear in its booking tools), so the calculator doesn't guess prices. Visitors enter real quotes, and the site does the math. A budget typed into the quiz is matched to the $ scale with a rough guide labeled on the page as my own estimate: under $250 per person per day is $, $250–$450 is $$, over $450 is $$$. Entries are saved only in the visitor's browser.

## Sources

All facts come from official Disney sites (disneyworld.disney.go.com, disneyland.disney.go.com, disneyaulani.com, disneycruise.disney.go.com), accessed September 30, 2026, and are written in my own words. "Best for," suggested trip lengths, and budget ratings are labeled on the page as my own assessment.

## Open TODOs

Search `index.html` for `TODO` to find these:

1. **Aulani trip length.** No official typical stay length was found. The page currently says "Flexible."
2. **Aulani best time to go.** No official seasonal events were found. The page currently points to the activities page.
3. **Disneyland Food & Wine Festival 2027.** Dates weren't posted yet. Add them to "Best time to go" once announced.
4. **Footer links.** Optionally add a LinkedIn profile link next to GitHub.
