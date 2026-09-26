---
status: accepted
---

# Letter sounds are recorded clips from the web

A Letter sound plays from a short recorded clip in the Game, one per letter, never from the Voice. Browser speech says a bare /s/ or /b/ badly and differently on each phone: "buh" for /b/, a letter name for /s/. We rejected speech for that reason. We also rejected recording in the Grown-up Corner (a microphone, storage, and every device would need its own recordings) and waiting for the user to record 26 clips. The clips are Curious Learning's Feed The Monster US English letter sounds, one native US English voice, freely licensed (CC BY and BSD 2-Clause), trimmed and levelled with ffmpeg by a Game task and credited in docs/sound-credits.md. We first cut clips from Wikimedia Commons IPA recordings, but that was five voices, mostly not English speakers. Feed The Monster's stops carry a vowel ("buh"), so the task cuts it down to a breath. A letter with no clip that's good enough says only its name. Swapping in better clips later means only replacing files. A clip still shorter than a quarter of a second after trimming (the stops B, C, D, G, K, P and T) is said twice with a short gap, "b … b": on its own a stop went unheard on a phone after the Voice. Every clip starts with 150 ms of silence, since iOS drops the first moments of Web Audio when it switches over from speech.
