// Vendor
import Service from '@ember/service';
import {inject as service} from '@ember/service';

// Types
import Bookmarks from './bookmarks';
import SearchPanel from './search-panel';
import TradeLocation from './trade-location';

export default class PageTitle extends Service {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('search-panel')
  searchPanel: SearchPanel;

  // null implies "uncontrolled by the service"
  private _title: string | null = null;
  private _baseSiteTitle: string = '';
  private _titleObserver: MutationObserver;

  async initialize(): Promise<void> {
    const titleElement = document.querySelector('title');
    if (!titleElement) {
      return;
    }
    this._baseSiteTitle = document.title;

    // The observer is to counteract the trade site's native behavior of regularly
    // resetting the document title in response to various UI interactions
    this._titleObserver = new MutationObserver(() => {
      this.onDocumentTitleMutation();
    });
    this._titleObserver.observe(titleElement, {childList: true});

    // It's okay for multiple floating recalculateTitle() promises to race each other
    this.bookmarks.on('change', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.recalculateTitle();
    });
    this.tradeLocation.on('change', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.recalculateTitle();
    });

    await this.recalculateTitle();
  }

  private async recalculateTitle(): Promise<void> {
    const activeBookmark = await this.bookmarks.fetchTradeByLocation(this.tradeLocation.currentTradeLocation);

    const isLiveSegment = this.tradeLocation.isLive ? '⚡ ' : '';
    const activeTradeTitle = activeBookmark ? activeBookmark.title : this.searchPanel.recommendTitle();
    const tradeTitleSegment = activeTradeTitle ? `${activeTradeTitle} - ` : '';

    this.title = `${isLiveSegment}${tradeTitleSegment}${this._baseSiteTitle}`;
  }

  set title(value: string) {
    if (value !== this._title) {
      this._title = value;
      document.title = value;
    }
  }

  private onDocumentTitleMutation(): void {
    if (this._title != null && document.title !== this._title) {
      this._baseSiteTitle = document.title;
      document.title = this._title;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'page-title': PageTitle;
  }
}
