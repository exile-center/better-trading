// Vendor
import Service from '@ember/service';
import window from 'ember-window-mock';

// Constants
const KEY_PREFIX = 'bt-';
const EXPIRY_SUFFIX = '--expires-at';

type LocalStorageKey = 'favorites';

export default class LocalStorage extends Service {
  // Local reference so it can be stubbed
  localStorage: any = window.localStorage;

  setValue(key: LocalStorageKey, value: string): void {
    this.write(key, value);
  }

  setEphemeralValue(
    key: LocalStorageKey,
    value: string,
    durationMs: number
  ): void {
    this.write(key, value);

    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = currentTimestamp + durationMs;
    this.write(key + EXPIRY_SUFFIX, expiryTimestamp.toString());
  }

  getValue(key: LocalStorageKey): string | null {
    const value = this.read(key);
    if (!value) return null;

    const currentTimestamp = new Date().getTime();
    const expiryTimestamp = this.read(key + EXPIRY_SUFFIX);
    if (!expiryTimestamp) return value;
    if (currentTimestamp < parseInt(expiryTimestamp, 10)) return value;

    return null;
  }

  private write(key: string, value: string): void {
    this.localStorage.setItem(KEY_PREFIX + key, value);
  }

  private read(key: string): string | null {
    return this.localStorage.getItem(KEY_PREFIX + key);
  }
}

declare module '@ember/service' {
  interface Registry {
    'local-storage': LocalStorage;
  }
}
