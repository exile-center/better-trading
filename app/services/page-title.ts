// Vendor
import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {throttle} from 'lodash';
// Types
import Bookmarks from './bookmarks';
import SearchPanel from './search-panel';
import TradeLocation from './trade-location';

const TITLE_MUTATION_THROTTLE_SPACING_MS = 100;
const WOOP_PREFIX_REGEX = /^\((\d+)\) /;

export default class PageTitle extends Service {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('search-panel')
  searchPanel: SearchPanel;

  // The base site uses a title like "Trade - Path of Exile" (but translated),
  // except that if you have an unread woop, it will instead be like
  // "(3) Trade - Path of Exile" where "3" is the unread woop count.
  // baseSiteTitle is always the normal form (without the woop count).
  baseSiteTitle: string = '';
  lastWoopCount: number | null = null;

  // null implies "uncontrolled by the service"
  private title: string | null = null;
  private titleMutationObserver: MutationObserver;

  async initialize(): Promise<void> {
    const titleElement = document.querySelector('title');
    if (!titleElement) {
      return;
    }
    this.baseSiteTitle = document.title;

    // The observer is to counteract the trade site's native behavior of regularly
    // resetting the document title in response to various UI interactions.
    //
    // The throttling is to prevent infinite busy loops/sad tabs in the event that some
    // other extension/userscript happens to be trying to fight us to change the title.
    const throttledTitleMutationHandler = throttle(
      () => this.onDocumentTitleMutation(),
      TITLE_MUTATION_THROTTLE_SPACING_MS,
      {leading: true, trailing: true}
    );
    this.titleMutationObserver = new MutationObserver(throttledTitleMutationHandler);
    this.titleMutationObserver.observe(titleElement, {childList: true});

    // It's okay for multiple floating recalculateTitle() promises to race each other
    this.bookmarks.on('change', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.recalculateTradeTitleSegment();
    });
    this.tradeLocation.on('change', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.recalculateTradeTitleSegment();
    });

    await this.recalculateTradeTitleSegment();
  }

  async recalculateTradeTitleSegment(): Promise<void> {
    const currentLocation = this.tradeLocation.currentTradeLocation;
    const activeBookmark = await this.bookmarks.fetchTradeByLocation(currentLocation);

    let activeTradeTitle = '';
    if (activeBookmark) activeTradeTitle = activeBookmark.title;
    else if (currentLocation.type === 'search') activeTradeTitle = this.searchPanel.recommendTitle();

    const isLiveSegment = currentLocation.isLive ? '⚡ ' : '';
    const tradeTitleSegment = activeTradeTitle ? `${activeTradeTitle} - ` : '';

    this.title = `${isLiveSegment}${tradeTitleSegment}${this.baseSiteTitle}`;
    this.updateTitle();
  }

  updateTitle(): void {
    if (this.title === null) {
      return;
    }

    const woopPrefix = this.lastWoopCount !== null ? `(${this.lastWoopCount}) ` : '';
    const newTitle = woopPrefix + this.title;
    if (document.title !== newTitle) {
      document.title = newTitle;
    }
  }

  // null indicates "doesn't seem to have a woop count prefix"
  parseWoopCount(title: string): number | null {
    const woopTitleMatch = WOOP_PREFIX_REGEX.exec(title);
    if (woopTitleMatch) {
      const parsedWoopCount = parseInt(woopTitleMatch[1], 10);
      return isNaN(parsedWoopCount) ? null : parsedWoopCount;
    }
    return null;
  }

  onDocumentTitleMutation(): void {
    this.lastWoopCount = this.parseWoopCount(document.title);
    this.updateTitle();
  }
}

declare module '@ember/service' {
  interface Registry {
    'page-title': PageTitle;
  }
}
