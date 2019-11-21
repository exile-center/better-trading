// Vendor
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

// Types
import ItemResults from 'better-trading/services/item-results';
import IntlService from 'ember-intl/services/intl';

// Constants
const DEFAULT_LOCALE = 'en-us';

export default class ApplicationRoute extends Route {
  @service('intl')
  intl: IntlService;

  @service('item-results')
  itemResults: ItemResults;

  beforeModel() {
    this.intl.setLocale(DEFAULT_LOCALE);
    this.itemResults.watchResults();
  }
}
