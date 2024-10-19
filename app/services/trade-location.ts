// Vendor
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';
import {restartableTask} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';
import Evented from '@ember/object/evented';

// Types
import {
  ExactTradeLocationStruct,
  TradeLocationChangeEvent,
  TradeLocationStruct,
} from 'better-trading/types/trade-location';
import {Task} from 'better-trading/types/ember-concurrency';
import TradeLocationHistory from 'better-trading/services/trade-location/history';

// Config
import config from 'better-trading/config/environment';

// Constants
//const BASE_URL = 'https://www.pathofexile.com/trade';
//const BASE_URL = 'https://poe.game.qq.com/trade';

export default class TradeLocation extends Service.extend(Evented) {
  @service('trade-location/history')
  tradeLocationHistory: TradeLocationHistory;

  lastTradeLocation: ExactTradeLocationStruct = this.currentTradeLocation;

  get type(): string | null {
    return this.currentTradeLocation.type;
  }

  get league(): string | null {
    return this.currentTradeLocation.league;
  }

  get slug(): string | null {
    return this.currentTradeLocation.slug;
  }

  get isLive(): boolean {
    return this.currentTradeLocation.isLive;
  }

  get currentTradeLocation(): ExactTradeLocationStruct {
    return this.parseCurrentPath();
  }

  @restartableTask
  *locationPollingTask() {
    const currentTradeLocation = this.currentTradeLocation;

    if (!this.compareExactTradeLocations(this.lastTradeLocation, currentTradeLocation)) {
      const changeEvent: TradeLocationChangeEvent = {
        oldTradeLocation: this.lastTradeLocation,
        newTradeLocation: currentTradeLocation,
      };

      yield this.tradeLocationHistory.maybeLogTradeLocation(currentTradeLocation);
      this.trigger('change', changeEvent);
      this.lastTradeLocation = currentTradeLocation;
    }

    yield timeout(config.APP.locationPollingIntervalInMilliseconds);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (this.locationPollingTask as Task).perform();
  }

  initialize(host: string) {
    this.BASE_URL = `https://${host}/trade`;
    
    window.addEventListener('focus', this.startLocationPolling.bind(this));
    window.addEventListener('blur', this.stopLocationPolling.bind(this));

    this.startLocationPolling();
  }

  // in non-PC realms, league should be of form "realm/LeagueName", eg "xbox/Legion"
  getTradeUrl(type: string, slug: string, league: string) {
    return [this.BASE_URL, type, league, slug].join('/');
  }

  compareTradeLocations(locationA: TradeLocationStruct, locationB: TradeLocationStruct) {
    return (
      locationA.league === locationB.league && locationA.slug === locationB.slug && locationA.type === locationB.type
    );
  }

  compareExactTradeLocations(locationA: ExactTradeLocationStruct, locationB: ExactTradeLocationStruct) {
    return this.compareTradeLocations(locationA, locationB) && locationA.isLive === locationB.isLive;
  }

  async fetchHistoryEntries() {
    return this.tradeLocationHistory.fetchHistoryEntries();
  }

  async clearHistoryEntries() {
    return this.tradeLocationHistory.clearHistoryEntries();
  }

  private parseCurrentPath(): ExactTradeLocationStruct {
    const tradeRealms = ['xbox', 'sony'];
    const pathParts = window.location.pathname.replace('/trade/', '').split('/');
    let type, league, slug, live;
    if (tradeRealms.includes(pathParts[1])) {
      let realm, leagueInRealm;
      [type, realm, leagueInRealm, slug, live] = pathParts;
      league = `${realm}/${leagueInRealm}`;
    } else {
      [type, league, slug, live] = pathParts;
    }

    return {
      type: type || null,
      league: league || null,
      slug: slug || null,
      isLive: live === 'live',
    };
  }

  private startLocationPolling() {
    if (!window.document.hasFocus()) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (this.locationPollingTask as Task).perform();
  }

  private stopLocationPolling() {
    (this.locationPollingTask as Task).cancelAll();
  }
}

declare module '@ember/service' {
  interface Registry {
    'trade-location': TradeLocation;
  }
}
