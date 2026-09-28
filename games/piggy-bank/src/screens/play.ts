// Practice's Rounds, in the saved Way: Sort into Banks, or Find what the pig asks for. Until Back.

import type { App } from '../app';
import { findScreen } from './find';
import { sortScreen } from './sort';

export const playScreen = (app: App): (() => void) => (app.progress.game.way === 'find' ? findScreen(app) : sortScreen(app));
