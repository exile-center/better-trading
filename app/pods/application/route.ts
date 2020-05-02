// Vendor
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

// Types
import ItemResults from 'better-trading/services/item-results';
import IntlService from 'ember-intl/services/intl';
import Bookmarks from 'better-trading/services/bookmarks';
import Storage from 'better-trading/services/storage';
import BookmarksStorage from 'better-trading/services/bookmarks/storage';

// Constants
const DEFAULT_LOCALE = 'en';

export default class ApplicationRoute extends Route {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('intl')
  intl: IntlService;

  @service('item-results')
  itemResults: ItemResults;

  @service('storage')
  storage: Storage;

  @service('bookmarks/storage')
  bookmarksStorage: BookmarksStorage;

  async beforeModel() {
    this.intl.setLocale(DEFAULT_LOCALE);
    this.itemResults.watchResults();
    await this.storage.initialize();

    // Temporary migration
    await this.bookmarksStorage.migrateDexieToStorage();
  }
}
