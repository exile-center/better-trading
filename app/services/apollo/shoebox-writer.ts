// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import Apollo from 'ember-apollo-client/services/apollo';
import FastBoot from 'ember-cli-fastboot/services/fastboot';

// Config
import config from 'better-trading/config/environment';

export default class ShoeboxWriter extends Service {
  @service('apollo')
  apollo: Apollo;

  @service('fastboot')
  fastboot: FastBoot;

  write() {
    if (!this.fastboot.isFastBoot) return;

    const cache = JSON.stringify(this.apollo.client.cache.extract());

    this.fastboot.shoebox.put(config.apollo.SSR_CACHE_KEY, cache);
  }
}

declare module '@ember/service' {
  interface Registry {
    'apollo/shoebox-writer': ShoeboxWriter;
  }
}
