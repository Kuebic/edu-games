---
status: accepted
---

# One asking screen

Piggy Bank's Find kept its own loop when sorting moved to `src/shared/sort.ts` (ADR 0016): a pig at the bottom asks for one of two or three coins on the table, the child drags it in or taps it, a Miss glides back and the pig asks again, the second Miss lights the right coin and puts it in, and the coins change places between Asks. Mailbox's Find is the same loop with letters and a mailbox, so it would have been a second copy. So asking is `askRounds` in `sort.ts`, beside `sortRounds`, on the same stage and fingers. A Game gives its Rounds (the kinds on the table and the Asks in order), its Asker, its drawing of a Thing, and hooks: `ask` shows and says what's wanted, and is called again after a Miss, on a press of the Asker and from the second nudge, so the only word an asking screen says is the one asked for (Piggy Bank's ADR 0004). The screen lights the wanted Thing from the third nudge.

`binsFrom` also takes an `apart` rule now: items it says look alike share a Round only when the Scope leaves no other way. Mailbox keeps b from d with it.

`catalog.test.ts` fails a Game that defines its own table `SEATS`, as it does its own `binAt` or `fingers`.
