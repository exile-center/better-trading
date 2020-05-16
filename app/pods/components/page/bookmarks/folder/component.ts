// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {dropTask} from 'ember-concurrency-decorators';

// Types
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import TradeLocation from 'better-trading/services/trade-location';
import Bookmarks from 'better-trading/services/bookmarks';
import SearchPanel from 'better-trading/services/search-panel';
import {TradeLocationChangeEvent} from 'better-trading/types/trade-location';

interface Args {
  folder: Required<BookmarksFolderStruct>;
  dragHandle: any;
  expandedFolderIds: string[];
  onEdit: (folder: BookmarksFolderStruct) => void;
  onDelete: (deletingFolder: BookmarksFolderStruct) => void;
  onExpansionToggle: (folderId: string) => void;
}

export default class BookmarksFolder extends Component<Args> {
  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('search-panel')
  searchPanel: SearchPanel;

  @tracked
  currentLeague: string | null = this.tradeLocation.league;

  @tracked
  stagedTrade: BookmarksTradeStruct | null;

  @tracked
  stagedDeletingTrade: BookmarksTradeStruct | null;

  @tracked
  isStagedForDeletion: boolean;

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
    return this.args.expandedFolderIds.includes(this.args.folder.id);
  }

  @dropTask
  *initialLoadTradesTask() {
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
  }

  @dropTask
  *deleteTradeTask(deletingTrade: BookmarksTradeStruct) {
    yield this.bookmarks.deleteTrade(deletingTrade, this.folderId);
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.stagedDeletingTrade = null;
  }

  @dropTask
  *reorderTradesTask(reorderedTrades: BookmarksTradeStruct[]) {
    this.trades = reorderedTrades;

    yield this.bookmarks.persistTrades(this.trades, this.folderId);
  }

  @dropTask
  *persistTradeTask(trade: BookmarksTradeStruct) {
    yield this.bookmarks.persistTrade(trade, this.folderId);
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.stagedTrade = null;
  }

  @dropTask
  *updateTradeLocationTask(trade: BookmarksTradeStruct) {
    if (!this.tradeLocation.slug || !this.tradeLocation.type) return;

    yield this.bookmarks.persistTrade(
      {
        ...trade,
        location: {
          slug: this.tradeLocation.slug,
          type: this.tradeLocation.type
        }
      },
      this.folderId
    );

    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
  }

  @dropTask
  *toggleTradeCompletionTask(trade: BookmarksTradeStruct) {
    yield this.bookmarks.persistTrade(
      {
        ...trade,
        completedAt: trade.completedAt ? null : new Date().toUTCString()
      },
      this.folderId
    );

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
      slug: this.tradeLocation.slug,
      type: this.tradeLocation.type
    });

    this.stagedTrade = {
      ...initializedTrade,
      title: this.searchPanel.recommendTitle()
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
  deleteFolder() {
    this.isStagedForDeletion = true;
  }

  @action
  cancelFolderDeletion() {
    this.isStagedForDeletion = false;
  }

  @action
  confirmFolderDeletion() {
    this.args.onDelete(this.args.folder);
    this.isStagedForDeletion = false;
  }

  @action
  editFolder() {
    this.args.onEdit(this.args.folder);
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

  handleTradeLocationChange({newTradeLocation}: TradeLocationChangeEvent) {
    if (!newTradeLocation.league) return;
    if (newTradeLocation.league === this.currentLeague) return;

    this.currentLeague = newTradeLocation.league;
  }
}
