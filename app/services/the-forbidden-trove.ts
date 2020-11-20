// Vendor
import Service, {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

// Types
import Storage from 'better-trading/services/storage';
import Blacklist from 'better-trading/services/the-forbidden-trove/blacklist';
import {TheForbbidenTroveBlacklistEntry} from 'better-trading/types/the-forbidden-trove';

export default class TheForbiddenTrove extends Service {
  @service('the-forbidden-trove/blacklist')
  blacklist: Blacklist;

  @service('storage')
  storage: Storage;

  @tracked
  warnedBlacklistEntry: TheForbbidenTroveBlacklistEntry | null = null;

  async fetchBlacklist(): Promise<TheForbbidenTroveBlacklistEntry[]> {
    return this.blacklist.fetch();
  }

  promptBlacklistEntryWarning(blacklistEntry: TheForbbidenTroveBlacklistEntry) {
    this.warnedBlacklistEntry = blacklistEntry;
  }

  clearBlacklistEntryWarning() {
    this.warnedBlacklistEntry = null;
  }
}

declare module '@ember/service' {
  interface Registry {
    'the-forbidden-trove': TheForbiddenTrove;
  }
}
