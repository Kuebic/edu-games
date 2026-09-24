import { registerSW } from 'virtual:pwa-register';

/** Every page calls this so the site-wide service worker installs from wherever the child lands. */
export function registerOffline(): void {
  registerSW({ immediate: true });
}
