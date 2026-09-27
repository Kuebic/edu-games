// The ABC song (ADR 0005): a girl singing the Alphabet Song, and when she sings each letter, so the
// Letter board can shake each one as it's sung.

/**
 * Seconds into assets/abc-song.mp3 at which each letter, A to Z, starts being sung. Measured by machine on
 * the file the song task makes (Whisper's word times, then the dip in loudness before each syllable), not
 * by ear. Remake the song and these move.
 */
export const SUNG_AT: readonly number[] = [
  0.25, 0.8, 1.29, 1.78, 2.18, 2.49, 3.1, // A B C D E F G
  3.85, 4.26, 4.69, 5.12, // H I J K
  5.38, 5.74, 5.87, 6.18, 6.59, // L M N O P
  7.48, 7.91, 8.48, // Q R S
  9.44, 9.76, 10.16, // T U V
  10.97, 11.49, // W X
  11.97, 12.94, // Y and Z
];

/** When "Now I know my ABCs" starts, and every letter dances. */
export const NOW_I_KNOW = 14.99;

/** How long the song lasts, for shaking the letters along with it when it can't be heard. */
export const SONG_LENGTH = 22.08;

/** How many letters have started being sung `time` seconds into the song. */
export const sungBy = (time: number): number => SUNG_AT.filter((at) => at <= time).length;
