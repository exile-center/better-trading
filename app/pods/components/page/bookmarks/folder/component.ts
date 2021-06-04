// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {dropTask} from 'ember-concurrency-decorators';

// Utilities
import {copyToClipboard} from 'better-trading/utilities/copy-to-clipboard';

// Types
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import TradeLocation from 'better-trading/services/trade-location';
import Bookmarks from 'better-trading/services/bookmarks';
import SearchPanel from 'better-trading/services/search-panel';
import {TradeLocationChangeEvent} from 'better-trading/types/trade-location';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import IntlService from 'ember-intl/services/intl';

interface Args {
  folder: Required<BookmarksFolderStruct>;
  dragHandle: any;
  expandedFolderIds: string[];
  onEdit: () => void;
  onDelete: () => void;
  onExpansionToggle: () => void;
  onArchiveToggle: () => void;
}

export default class BookmarksFolder extends Component<Args> {
  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('search-panel')
  searchPanel: SearchPanel;

  @service('flash-messages')
  flashMessages: FlashMessages;

  @service('intl')
  intl: IntlService;

  @tracked
  currentLeague: string | null = this.tradeLocation.league;

  @tracked
  stagedTrade: BookmarksTradeStruct | null;

  @tracked
  stagedDeletingTrade: BookmarksTradeStruct | null;

  @tracked
  isReorderingTrades: boolean = false;

  @tracked
  trades: BookmarksTradeStruct[] | null = null;

  @tracked
  isExporting: boolean = false;

  get folderId() {
    return this.args.folder.id;
  }

  get isExpanded() {
    return !this.isArchived && this.args.expandedFolderIds.includes(this.args.folder.id);
  }

  get isArchived() {
    return Boolean(this.args.folder.archivedAt);
  }

  @dropTask
  *initialLoadTradesTask() {
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
  }

  @dropTask
  *deleteTradeTask(deletingTrade: BookmarksTradeStruct) {
    try {
      yield this.bookmarks.deleteTrade(deletingTrade, this.folderId);
      this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);

      this.flashMessages.success(
        this.intl.t('page.bookmarks.folder.delete-trade-success-flash', {title: deletingTrade.title})
      );
    } catch (_error) {
      this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    } finally {
      this.stagedDeletingTrade = null;
    }
  }

  @dropTask
  *reorderTradesTask(reorderedTrades: BookmarksTradeStruct[]) {
    this.trades = reorderedTrades;

    yield this.bookmarks.persistTrades(this.trades, this.folderId);
  }

  @dropTask
  *persistTradeTask(trade: BookmarksTradeStruct) {
    try {
      const isNewlyCreated = !trade.id;
      yield this.bookmarks.persistTrade(trade, this.folderId);
      this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);

      const successTranslationKey = isNewlyCreated
        ? 'page.bookmarks.folder.create-trade-success-flash'
        : 'page.bookmarks.folder.update-trade-success-flash';
      this.flashMessages.success(this.intl.t(successTranslationKey, {title: trade.title}));
    } catch (_error) {
      this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    } finally {
      this.stagedTrade = null;
    }
  }

  @dropTask
  *updateTradeLocationTask(trade: BookmarksTradeStruct) {
    if (!this.tradeLocation.slug || !this.tradeLocation.type) return;

    try {
      yield this.bookmarks.persistTrade(
        {
          ...trade,
          location: {
            slug: this.tradeLocation.slug,
            type: this.tradeLocation.type,
          },
        },
        this.folderId
      );

      this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);

      this.flashMessages.success(
        this.intl.t('page.bookmarks.folder.persist-trade-location-success-flash', {title: trade.title})
      );
    } catch (_error) {
      this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    } finally {
      this.stagedTrade = null;
    }
  }

  @dropTask
  *toggleTradeCompletionTask(trade: BookmarksTradeStruct) {
    yield this.bookmarks.toggleTradeCompletion(trade, this.folderId);
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
  }

  @action
  unstageTrade() {
    this.stagedTrade = null;
  }

  @action
  createTrade() {
    if (!this.tradeLocation.slug || !this.tradeLocation.type) return;

    const initializedTrade = this.bookmarks.initializeTradeStructFrom({
      baseUrl: this.tradeLocation.baseUrl,
      slug: this.tradeLocation.slug,
      type: this.tradeLocation.type,
    });

    this.stagedTrade = {
      ...initializedTrade,
      title: this.searchPanel.recommendTitle(),
    };
  }

  @action
  editTrade(trade: BookmarksTradeStruct) {
    this.stagedTrade = trade;
  }

  @action
  deleteTrade(trade: BookmarksTradeStruct) {
    this.stagedDeletingTrade = trade;
  }

  @action
  cancelTradeDeletion() {
    this.stagedDeletingTrade = null;
  }

  @action
  editFolder() {
    this.args.onEdit();
  }

  @action
  startTradesReordering() {
    this.isReorderingTrades = true;
  }

  @action
  stopTradesReordering() {
    this.isReorderingTrades = false;
  }

  @action
  exportFolder() {
    this.isExporting = true;
  }

  @action
  cancelExportFolder() {
    this.isExporting = false;
  }

  @action
  watchLeagueChange() {
    this.tradeLocation.on('change', this, this.handleTradeLocationChange);
  }

  @action
  teardownLeagueChange() {
    this.tradeLocation.off('change', this, this.handleTradeLocationChange);
  }

  @action
  copyToClipboard(trade: BookmarksTradeStruct) {
    if (!this.currentLeague) return;

    const tradeUrl = this.tradeLocation.getTradeUrl(trade.location.type, trade.location.slug, this.currentLeague, trade.location.baseUrl);
    copyToClipboard(tradeUrl);

    this.flashMessages.success(
      this.intl.t('page.bookmarks.folder.copy-trade-to-clipboard-success-flash', {title: trade.title})
    );
  }

  handleTradeLocationChange({newTradeLocation}: TradeLocationChangeEvent) {
    if (!newTradeLocation.league) return;
    if (newTradeLocation.league === this.currentLeague) return;

    this.currentLeague = newTradeLocation.league;
  }
}
