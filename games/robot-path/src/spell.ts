/** "C, A, T. Cat!" Letter names, not phonics (docs/adr/0001). The Voice says it. */
export function spellOut(word: string): string {
  return `${[...word].join(', ')}. ${word[0]}${word.slice(1).toLowerCase()}!`;
}
