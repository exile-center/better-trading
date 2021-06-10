// Vendor
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';
import {restartableTask} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';
import Evented from '@ember/object/evented';

// Types
import {TradeLocationChangeEvent, TradeLocationStruct} from 'better-trading/types/trade-location';
import {Task} from 'better-trading/types/ember-concurrency';
import TradeLocationHistory from 'better-trading/services/trade-location/history';

// Config
import config from 'better-trading/config/environment';

// Constants
const BASE_URL = 'https://www.pathofexile.com/trade';

interface ParsedPath {
  baseUrl?: string;
  type: string;
  league: string;
  slug?: string;
}

export default class TradeLocation extends Service.extend(Evented) {
  @service('trade-location/history')
  tradeLocationHistory: TradeLocationHistory;

  lastTradeLocation: TradeLocationStruct = this.currentTradeLocation;

  get baseUrl(): string {
    const {baseUrl} = this.parseCurrentPath();

    return baseUrl || BASE_URL;
  }

  get type(): string | null {
    const {type} = this.parseCurrentPath();

    return type || null;
  }

  get league(): string | null {
    const {league} = this.parseCurrentPath();

    return league || null;
  }

  get slug(): string | null {
    const {slug} = this.parseCurrentPath();

    return slug || null;
  }

  get currentTradeLocation(): TradeLocationStruct {
    return {
      baseUrl: this.baseUrl,
      slug: this.slug,
      type: this.type,
      league: this.league,
    };
  }

  @restartableTask
  *locationPollingTask() {
    const currentTradeLocation = this.currentTradeLocation;

    if (!this.compareTradeLocations(this.lastTradeLocation, currentTradeLocation)) {
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

  initialize() {
    window.addEventListener('focus', this.startLocationPolling.bind(this));
    window.addEventListener('blur', this.stopLocationPolling.bind(this));

    this.startLocationPolling();
  }

  getTradeUrl(type: string, slug: string, league: string, baseUrl?: string) {
    return [baseUrl || BASE_URL, type, league, slug].join('/');
  }

  compareTradeLocations(locationA: TradeLocationStruct, locationB: TradeLocationStruct) {
    return (
      locationA.baseUrl === locationB.baseUrl &&
      locationA.league === locationB.league &&
      locationA.slug === locationB.slug &&
      locationA.type === locationB.type
    );
  }

  async fetchHistoryEntries() {
    return this.tradeLocationHistory.fetchHistoryEntries();
  }

  async clearHistoryEntries() {
    return this.tradeLocationHistory.clearHistoryEntries();
  }

  private parseCurrentPath(): ParsedPath {
    const [type, league, slug] = window.location.pathname.replace('/trade/', '').split('/');
    const baseUrl = `${window.location.origin}/trade`;

    return {baseUrl, type, league, slug};
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
