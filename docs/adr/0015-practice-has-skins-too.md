---
status: accepted
---

# Practice has Skins too

Amends 0014. The user asked for Find It's beans to become jellybeans or other things, which is a Skin: a picture set a child picks, that changes looks and never what's asked. Skins had only lived on the level select's Group list, so their chips move to `src/shared/skins.ts` and `skins.css`, and both the Group list and Practice draw them from there. On Practice a Skin belongs to a Topic, since only some Topics have anything to dress (Find It's Numbers have beans, its Letters don't), and its chips sit under the Ways, as tall as they are, so Play still fits on a small phone. Each is one tap, like every other pick on Practice. We rejected Skins in the Grown-up Corner, which is the tedium ADR 0014 removed, and one Skin row for the whole Game, which would show on Topics it can't change. `look.test.ts` now counts the Skin chips' classes among those no Game restyles.
