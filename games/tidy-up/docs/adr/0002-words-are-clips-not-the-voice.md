---
status: accepted
---

# Words are clips, not the Voice

Tidy Up says one word at a time, "red" or "circle", and a two-year-old needs that word more than any sentence around it. The browser's speech (the site's Voice) is silent on the user's Linux computer and stalls every line there, and the user can't record voices. So every word the child needs is a recorded clip from Wikimedia Commons, played through the Sound, and the Game has no Voice at all: no instructions, no "Well done". The grown-up says the sentences, which the research says helps a child carry colors from the screen into the room.

Ten Words are one speaker's CC0 recordings on Lingua Libre; purple and triangle, which that speaker never recorded alone, are one Wiktionary speaker's, CC BY-SA 3.0. A first pick of a different speaker for the colors was dropped after speech recognition heard their "orange" as "all right" and their "purple" as "cool"; every clip now transcribes as its word. `npm run game tidy-up words` makes them, and `sounds.test.ts` fails a color or shape with no clip.
