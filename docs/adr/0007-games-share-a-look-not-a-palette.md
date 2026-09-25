---
status: accepted
---

# Games share a look, not a palette

Every Game loads `src/shared/base.css`, which draws the Shared look: font, header, House button, tool buttons, Next button, gear hold, safe areas and a reduced-motion floor. Games opt in with `site-*` classes and override `--site-*` tokens. Each Game keeps its own palette, page background, art and celebrations, because Skins change page colours at runtime and each Game is its own world. We rejected Category colours as Game accents (four Logic Games would turn the same green) and a full shared component kit (level cards and confetti already match, and sharing them adds coupling). The house picture means the Hub and nothing else, because pre-readers navigate by pictures. `src/shared/look.test.ts` keeps Games from drifting back.

Amended by 0008: the level select and its Skin chips are shared.
