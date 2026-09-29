# Word credits

Every Word clip in `src/assets/words/` is a free recording from [Wikimedia Commons](https://commons.wikimedia.org/): the colors and shapes, Kinds' group words, and each Kinds Thing's name. Most are one speaker's, Grendelkhan, recorded with [Lingua Libre](https://lingualibre.org/) and dedicated to the public domain (CC0). The rest are Wiktionary's recordings (`En-us-*.ogg`) or other Lingua Libre speakers', where Grendelkhan never recorded the word, or where speech recognition heard Grendelkhan's as another word.

The Game task `npm run game tidy-up words` downloads the raw files to `scripts/raw/` and makes the clips (ADR 0002, ADR 0003). It trims silence, levels loudness, fades both ends, adds 150 ms of silence in front and saves a mono 96 kbps MP3. The sources are in `scripts/words.ts`; change one there and here together. The licences and authors below were read from each file's Commons page on 2026-09-29.

## Licences

CC0 and public domain need no credit; it's given anyway. The CC BY-SA recordings need it, and the clips made from them are under the same licence:

- flamingo: by Benluks, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- balloon, banana, bike, blueberry, cactus, cherry, chick, croissant, cucumber, drum, eagle, eggplant, giraffe, goggles, lettuce, mammal, onion, owl, palm, parrot, peach, peacock, pear, penguin, pineapple, potato, purple, rooster, strawberry, swan, tomato, tractor, triangle: by Dvortygirl, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- pretzel: by EncycloPetey, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- vegetables: by Neskaya, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- kangaroo: by No machine-readable author provided. Dean14~commonswiki assumed (based on copyright claims)., [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- carrot, yo-yo, zebra: by No machine-readable author provided. Dvortygirl assumed (based on copyright claims)., [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- fire truck, shorts: by Persent101, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- mango: by Sylvanmoon, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- clover, pasta, sunflower: by Vealhurl, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Each trimmed, levelled and re-encoded.

## Clips

Durations include the 150 ms lead-in. Each clip was checked by speech recognition (faster-whisper `small.en`), not by ear: every one transcribes as its word, most with no hint and the rest with the Game's word list as a hint, as short words alone are often heard as others ("bus" as "bye"). Recordings that didn't pass even with the hint were replaced or their Thing was left out (dice, kite, peas). Listen to each before shipping.

| Word | File | Source file | Speaker | Licence | Duration |
| --- | --- | --- | --- | --- | --- |
| ambulance | ambulance.mp3 | [LL-Q1860 (eng)-Grendelkhan-ambulance.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-ambulance.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.84 s |
| animals | animals.mp3 | [LL-Q1860 (eng)-Grendelkhan-animals.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-animals.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.74 s |
| apple | apple.mp3 | [LL-Q1860 (eng)-Grendelkhan-apple.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-apple.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.62 s |
| ball | ball.mp3 | [LL-Q1860 (eng)-Grendelkhan-ball.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-ball.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.60 s |
| balloon | balloon.mp3 | [En-us-balloon.ogg](https://commons.wikimedia.org/wiki/File:En-us-balloon.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.77 s |
| banana | banana.mp3 | [En-us-banana.ogg](https://commons.wikimedia.org/wiki/File:En-us-banana.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.74 s |
| bat | bat.mp3 | [LL-Q1860 (eng)-Grendelkhan-bat.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-bat.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.39 s |
| bike | bike.mp3 | [En-us-bike.ogg](https://commons.wikimedia.org/wiki/File:En-us-bike.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.06 s |
| bird | bird.mp3 | [LL-Q1860 (eng)-Grendelkhan-bird.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-bird.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.55 s |
| birds | birds.mp3 | [LL-Q1860 (eng)-Grendelkhan-birds.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-birds.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.67 s |
| blue | blue.mp3 | [LL-Q1860 (eng)-Grendelkhan-blue.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-blue.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.56 s |
| blueberry | blueberry.mp3 | [En-us-blueberry.ogg](https://commons.wikimedia.org/wiki/File:En-us-blueberry.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.25 s |
| boat | boat.mp3 | [LL-Q1860 (eng)-Grendelkhan-boat.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-boat.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.45 s |
| bread | bread.mp3 | [LL-Q1860 (eng)-Grendelkhan-bread.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-bread.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.50 s |
| broccoli | broccoli.mp3 | [En-us-broccoli.ogg](https://commons.wikimedia.org/wiki/File:En-us-broccoli.ogg) | DroEsperanto | [Public domain](https://en.wikipedia.org/wiki/Public_domain) | 1.45 s |
| bus | bus.mp3 | [LL-Q1860 (eng)-Grendelkhan-bus.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-bus.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.54 s |
| cactus | cactus.mp3 | [En-us-cactus.ogg](https://commons.wikimedia.org/wiki/File:En-us-cactus.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.11 s |
| cap | cap.mp3 | [LL-Q1860 (eng)-Grendelkhan-cap.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-cap.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.49 s |
| car | car.mp3 | [LL-Q1860 (eng)-Grendelkhan-car.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-car.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.56 s |
| carrot | carrot.mp3 | [En-us-carrot.ogg](https://commons.wikimedia.org/wiki/File:En-us-carrot.ogg) | No machine-readable author provided. Dvortygirl assumed (based on copyright claims). | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.62 s |
| cat | cat.mp3 | [LL-Q1860 (eng)-Grendelkhan-cat.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-cat.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.48 s |
| cheese | cheese.mp3 | [LL-Q1860 (eng)-Grendelkhan-cheese.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-cheese.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.66 s |
| cherry | cherry.mp3 | [En-us-cherry.ogg](https://commons.wikimedia.org/wiki/File:En-us-cherry.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.15 s |
| chick | chick.mp3 | [En-us-chick.ogg](https://commons.wikimedia.org/wiki/File:En-us-chick.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.65 s |
| circle | circle.mp3 | [LL-Q1860 (eng)-Grendelkhan-circle.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-circle.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.64 s |
| clothes | clothes.mp3 | [LL-Q1860 (eng)-Grendelkhan-clothes.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-clothes.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.68 s |
| clover | clover.mp3 | [LL-Q1860 (eng)-Vealhurl-clover.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Vealhurl-clover.wav) | Vealhurl | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 1.14 s |
| coat | coat.mp3 | [LL-Q1860 (eng)-Grendelkhan-coat.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-coat.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.47 s |
| cookie | cookie.mp3 | [LL-Q1860 (eng)-Wodencafe-cookie.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Wodencafe-cookie.wav) | Wodencafe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.89 s |
| cow | cow.mp3 | [LL-Q1860 (eng)-Grendelkhan-cow.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-cow.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.64 s |
| croissant | croissant.mp3 | [En-us-croissant.ogg](https://commons.wikimedia.org/wiki/File:En-us-croissant.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.85 s |
| cucumber | cucumber.mp3 | [En-us-cucumber.ogg](https://commons.wikimedia.org/wiki/File:En-us-cucumber.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.27 s |
| dog | dog.mp3 | [LL-Q1860 (eng)-Grendelkhan-dog.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-dog.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.61 s |
| doll | doll.mp3 | [LL-Q1860 (eng)-Grendelkhan-doll.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-doll.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.53 s |
| dress | dress.mp3 | [LL-Q1860 (eng)-Grendelkhan-dress.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-dress.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.58 s |
| drum | drum.mp3 | [En-us-drum.ogg](https://commons.wikimedia.org/wiki/File:En-us-drum.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.84 s |
| duck | duck.mp3 | [LL-Q1860 (eng)-Grendelkhan-duck.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-duck.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.43 s |
| eagle | eagle.mp3 | [En-us-eagle.ogg](https://commons.wikimedia.org/wiki/File:En-us-eagle.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.10 s |
| eggplant | eggplant.mp3 | [En-us-eggplant.ogg](https://commons.wikimedia.org/wiki/File:En-us-eggplant.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.83 s |
| elephant | elephant.mp3 | [LL-Q1860 (eng)-Grendelkhan-elephant.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-elephant.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.68 s |
| fire truck | fire-truck.mp3 | [LL-Q1860 (eng)-Persent101-fire truck.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Persent101-fire_truck.wav) | Persent101 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 0.79 s |
| fish | fish.mp3 | [LL-Q1860 (eng)-Grendelkhan-fish.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-fish.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.66 s |
| flamingo | flamingo.mp3 | [LL-Q1860 (eng)-Benluks-flamingo.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Benluks-flamingo.wav) | Benluks | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 1.12 s |
| flower | flower.mp3 | [LL-Q1860 (eng)-Grendelkhan-flower.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-flower.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.68 s |
| food | food.mp3 | [LL-Q1860 (eng)-Grendelkhan-food.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-food.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.60 s |
| fruit | fruit.mp3 | [LL-Q1860 (eng)-Grendelkhan-fruit.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-fruit.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.59 s |
| giraffe | giraffe.mp3 | [En-us-giraffe.ogg](https://commons.wikimedia.org/wiki/File:En-us-giraffe.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.20 s |
| gloves | gloves.mp3 | [LL-Q1860 (eng)-Grendelkhan-gloves.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-gloves.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.66 s |
| goat | goat.mp3 | [LL-Q1860 (eng)-Grendelkhan-goat.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-goat.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.48 s |
| goggles | goggles.mp3 | [En-us-goggles.ogg](https://commons.wikimedia.org/wiki/File:En-us-goggles.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.89 s |
| grapes | grapes.mp3 | [LL-Q1860 (eng)-Samuel Muldoon (Muldoonsamuel55)-grapes.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Samuel_Muldoon_%28Muldoonsamuel55%29-grapes.wav) | Samuel Muldoon | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1.21 s |
| green | green.mp3 | [LL-Q1860 (eng)-Grendelkhan-green.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-green.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.73 s |
| hat | hat.mp3 | [LL-Q1860 (eng)-Grendelkhan-hat.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-hat.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.38 s |
| heart | heart.mp3 | [LL-Q1860 (eng)-Grendelkhan-heart.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-heart.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.50 s |
| helicopter | helicopter.mp3 | [LL-Q1860 (eng)-Grendelkhan-helicopter.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-helicopter.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.86 s |
| horse | horse.mp3 | [LL-Q1860 (eng)-Grendelkhan-horse.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-horse.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.55 s |
| kangaroo | kangaroo.mp3 | [En-us-kangaroo.ogg](https://commons.wikimedia.org/wiki/File:En-us-kangaroo.ogg) | No machine-readable author provided. Dean14~commonswiki assumed (based on copyright claims). | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 1.21 s |
| leaves | leaves.mp3 | [LL-Q1860 (eng)-Grendelkhan-leaves.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-leaves.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.75 s |
| lemon | lemon.mp3 | [LL-Q1860 (eng)-Grendelkhan-lemon.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-lemon.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.61 s |
| lettuce | lettuce.mp3 | [En-us-lettuce.ogg](https://commons.wikimedia.org/wiki/File:En-us-lettuce.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.20 s |
| mammal | mammal.mp3 | [En-us-mammal.ogg](https://commons.wikimedia.org/wiki/File:En-us-mammal.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.05 s |
| mango | mango.mp3 | [En-us-mango.ogg](https://commons.wikimedia.org/wiki/File:En-us-mango.ogg) | Sylvanmoon | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 1.36 s |
| milk | milk.mp3 | [LL-Q1860 (eng)-Grendelkhan-milk.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-milk.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.52 s |
| monkey | monkey.mp3 | [LL-Q1860 (eng)-Grendelkhan-monkey.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-monkey.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.65 s |
| mouse | mouse.mp3 | [LL-Q1860 (eng)-Grendelkhan-mouse.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-mouse.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.62 s |
| onion | onion.mp3 | [En-us-onion.ogg](https://commons.wikimedia.org/wiki/File:En-us-onion.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.71 s |
| orange | orange.mp3 | [LL-Q1860 (eng)-Grendelkhan-orange.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-orange.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.62 s |
| owl | owl.mp3 | [En-us-owl.ogg](https://commons.wikimedia.org/wiki/File:En-us-owl.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.78 s |
| palm | palm.mp3 | [En-us-palm.ogg](https://commons.wikimedia.org/wiki/File:En-us-palm.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.62 s |
| pancakes | pancakes.mp3 | [LL-Q1860 (eng)-Wodencafe-pancakes.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Wodencafe-pancakes.wav) | Wodencafe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.87 s |
| pants | pants.mp3 | [LL-Q1860 (eng)-Grendelkhan-pants.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-pants.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.67 s |
| parrot | parrot.mp3 | [En-us-parrot.ogg](https://commons.wikimedia.org/wiki/File:En-us-parrot.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.68 s |
| pasta | pasta.mp3 | [LL-Q1860 (eng)-Vealhurl-pasta.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Vealhurl-pasta.wav) | Vealhurl | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 0.65 s |
| peach | peach.mp3 | [En-us-peach.ogg](https://commons.wikimedia.org/wiki/File:En-us-peach.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.15 s |
| peacock | peacock.mp3 | [En-us-peacock.ogg](https://commons.wikimedia.org/wiki/File:En-us-peacock.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.20 s |
| pear | pear.mp3 | [En-us-pear.ogg](https://commons.wikimedia.org/wiki/File:En-us-pear.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.62 s |
| penguin | penguin.mp3 | [En-us-penguin.ogg](https://commons.wikimedia.org/wiki/File:En-us-penguin.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.91 s |
| pig | pig.mp3 | [LL-Q1860 (eng)-Grendelkhan-pig.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-pig.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.73 s |
| pine | pine.mp3 | [LL-Q1860 (eng)-Wodencafe-pine.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Wodencafe-pine.wav) | Wodencafe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.58 s |
| pineapple | pineapple.mp3 | [En-us-pineapple.ogg](https://commons.wikimedia.org/wiki/File:En-us-pineapple.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.81 s |
| pink | pink.mp3 | [LL-Q1860 (eng)-Grendelkhan-pink.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-pink.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.59 s |
| plane | plane.mp3 | [LL-Q1860 (eng)-Grendelkhan-plane.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-plane.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.65 s |
| plants | plants.mp3 | [LL-Q1860 (eng)-Grendelkhan-plants.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-plants.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.66 s |
| police car | police-car.mp3 | [LL-Q1860 (eng)-Flame, not lame-police car.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Flame,_not_lame-police_car.wav) | Flame, not lame | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1.06 s |
| potato | potato.mp3 | [En-us-potato.ogg](https://commons.wikimedia.org/wiki/File:En-us-potato.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.97 s |
| pretzel | pretzel.mp3 | [En-us-pretzel.ogg](https://commons.wikimedia.org/wiki/File:En-us-pretzel.ogg) | EncycloPetey | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.87 s |
| purple | purple.mp3 | [En-us-purple.ogg](https://commons.wikimedia.org/wiki/File:En-us-purple.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.95 s |
| rabbit | rabbit.mp3 | [LL-Q1860 (eng)-Grendelkhan-rabbit.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-rabbit.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.49 s |
| red | red.mp3 | [LL-Q1860 (eng)-Grendelkhan-red.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-red.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.63 s |
| rocket | rocket.mp3 | [LL-Q1860 (eng)-Grendelkhan-rocket.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-rocket.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.58 s |
| rooster | rooster.mp3 | [En-us-rooster.ogg](https://commons.wikimedia.org/wiki/File:En-us-rooster.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.02 s |
| rose | rose.mp3 | [LL-Q1860 (eng)-Grendelkhan-rose.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-rose.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.63 s |
| shark | shark.mp3 | [LL-Q1860 (eng)-Grendelkhan-shark.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-shark.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.56 s |
| sheep | sheep.mp3 | [LL-Q1860 (eng)-Grendelkhan-sheep.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-sheep.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.58 s |
| shirt | shirt.mp3 | [LL-Q1860 (eng)-Grendelkhan-shirt.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-shirt.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.56 s |
| shoes | shoes.mp3 | [LL-Q1860 (eng)-Grendelkhan-shoes.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-shoes.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.73 s |
| shorts | shorts.mp3 | [En-us-shorts.ogg](https://commons.wikimedia.org/wiki/File:En-us-shorts.ogg) | Persent101 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 0.98 s |
| socks | socks.mp3 | [LL-Q1860 (eng)-Grendelkhan-socks.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-socks.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.68 s |
| square | square.mp3 | [LL-Q1860 (eng)-Grendelkhan-square.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-square.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.74 s |
| star | star.mp3 | [LL-Q1860 (eng)-Grendelkhan-star.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-star.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.76 s |
| strawberry | strawberry.mp3 | [En-us-strawberry.ogg](https://commons.wikimedia.org/wiki/File:En-us-strawberry.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.82 s |
| sunflower | sunflower.mp3 | [LL-Q1860 (eng)-Vealhurl-sunflower.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Vealhurl-sunflower.wav) | Vealhurl | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 1.20 s |
| swan | swan.mp3 | [En-us-swan.ogg](https://commons.wikimedia.org/wiki/File:En-us-swan.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.20 s |
| taxi | taxi.mp3 | [LL-Q1860 (eng)-Grendelkhan-taxi.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-taxi.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.68 s |
| tiger | tiger.mp3 | [LL-Q1860 (eng)-Grendelkhan-tiger.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-tiger.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.62 s |
| tomato | tomato.mp3 | [En-us-tomato.ogg](https://commons.wikimedia.org/wiki/File:En-us-tomato.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.75 s |
| toys | toys.mp3 | [LL-Q1860 (eng)-Grendelkhan-toys.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-toys.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.65 s |
| tractor | tractor.mp3 | [En-us-tractor.ogg](https://commons.wikimedia.org/wiki/File:En-us-tractor.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.75 s |
| train | train.mp3 | [LL-Q1860 (eng)-Grendelkhan-train.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-train.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.65 s |
| tree | tree.mp3 | [LL-Q1860 (eng)-Grendelkhan-tree.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-tree.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.67 s |
| triangle | triangle.mp3 | [En-us-triangle.ogg](https://commons.wikimedia.org/wiki/File:En-us-triangle.ogg) | Dvortygirl | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.88 s |
| truck | truck.mp3 | [LL-Q1860 (eng)-Grendelkhan-truck.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-truck.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.45 s |
| tulip | tulip.mp3 | [En-us-tulip.ogg](https://commons.wikimedia.org/wiki/File:En-us-tulip.ogg) | Mx. Granger | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1.25 s |
| turkey | turkey.mp3 | [LL-Q1860 (eng)-Grendelkhan-turkey.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-turkey.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.63 s |
| vegetables | vegetables.mp3 | [En-us-vegetables.ogg](https://commons.wikimedia.org/wiki/File:En-us-vegetables.ogg) | Neskaya | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1.31 s |
| vehicles | vehicles.mp3 | [LL-Q1860 (eng)-Wodencafe-vehicles.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Wodencafe-vehicles.wav) | Wodencafe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1.26 s |
| whale | whale.mp3 | [LL-Q1860 (eng)-Grendelkhan-whale.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-whale.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.65 s |
| yellow | yellow.mp3 | [LL-Q1860 (eng)-Grendelkhan-yellow.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Grendelkhan-yellow.wav) | Grendelkhan | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.69 s |
| yo-yo | yo-yo.mp3 | [En-us-yo-yo.ogg](https://commons.wikimedia.org/wiki/File:En-us-yo-yo.ogg) | No machine-readable author provided. Dvortygirl assumed (based on copyright claims). | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.88 s |
| zebra | zebra.mp3 | [En-us-zebra.ogg](https://commons.wikimedia.org/wiki/File:En-us-zebra.ogg) | No machine-readable author provided. Dvortygirl assumed (based on copyright claims). | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 0.94 s |
