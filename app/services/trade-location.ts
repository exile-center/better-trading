// Vendor
import Service from '@ember/service';
import window from 'ember-window-mock';

// Constants
const BASE_URL = 'https://www.pathofexile.com/trade';

interface ParsedPath {
  tab: string;
  league: string;
  slug?: string;
}

export default class TradeLocation extends Service {
  get tab(): string {
    const {tab} = this.parseCurrentPath();

    return tab;
  }

  get league(): string {
    const {league} = this.parseCurrentPath();

    return league;
  }

  get slug(): string | null {
    const {slug} = this.parseCurrentPath();

    return slug || null;
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
