// Vendor
import {action} from '@ember/object';
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import fetch from 'fetch';

// Types
import ShoeboxWriter from 'better-trading/services/apollo/shoebox-writer';
import Location from 'better-trading/services/location';
import ServiceWorker from 'better-trading/services/service-worker';
import IntlService from 'ember-intl/services/intl';

// Config
import config from 'better-trading/config/environment';

export default class ApplicationRoute extends Route {
  @service('intl')
  intl: IntlService;

  @service('apollo/shoebox-writer')
  apolloShoeboxWriter: ShoeboxWriter;

  @service('location')
  location: Location;

  @service('service-worker')
  serviceWorker: ServiceWorker;

  async beforeModel() {
    const locale = this.determineLocale();
    this.intl.setLocale(locale);

    if (config.intl.ASYNC_TRANSLATIONS) {
      const translations = await this.fetchTranslations(locale);

      this.intl.addTranslations(locale, translations);
    }

    // By default whenever an update is ready, we install it immediately.
    // Note that the `update` call could be made later. We could prompt the
    // user to update, then install the update only when they accept.
    this.serviceWorker.register().onUpdateReady(() => {
      this.serviceWorker.update();
    });
  }

  @action
  didTransition() {
    this.apolloShoeboxWriter.write();
  }

  private determineLocale(): string {
    return 'en-ca';
  }

  private async fetchTranslations(locale: string): Promise<object> {
    const translationsURL = `${
      this.location.fullURL
    }/translations/${locale}.json`;

    try {
      const response = await fetch(translationsURL);

      return response.json();
    } catch (error) {
      return {};
    }
  }
}
