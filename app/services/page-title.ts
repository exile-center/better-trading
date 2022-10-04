// Vendor
import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {throttle} from 'lodash';
// Types
import Bookmarks from './bookmarks';
import SearchPanel from './search-panel';
import TradeLocation from './trade-location';

const TITLE_MUTATION_THROTTLE_SPACING_MS = 100;

export default class PageTitle extends Service {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('search-panel')
  searchPanel: SearchPanel;

  baseSiteTitle: string = '';

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
      this.updateTitle();
    });
    this.tradeLocation.on('change', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.updateTitle();
    });

    await this.updateTitle();
  }

  async calculateTitle(): Promise<string> {
    const currentLocation = this.tradeLocation.currentTradeLocation;
    const activeBookmark = await this.bookmarks.fetchTradeByLocation(currentLocation);

    let activeTradeTitle = '';
    if (activeBookmark) activeTradeTitle = activeBookmark.title;
    else if (currentLocation.type === 'search') activeTradeTitle = this.searchPanel.recommendTitle();

    const isLiveSegment = currentLocation.isLive ? '⚡ ' : '';
    const tradeTitleSegment = activeTradeTitle ? `${activeTradeTitle} - ` : '';

    return `${isLiveSegment}${tradeTitleSegment}${this.baseSiteTitle}`;
  }

  async updateTitle(): Promise<void> {
    const newTitle = await this.calculateTitle();

    if (newTitle !== this.title) {
      this.title = newTitle;
      document.title = newTitle;
    }
  }

  private onDocumentTitleMutation(): void {
    if (this.title != null && document.title !== this.title) {
      document.title = this.title;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'page-title': PageTitle;
  }
}
