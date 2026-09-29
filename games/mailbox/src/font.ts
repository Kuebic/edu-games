// The Letter font (ADR 0002): Andika Bold's 52 letters, renamed Mailbox Letters, made by `npm run game
// mailbox font`. Loaded with the FontFace API rather than an @font-face rule, so the page can wait for it:
// a letter drawn first in some other font would show the child an a or a g of the wrong shape.

import url from './assets/font/mailbox-letters.woff2?url';

/** The family every letter is drawn in; the stylesheet reads it as --letters. */
export const LETTER_FONT = 'Mailbox Letters';

let loading: Promise<void> | undefined;

/** Loads the Letter font once. Resolves either way: a font that won't load mustn't stop the Game. */
export function loadLetters(): Promise<void> {
  if (typeof FontFace === 'undefined' || typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  loading ??= new FontFace(LETTER_FONT, `url(${url}) format('woff2')`, { weight: '700' })
    .load()
    .then((face) => void document.fonts.add(face))
    .catch(() => {});
  return loading;
}
