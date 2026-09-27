# Letter sound credits

Every Letter sound clip in `src/assets/sounds/` comes from the US English letter sounds of **Feed The Monster** by [Curious Learning](https://www.curiouslearning.org/). One native US English voice says all of them. They are pinned to commit `b0f50ba` of the language packs:

<https://github.com/curiouslearning/ftm-languagepacks/tree/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters>

The Game task `npm run game my-letter sounds` downloads the raw files to `scripts/raw/` and makes the clips (ADR 0001). It trims silence, levels loudness, fades both ends, adds 150 ms of silence in front and saves a mono 96 kbps MP3. The cuts are in `scripts/sounds.ts`.

## Licences

The language pack repository's `LICENSE` is BSD 2-Clause. Its notice has to go with any binary redistribution:

> BSD 2-Clause License
>
> Copyright (c) 2020, Curious Learning
> All rights reserved.
>
> Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
>
> 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
>
> 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
>
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Curious Learning also puts the audio under CC BY. The [Feed The Monster JS README](https://github.com/curiouslearning/FeedTheMonsterJS#contributing) says:

> The Feed The Monster codebase is open source and we freely encourage others to extend, remix, or localize the content herein, including the audio and graphical content which is licensed under CC-BY.

and, of these language packs:

> All existing [language-specific images and audio](https://github.com/curiouslearning/ftm-languagepacks) can be downloaded and used as Creative Commons.

The [Feed The Monster core `LICENSE`](https://github.com/curiouslearning/FeedTheMonster/blob/master/LICENSE) says:

> All digital content included in this repository is released under a [Creative Commons Attribution License](https://creativecommons.org/licenses/by/4.0/legalcode) (CC-BY).
>
> Copyright (c) 2016 Originally developed by a consortium led by [Apps Factory](http://www.appsfactory.ro/), subsequent translations Copyright (c) 2017-2022 by [Curious Learning](https://www.curiouslearning.org/).

The language pack repository itself states only the BSD licence. The CC BY statements are in the two sister repositories quoted above.

**Attribution:** Letter sounds from Feed The Monster (US English) by Curious Learning, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and BSD 2-Clause, Copyright (c) 2020, Curious Learning. Trimmed, levelled and re-encoded; some are cut shorter (see below).

## Clips

"As is" means the whole recording: only silence trimmed, loudness levelled and ends faded. A clip that's still under 0.25 s is said twice with a 0.25 s gap, "b … b", so it's heard on a phone after the Voice. Durations include the 150 ms lead-in.

| Letter | File | Source file | Change | Said twice | Duration |
| --- | --- | --- | --- | --- | --- |
| A /æ/ | a.mp3 | [a.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/a.WAV) | as is | | 0.65 s |
| B /b/ | b.mp3 | [b.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/b.WAV) | vowel cut from ~240 ms to ~100 ms, faded | yes | 0.57 s |
| C /k/ | c.mp3 | [c.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/c.WAV) | as is (burst and breath, no vowel) | yes | 0.70 s |
| D /d/ | d.mp3 | [d.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/d.WAV) | vowel cut from ~230 ms to ~95 ms, faded | yes | 0.62 s |
| E /ɛ/ | e.mp3 | [e.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/e.WAV) | as is | | 0.52 s |
| F /f/ | f.mp3 | [f.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/f.WAV) | as is | | 0.47 s |
| G /g/ | g.mp3 | [g.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/g.WAV) | vowel cut from ~275 ms to ~95 ms, faded | yes | 0.63 s |
| H /h/ | h.mp3 | [h.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/h.WAV) | as is | | 0.49 s |
| I /ɪ/ | i.mp3 | [i.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/i.WAV) | as is | | 0.49 s |
| J /dʒ/ | j.mp3 | [j.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/j.WAV) | as is (keeps its ~170 ms vowel) | | 0.45 s |
| K /k/ | k.mp3 | [k.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/k.WAV) | vowel cut from ~195 ms to ~95 ms, faded | yes | 0.73 s |
| L /l/ | l.mp3 | [l.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/l.WAV) | as is | | 0.58 s |
| M /m/ | m.mp3 | [m.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/m.WAV) | as is | | 0.74 s |
| N /n/ | n.mp3 | [n.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/n.WAV) | as is | | 0.73 s |
| O /ɑ/ | o.mp3 | [o.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/o.WAV) | as is; the US "octopus" vowel | | 0.65 s |
| P /p/ | p.mp3 | [p.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/p.WAV) | burst and breath only; ~125 ms of vowel cut | yes | 0.49 s |
| Q /kw/ | q.mp3 | [qu.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/qu.WAV) | as is; the pack has no q.WAV | | 0.44 s |
| R /ɹ/ | r.mp3 | [r.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/r.WAV) | as is | | 0.67 s |
| S /s/ | s.mp3 | [s.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/s.WAV) | as is | | 0.72 s |
| T /t/ | t.mp3 | [t.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/t.WAV) | burst and breath only; ~75 ms of vowel cut | yes | 0.54 s |
| U /ʌ/ | u.mp3 | [u.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/u.WAV) | as is | | 0.52 s |
| V /v/ | v.mp3 | [v.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/v.WAV) | as is | | 0.54 s |
| W /w/ | w.mp3 | [w.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/w.WAV) | as is | | 0.46 s |
| X /ks/ | x.mp3 | [x.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/x.WAV) | as is | | 0.73 s |
| Y /j/ | y.mp3 | [y.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/y.WAV) | as is; the glide into a short vowel, "yeh" | | 0.46 s |
| Z /z/ | z.mp3 | [z.WAV](https://github.com/curiouslearning/ftm-languagepacks/blob/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/z.WAV) | as is | | 0.89 s |

The vowels, Q, X and Y were checked by their spectra (formants and voicing), not by ear. The cuts were placed the same way. Listen to each clip before shipping.

## ABC song

`src/assets/abc-song.mp3` is **Kara - ABCs** by [FourthWoods](https://freesound.org/people/FourthWoods/) on Freesound: a girl singing the Alphabet Song.

<https://freesound.org/s/439088/>

Licence: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). The Game task `npm run game my-letter song` downloads Freesound's high-quality MP3 preview (the original needs a login) to `scripts/raw/`, and makes the song (ADR 0005): mono, 1 s cut from the 1.7 s pause after Z, silence trimmed from the end and the last 0.3 s faded, levelled to -18 LUFS, 150 ms of silence in front, a 96 kbps MP3. 22.1 s long.

**Attribution:** "Kara - ABCs" by FourthWoods, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Shortened, trimmed, levelled and re-encoded.

When each letter is sung (`src/song.ts`) was measured by machine, not by ear. Listen to it with the board before shipping.
