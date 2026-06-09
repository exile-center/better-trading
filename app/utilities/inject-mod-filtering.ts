import window from 'ember-window-mock';

import {extensionApi, isExtensionContextValid} from 'better-trading/utilities/extension-api';

const SEARCH_PATH_PATTERN = /\/search\//;
const RETRY_DELAYS_MS = [0, 1500, 4000, 8000, 15000];

function requestMainWorldInjection(): void {
  if (!isExtensionContextValid()) return;

  try {
    extensionApi().runtime.sendMessage({query: 'inject-mod-filtering'}, () => undefined);
  } catch {
    // Extension context may be unavailable after a hot reload.
  }
}

export function injectModFilteringScript(): void {
  if (!SEARCH_PATH_PATTERN.test(window.location.pathname)) return;
  if (!window.document.querySelector('#trade')) return;

  requestMainWorldInjection();
}

export function scheduleModFilteringInjection(): void {
  RETRY_DELAYS_MS.forEach((delayMs) => {
    window.setTimeout(injectModFilteringScript, delayMs);
  });
}
