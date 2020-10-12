// Vendor
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

// Types
import ItemResults from 'better-trading/services/item-results';
import IntlService from 'ember-intl/services/intl';
import Bookmarks from 'better-trading/services/bookmarks';
import Storage from 'better-trading/services/storage';
import TradeLocation from 'better-trading/services/trade-location';

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

  @service('trade-location')
  tradeLocation: TradeLocation;

  async beforeModel() {
    this.intl.setLocale(DEFAULT_LOCALE);
    await this.itemResults.initialize();
    this.tradeLocation.initialize();
    await this.storage.initialize();
  }
}
