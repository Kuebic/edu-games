import type { GrownUpCorner } from '@shared/grownup';
import type { Topic } from './finds';
import type { Progress } from './progress';

/** What every screen gets: the page, the Saved progress, and the ways to the other screens. */
export interface App {
  root: HTMLElement;
  progress: Progress;
  /** Practice, where a grown-up picks the Topic, Scope and Way. */
  start(): void;
  /** Practise a Topic with its saved Scope and Way, until Back. */
  play(topic: Topic): void;
  /** The Grown-up Corner, over whatever screen is showing. */
  corner: GrownUpCorner;
}
