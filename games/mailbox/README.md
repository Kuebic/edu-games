# Mailbox

A phone-first touch game that teaches three to five-year-olds which lowercase letter goes with each capital: A with a. The child posts lowercase letters into mailboxes that wear capitals, or finds the letter one mailbox asks for, and a recorded voice says the letter's name.

It starts from the capitals a child already names, because that is how lowercase letters are learnt, and from the letters whose two forms look alike. From the research in [docs/research/letter-case-matching.md](../../docs/research/letter-case-matching.md). Vocabulary lives in [CONTEXT.md](./CONTEXT.md); design decisions in [docs/adr](./docs/adr); the spec it was built from in [docs/spec.md](./docs/spec.md).

## Run

From the repo root:

```sh
npm run dev                         # then open /mailbox/; serves on your LAN too, for testing on a phone
npx vitest run games/mailbox        # the Rounds, the Hints, Saved progress, the clips, Practice and play
npm run game mailbox names          # fetch and trim the letter Names again (needs ffmpeg)
npm run game mailbox font           # cut the Letter font from Andika again (needs Python with fonttools and brotli)
npm run build                       # whole site, into dist/
```

The page is `index.html`; its icons are in `public/`, served at `/mailbox/`. The Name clips are in `src/assets/names/` and the Letter font in `src/assets/font/`, credited in [docs/credits.md](./docs/credits.md). Every other noise is a note.

## For grown-ups

The first screen is yours. Tap the letters to practise, or a Range, and a Way:

- 📬 **Sort** puts out a mailbox for each letter, wearing its capital. Your child posts each lowercase letter into its mailbox. The easiest.
- 🔍 **Find** has one mailbox show a capital and say its name, with two or three lowercase letters to pick from.

Start with **Same** (c o s v w x z), whose lowercase is the capital's shape. Then **Close** (i j k p u y), then **Unlike** (a e f h m n r t), and **Tricky** (b d g l q) last. Two letters make two mailboxes; three or more make three a Round, taking turns. Letters that look alike, like b and d, only share a Round if you pick nothing else.

An Unlike or Tricky mailbox shows its lowercase letter faintly beside the capital at first. It fades after a Round with no mistakes on that letter and is gone after two; a mistake brings it back. A wrong mailbox sends the letter back with a soft bump, says its name and lights up the right one; after two misses it goes in by itself. The game only ever says the letter's name, never "capital" or "lowercase". When a Round is done every flag goes up and a card suggests finding the letter in a book together.
