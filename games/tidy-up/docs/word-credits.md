# Word credits

Every Word clip in `src/assets/words/` is a free recording from [Wikimedia Commons](https://commons.wikimedia.org/). Ten are one speaker's, Grendelkhan, recorded with [Lingua Libre](https://lingualibre.org/) and dedicated to the public domain (CC0). Purple and triangle, which Grendelkhan never recorded on their own, are Wiktionary's recordings by Dvortygirl, under CC BY-SA 3.0.

The Game task `npm run game tidy-up words` downloads the raw files to `scripts/raw/` and makes the clips (ADR 0002). It trims silence, levels loudness, fades both ends, adds 150 ms of silence in front and saves a mono 96 kbps MP3. The sources are in `scripts/words.ts`; change one there and here together.

## Licences

CC0 needs no credit; it's given anyway. The two CC BY-SA 3.0 recordings need it, and the clips made from them are CC BY-SA 3.0 too:

**Attribution:** "purple" and "triangle" by Dvortygirl, from Wiktionary via Wikimedia Commons, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Trimmed, levelled and re-encoded.

## Clips

Durations include the 150 ms lead-in. Each clip was checked by speech recognition (faster-whisper `small.en`, no hint of the word), not by ear: all twelve transcribe as their word. Listen to each before shipping.

| Word | File | Source file | Speaker | Licence | Duration |
| --- | --- | --- | --- | --- | --- |
| red | red.mp3 | [LL-Q1860 (eng)-Grendelkhan-red.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-red.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.63 s |
| blue | blue.mp3 | [LL-Q1860 (eng)-Grendelkhan-blue.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-blue.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.56 s |
| yellow | yellow.mp3 | [LL-Q1860 (eng)-Grendelkhan-yellow.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-yellow.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.69 s |
| green | green.mp3 | [LL-Q1860 (eng)-Grendelkhan-green.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-green.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.73 s |
| orange | orange.mp3 | [LL-Q1860 (eng)-Grendelkhan-orange.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-orange.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.62 s |
| purple | purple.mp3 | [En-us-purple.ogg](https://commons.wikimedia.org/wiki/File:En-us-purple.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.95 s |
| pink | pink.mp3 | [LL-Q1860 (eng)-Grendelkhan-pink.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-pink.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.59 s |
| circle | circle.mp3 | [LL-Q1860 (eng)-Grendelkhan-circle.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-circle.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.64 s |
| square | square.mp3 | [LL-Q1860 (eng)-Grendelkhan-square.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-square.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.74 s |
| triangle | triangle.mp3 | [En-us-triangle.ogg](https://commons.wikimedia.org/wiki/File:En-us-triangle.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.88 s |
| star | star.mp3 | [LL-Q1860 (eng)-Grendelkhan-star.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-star.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.76 s |
| heart | heart.mp3 | [LL-Q1860 (eng)-Grendelkhan-heart.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-heart.wav) | Grendelkhan (Lingua Libre) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.50 s |
