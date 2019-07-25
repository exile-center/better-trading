// Vendor
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

// Types
import IntlService from 'ember-intl/services/intl';

// Constants
const DEFAULT_LOCALE = 'en-us';

export default class ApplicationRoute extends Route {
  @service('intl')
  intl: IntlService;

  async beforeModel() {
    this.intl.setLocale(DEFAULT_LOCALE);
  }
}
