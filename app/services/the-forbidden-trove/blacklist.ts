// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {dateDelta} from 'better-trading/utilities/date-delta';

// Types
import Storage from 'better-trading/services/storage';
import {TheForbbidenTroveBlacklistEntry} from 'better-trading/types/the-forbidden-trove';

// Constants
const BLACKLIST_CSV_URL =
  'https://raw.githubusercontent.com/The-Forbidden-Trove/ForbiddenTroveBlacklist/main/blacklist.csv';
const BLACKLIST_CACHE_KEY = 'the-forbidden-trove-blacklist-cache';
const BLACKLIST_CACHE_DURATION = 43200000; // 12 hours

export default class Blacklist extends Service {
  @service('storage')
  storage: Storage;

  async fetch(): Promise<TheForbbidenTroveBlacklistEntry[]> {
    const cachedBlacklist = await this.lookupCache();
    if (cachedBlacklist) return cachedBlacklist;

    const csvResponse = await fetch(BLACKLIST_CSV_URL);
    const blacklistCsv = await csvResponse.text();

    const blacklist = this.parseCsv(blacklistCsv);
    await this.cache(blacklist);

    return blacklist;
  }

  private async lookupCache(): Promise<TheForbbidenTroveBlacklistEntry[] | null> {
    return this.storage.getValue(BLACKLIST_CACHE_KEY);
  }

  private async cache(blacklist: TheForbbidenTroveBlacklistEntry[]) {
    return this.storage.setEphemeralValue(BLACKLIST_CACHE_KEY, blacklist, dateDelta(BLACKLIST_CACHE_DURATION));
  }

  private parseCsv(blacklistCsv: string): TheForbbidenTroveBlacklistEntry[] {
    const csvLines = blacklistCsv.split('\n');
    csvLines.shift(); // Remove the CSV header

    return csvLines.reduce((acc: TheForbbidenTroveBlacklistEntry[], blacklistCsvLine: string) => {
      const match = blacklistCsvLine.match(/^"(.+)", "(\d+)", "(.+)", "(.+)"$/);
      if (!match) return acc;

      const [, accountName, , rawBlacklistedOn, reason] = match;

      return acc.concat({
        accountName,
        reason,
        blacklistedOn: new Date(rawBlacklistedOn.split('/').reverse().join('-')).toUTCString(),
      });
    }, []);
  }
}

declare module '@ember/service' {
  interface Registry {
    'the-forbidden-trove/blacklist': Blacklist;
  }
}
