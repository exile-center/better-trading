// Vendor
import Service from '@ember/service';
import {task, timeout} from 'ember-concurrency';
import window from 'ember-window-mock';

// Constants
const POLLING_DELAY = 500;
const BASE_URL = 'https://www.pathofexile.com/trade';

interface ParsedPath {
  tab: string;
  league: string;
  slug?: string;
}

export default class TradeLocation extends Service.extend({
  locationPollingTask: task(function*(this: TradeLocation) {
    const {tab, league, slug} = this.parseCurrentPath();

    this.setProperties({
      league: league || null,
      slug: slug || null,
      tab: tab || null
    });

    yield timeout(POLLING_DELAY);
    this.locationPollingTask.perform();
  })
}) {
  league: string | null;
  slug: string | null;
  tab: string | null;

  startUrlPolling() {
    this.locationPollingTask.perform();
  }

  navigateToTrade(slug: string) {
    const {league} = this.parseCurrentPath();
    const newUrl = [BASE_URL, 'search', league, slug].join('/');

    window.location.replace(newUrl);
  }

  private parseCurrentPath(): ParsedPath {
    const [tab, league, slug] = window.location.pathname
      .replace('/trade/', '')
      .split('/');

    return {tab, league, slug};
  }
}

declare module '@ember/service' {
  interface Registry {
    'trade-location': TradeLocation;
  }
}
