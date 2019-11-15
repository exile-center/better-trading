// Vendor
import Service from '@ember/service';
import window from 'ember-window-mock';

// Constants
const KEY_PREFIX = 'bt-';
const EXPIRY_SUFFIX = '--expires-at';

type LocalStorageKey =
  | 'bookmark-folders-expansion'
  | 'bookmark-folders'
  | 'bookmark-trades'
  | 'settings'
  | 'poe-ninja-chaos-ratios-cache';

export default class LocalStorage extends Service {
  setValue(key: LocalStorageKey, value: string, league: string | null = null): void {
    this.write(key, value, league);
  }

  setEphemeralValue(
    key: LocalStorageKey,
    value: string,
    durationMs: number,
    league: string | null = null
  ): void {
    this.write(key, value, league);

    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = currentTimestamp + durationMs;
    this.write(key + EXPIRY_SUFFIX, expiryTimestamp.toString(), league);
  }

  getValue(key: LocalStorageKey, league: string | null = null): string | null {
    const value = this.read(key, league);
    if (!value) return null;

    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = this.read(key + EXPIRY_SUFFIX, league);
    if (!expiryTimestamp) return value;
    if (currentTimestamp < parseInt(expiryTimestamp, 10)) return value;

    return null;
  }

  private write(key: string, value: string, league: string | null): void {
    window.localStorage.setItem(this.formattedKey(key, league), value);
  }

  private read(key: string, league: string | null): string | null {
    return window.localStorage.getItem(this.formattedKey(key, league));
  }

  private formattedKey(key: string, league: string | null): string {
    const formattedKey = KEY_PREFIX + key;
    if (!league) return formattedKey;

    return `${formattedKey}@${league}`;
  }
}

declare module '@ember/service' {
  interface Registry {
    'local-storage': LocalStorage;
  }
}
