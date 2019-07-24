// Vendor
import {inject as service} from '@ember/service';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {setContext} from 'apollo-link-context';
import ApolloService from 'ember-apollo-client/services/apollo';

// Types
import ShoeBoxReader from 'better-trading/services/apollo/shoebox-reader';
import SessionFetcher from 'better-trading/services/session/fetcher';
import FastBoot from 'ember-cli-fastboot/services/fastboot';

const dataIdFromObject = (result: any): string | null => {
  if (result.id && result.__typename) {
    return `${result.__typename}${result.id}`;
  }

  return null;
};

export default class Apollo extends ApolloService {
  @service('apollo/shoebox-reader')
  apolloShoeboxReader: ShoeBoxReader;

  @service('fastboot')
  fastboot: FastBoot;

  @service('session/fetcher')
  sessionFetcher: SessionFetcher;

  clientOptions() {
    return {
      cache: this.cache(),
      link: this.link(),
      ssrMode: this.fastboot.isFastBoot
    };
  }

  link() {
    const httpLink = super.link();
    const authenticationLink = this.createAuthenticationLink();

    return authenticationLink.concat(httpLink);
  }

  cache() {
    const cache = new InMemoryCache({dataIdFromObject});

    const cachedContent = this.apolloShoeboxReader.read();

    if (!cachedContent) return cache;

    return cache.restore(cachedContent);
  }

  private createAuthenticationLink() {
    return setContext(async _request => {
      const {token} = await this.sessionFetcher.fetch();

      return {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    apollo: Apollo;
  }
}
