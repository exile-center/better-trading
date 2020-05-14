// Vendor
import Service from '@ember/service';
import window from 'ember-window-mock';
import {restartableTask} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';
import Evented from '@ember/object/evented';

// Types
import {TradeLocationChangeEvent, TradeLocationStruct} from 'better-trading/types/trade-location';
import {Task} from 'better-trading/types/ember-concurrency';

// Constants
const BASE_URL = 'https://www.pathofexile.com/trade';
const LOCATION_POLLING_INTERVAL_IN_MILLISECONDS = 500;

interface ParsedPath {
  type: string;
  league: string;
  slug?: string;
}

export default class TradeLocation extends Service.extend(Evented) {
  lastTradeLocation: TradeLocationStruct = this.currentTradeLocation;

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
      slug: this.slug,
      type: this.type,
      league: this.league
    };
  }

  @restartableTask
  *locationPollingTask() {
    const currentTradeLocation = this.currentTradeLocation;

    if (!this.compareTradeLocations(this.lastTradeLocation, currentTradeLocation)) {
      const changeEvent: TradeLocationChangeEvent = {
        oldTradeLocation: this.lastTradeLocation,
        newTradeLocation: currentTradeLocation
      };

      this.trigger('change', changeEvent);
      this.lastTradeLocation = currentTradeLocation;
    }

    yield timeout(LOCATION_POLLING_INTERVAL_IN_MILLISECONDS);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (this.locationPollingTask as Task).perform();
  }

  initialize() {
    window.addEventListener('focus', this.startLocationPolling.bind(this));
    window.addEventListener('blur', this.stopLocationPolling.bind(this));

    this.startLocationPolling();
  }

  teardown() {
    window.removeEventListener('focus', this.startLocationPolling);
    window.removeEventListener('blur', this.stopLocationPolling);
  }

  getTradeUrl(type: string, slug: string, league: string) {
    return [BASE_URL, type, league, slug].join('/');
  }

  compareTradeLocations(locationA: TradeLocationStruct, locationB: TradeLocationStruct) {
    return (
      locationA.league === locationB.league && locationA.slug === locationB.slug && locationA.type === locationB.type
    );
  }

  private parseCurrentPath(): ParsedPath {
    const [type, league, slug] = window.location.pathname.replace('/trade/', '').split('/');

    return {type, league, slug};
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
