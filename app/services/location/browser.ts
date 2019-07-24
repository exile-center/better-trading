// Vendor
import Service from '@ember/service';
import window from 'ember-window-mock';

// Types
import {LocationInterface} from 'better-trading/services/location';

export default class BrowserLocation extends Service
  implements LocationInterface {
  get protocol(): string {
    return window.location.protocol;
  }

  get host(): string {
    return window.location.host;
  }

  get path(): string {
    return window.location.pathname;
  }

  get hash(): string {
    return window.location.hash;
  }

  get queryString(): string {
    return window.location.search;
  }
}

declare module '@ember/service' {
  interface Registry {
    'location/browser': BrowserLocation;
  }
}
