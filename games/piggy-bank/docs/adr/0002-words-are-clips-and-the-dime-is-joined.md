---
status: accepted
---

# Words are clips, and the dime is joined

As in Tidy Up (its ADR 0002), the Game has no Voice: every word the child needs is one recorded name, played through the Sound. Browser speech is silent on the user's Linux computer, the user can't record voices, and a two-year-old needs the name more than a sentence around it.

Penny, quarter and dollar are Grendelkhan's CC0 recordings on Lingua Libre, the speaker of most of Tidy Up's Words. Nickel is a Wiktionary speaker's, CC BY-SA 3.0. Nobody on Commons has recorded a US "dime" by itself: the only one is Australian, and cuts from "nickel and dime" come out as "time". So `npm run game piggy-bank words` joins the "d" of Grendelkhan's "die" to the "ime" of his "crime", both CC0, with an 8 ms cross-fade. Speech recognition (faster-whisper, small.en and medium.en) heard "dime" in each of the nine cuts tried, and heard all five shipped clips as their words. A person still has to listen to it: if it sounds wrong, the Australian clip is the fallback.
