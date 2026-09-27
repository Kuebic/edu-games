---
status: accepted
---

# The ABC song is a recording of a child singing

The Letter board sings the ABC song from a button under the letters, and each letter shakes as it's sung. The singing is a recording: "Kara - ABCs" by FourthWoods on Freesound, a girl singing the Alphabet Song, CC BY 4.0, credited in docs/sound-credits.md. A Game task (`npm run game my-letter song`) shortens the long pause after Z, trims the end, levels it and adds the Letter sounds' 150 ms lead-in. When each letter is sung is a table of times in `src/song.ts`, measured by machine on that file (Whisper's word times, then the dip in loudness before each syllable), and the board follows the clip's own clock (`time()` on the shared Sound's clip), so the shake stays with the voice on a slow phone.

We rejected the tune played by the Sound's notes, one per letter: it keeps perfect time and needs no file, but has no words, and the grown-up asked for singing. Browser speech can't sing, and says nothing on a device with no speech engine. A classroom recording (CC0) was noisier; the only one on Wikimedia Commons is the tune without words. A child's timing wanders, so the times are hers, not a beat: remake the song and they must be measured again.
