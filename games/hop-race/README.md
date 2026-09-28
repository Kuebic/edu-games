# Hop Race

A phone-first touch game that teaches a three-year-old the numbers 1 to 10 in order, and that a bigger number is further along. The child spins, hops their animal along a straight numbered track, and hears the number of every square they land on, racing a friendly animal home.

It's the race game from Siegler & Ramani's studies (2008, 2009): preschoolers who played it on a straight track from 1 to 10 got better at counting, comparing numbers and placing them on a number line. Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                          # then open /hop-race/; serves on your LAN too, for testing on a phone
npx vitest run games/hop-race        # the Race rules, the Voice's lines, Saved progress, the level select
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/hop-race/`. Every noise is a note, so there are no sound files.

## For grown-ups

Say the numbers out loud with your child as the animals hop: "four, five!". Naming the square you land on is what teaches, more than counting the hops.

There are three tracks. To 5 is a short one to learn spinning and hopping. To 10 is the whole track, as in the study. Who's ahead asks between turns which animal is further along. Each race has a different friend, and races open in order.

On their turn the spinner glows: your child taps it, and it lands on one dot or two. Then their animal's button glows, and each tap is one hop. The friend spins and hops by itself. Nobody loses: the race ends when your child's animal gets home, and a friend who gets there first waits. Leave it for 6 seconds and the glowing button wiggles and the Voice asks again.

Your child picks their animal, Bunny, Puppy, Kitty or Bear, on the first screen. Under the tracks, pick one player or two. With two, a second child (or you) plays the friend: the voice says whose turn it is, the big button shows that animal, and each taps the spinner and hops on their own turn. The race goes on until both animals are home, and whoever gets there first waits. Reset progress keeps the animal and the players.
