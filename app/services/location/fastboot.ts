// Vendor
import Service, {inject as service} from '@ember/service';

// Config
import config from 'ember-boilerplate/config/environment';

// Types
import {LocationInterface} from 'ember-boilerplate/services/location';
import FastBoot from 'ember-cli-fastboot/services/fastboot';

export default class FastBootLocation extends Service
  implements LocationInterface {
  @service('fastboot')
  fastboot: FastBoot;

  get protocol() {
    // Our apps should always be deployed on https in production,
    // so we assume that’s always the case.
    return config.environment === 'production' ? 'https:' : 'http:';
  }

  get host(): string {
    return this.fastboot.request.host;
  }

  get path(): string {
    const pathWithQuery = this.fastboot.request.path;
    const queryIndex = pathWithQuery.indexOf('?');

    return queryIndex >= 0 ? pathWithQuery.slice(0, queryIndex) : pathWithQuery;
  }

  get queryString(): string {
    const pathWithQuery = this.fastboot.request.path;
    const queryIndex = pathWithQuery.indexOf('?');

    return queryIndex >= 0 ? pathWithQuery.slice(queryIndex) : '';
  }

  get hash(): string {
    const pathWithHash = this.fastboot.request.path;
    const hashIndex = pathWithHash.indexOf('#');

    return hashIndex >= 0 ? pathWithHash.slice(hashIndex) : '';
  }
}

declare module '@ember/service' {
  interface Registry {
    'location/fastboot': FastBootLocation;
  }
}
