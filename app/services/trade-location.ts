// Vendor
import Service from '@ember/service';
import {task, timeout} from "ember-concurrency";
import window from 'ember-window-mock';

// Constants
const POLLING_DELAY = 500;

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
