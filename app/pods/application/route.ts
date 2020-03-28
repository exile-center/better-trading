// Vendor
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

// Types
import ItemResults from 'better-trading/services/item-results';
import IntlService from 'ember-intl/services/intl';
import DexieService from 'better-trading/services/dexie';
import Bookmarks from 'better-trading/services/bookmarks';
import LocalStorage from 'better-trading/services/local-storage';

// Constants
const DEFAULT_LOCALE = 'en';

export default class ApplicationRoute extends Route {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('intl')
  intl: IntlService;

  @service('item-results')
  itemResults: ItemResults;

  @service('dexie')
  dexie: DexieService;

  @service('local-storage')
  localStorage: LocalStorage;

  async beforeModel() {
    this.intl.setLocale(DEFAULT_LOCALE);
    this.itemResults.watchResults();
    this.localStorage.initialize();
    await this.dexie.initialize();
  }
}
