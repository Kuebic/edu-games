import { registerSW } from 'virtual:pwa-register';

/** The shell calls this on every page, so the site-wide service worker installs from wherever the child lands. */
export function registerOffline(): void {
  registerSW({ immediate: true });
}
