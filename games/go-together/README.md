# Go Together

A phone-first touch game that teaches two to four-year-olds to see which things go together: Connections, with pictures and no words. A grid of 4, 6, 9 or 16 pictures sits in the middle in hidden groups, with an empty frame for each group above. Nobody says what the groups are. The child taps the pictures that belong together; a whole group hops into a frame and a recorded Word says its name, once.

It is the Shelf's step after Tidy Up: there the Bins name the groups first, here the child finds them. Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md). The pictures and their Words are the site's (`@shared/kinds`, site ADR 0018), credited in Tidy Up's [word-credits.md](../tidy-up/docs/word-credits.md).

## Run

From the repo root:

```sh
npm run dev                          # then open /go-together/; serves on your LAN too, for testing on a phone
npx vitest run games/go-together     # the deals, the picking rule, Saved progress, Practice and the play screen
npm run build                        # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/go-together/`. Every noise but the Words is a note.

## For grown-ups

The first screen is yours. Try the tabs in order:

- **Same**, for two-year-olds: each group is the same picture twice, or three or four times. Tap the pools the pictures come from.
- **Colors**: each group is things of one color, a strawberry, a fire truck and a rose. Tap the colors to play with.
- **Kinds**: each group is a kind of thing. **Easy** is animals, vehicles, food and clothes; **All** adds toys, plants, birds, fish, fruit and vegetables. Groups that overlap, like animals and birds, never share a Board when there is another way.

The squares pick the **Board**: 4 pictures in 2 groups of 2, 6 in 2 groups of 3, 9 in 3 groups of 3, or 16 in 4 groups of 4, like the newspaper. Play waits until you have turned on as many items as the Board has groups.

Your child taps a picture and it lifts. The first lifted one leads: a tap on another of its kind lifts that too, and when the group is whole it hops into a frame at the top and says its name. A tap on a picture from another group just bumps it back, and the Game doesn't show which ones were right; nothing gathers by itself, so she can try as often as she likes. After a bump a button appears under the pictures; a tap on it gathers the group for her. A tap on a lifted picture puts it down. Nothing is counted. The last group gathers on its first tap. When every frame is full the frames shine, the site's cheer plays, and a card suggests finding three things at home that go together. It goes on until Back.

Say the group with your child as it gathers: "they're all animals". The Game only ever says the group's name.
