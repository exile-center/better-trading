// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {NormalizedCacheObject} from 'apollo-cache-inmemory';
import FastBoot from 'ember-cli-fastboot/services/fastboot';

// Config
import config from 'ember-boilerplate/config/environment';

export default class ShoeboxReader extends Service {
  @service('fastboot')
  fastboot: FastBoot;

  read(): NormalizedCacheObject | null {
    if (this.fastboot.isFastBoot) return null;

    const cachedContent = this.fastboot.shoebox.retrieve(
      config.apollo.SSR_CACHE_KEY
    );

    try {
      return JSON.parse(cachedContent || '{}');
    } catch (_error) {
      return {};
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'apollo/shoebox-reader': ShoeboxReader;
  }
}
