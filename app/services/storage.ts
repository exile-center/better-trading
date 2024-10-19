// Vendor
import Service from '@ember/service';
import {extensionApi} from 'better-trading/utilities/extension-api';
import window from 'ember-window-mock';

// Constants
const PAST_LEAGUES = ['blight', 'metamorph', 'delirium'];

interface StoragePayload {
  value: any;
  expiresAt: string | null;
}

export default class Storage extends Service {
  async initialize(locale: string) {
    this.locale = locale
    console.log("storage")
    console.log(this.locale)
    await this.cleanupPastLeagues();
  }

  setLocalValue(key: string, value: string, league: string | null = null) {
    window.localStorage.setItem(`bt-${this.formatKey(key, league)}`, value);
  }

  getLocalValue(key: string, league: string | null = null) {
    return window.localStorage.getItem(`bt-${this.formatKey(key, league)}`);
  }

  deleteLocalValue(key: string, league: string | null = null) {
    window.localStorage.removeItem(`bt-${this.formatKey(key, league)}`);
  }

  async setValue(key: string, value: any, league: string | null = null) {
    return this.write(this.formatKey(key, league), {
      expiresAt: null,
      value,
    });
  }

  async setEphemeralValue(key: string, value: any, expirationDate: Date, league: string | null = null) {
    return this.write(this.formatKey(key, league), {
      expiresAt: expirationDate.toUTCString(),
      value,
    });
  }

  async getValue<T>(key: string, league: string | null = null): Promise<T | null> {
    const payload = await this.read(this.formatKey(key, league));
    if (!payload) return null;

    const {expiresAt, value} = payload;

    if (!expiresAt) return value;

    const expirationTimestamp = new Date(expiresAt).getTime();
    const currentTimestamp = new Date().getTime();

    if (currentTimestamp > expirationTimestamp) return null;

    return value;
  }

  async deleteValue(key: string, league: string | null = null) {
    return this.remove(this.formatKey(key, league));
  }

  private formatKey(key: string, league: string | null) {
    let formattedKey = `${this.locale}--${key}`;
    if (league) formattedKey += `--${league}`;
    return formattedKey.toLowerCase();
  }

  private async cleanupPastLeagues() {
    const pastLeaguesRegex = new RegExp(`--(${PAST_LEAGUES.join('|')})$`);
    const storageKeys = await this.fetchAllKeys();

    await this.remove(storageKeys.filter((storageKey: string) => pastLeaguesRegex.test(storageKey)));
  }

  private async fetchAllKeys(): Promise<string[]> {
    return new Promise((resolve, _reject) => {
      extensionApi().storage.local.get(null, (result) => {
        resolve(Object.keys(result));
      });
    });
  }

  private async read(key: string): Promise<StoragePayload | null> {
    return new Promise((resolve, _reject) => {
      extensionApi().storage.local.get([key], (result) => {
        if (result[key]) {
          resolve(result[key]);
        } else {
          resolve(null);
        }
      });
    });
  }

  private async write(key: string, value: StoragePayload): Promise<void> {
    return new Promise((resolve, _reject) => {
      extensionApi().storage.local.set({[key]: value}, resolve);
    });
  }

  private async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, _reject) => {
      extensionApi().storage.local.remove(keys, resolve);
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    storage: Storage;
  }
}
