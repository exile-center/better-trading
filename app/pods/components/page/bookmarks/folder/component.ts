// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {dropTask} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';

// Utilities
import performTask from 'better-trading/utilities/perform-task';

// Types
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import Location from 'better-trading/services/location';
import Bookmarks from 'better-trading/services/bookmarks';
import SearchPanel from 'better-trading/services/search-panel';

interface Args {
  folder: Required<BookmarksFolderStruct>;
  dragHandle: any;
  expandedFolderIds: string[];
  onEdit: (folder: BookmarksFolderStruct) => void;
  onDelete: (deletingFolder: BookmarksFolderStruct) => void;
  onExpansionToggle: (folderId: string) => void;
}

// Constants
const EXPANSION_ANIMATION_DURATION_IN_MILLISECONDS = 500;

export default class BookmarksFolder extends Component<Args> {
  fadeTransition = fade;

  @service('location')
  location: Location;

  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('search-panel')
  searchPanel: SearchPanel;

  @tracked
  stagedTrade: BookmarksTradeStruct | null;

  @tracked
  stagedDeletingTrade: BookmarksTradeStruct | null;

  @tracked
  isStagedForDeletion: boolean;

  @tracked
  isLoaded: boolean = false;

  @tracked
  isAnimating: boolean = false;

  @tracked
  isReorderingTrades: boolean = false;

  @tracked
  trades: BookmarksTradeStruct[] = [];

  @tracked
  isExporting: boolean = false;

  get folderId() {
    return this.args.folder.id;
  }

  get isExpanded() {
    return this.args.expandedFolderIds.includes(this.args.folder.id);
  }

  @dropTask
  *initialSetupTask() {
    if (!this.isExpanded) return;

    this.isAnimating = true;

    yield performTask(this.refreshTradesTask);
    yield timeout(EXPANSION_ANIMATION_DURATION_IN_MILLISECONDS);

    this.isAnimating = false;
  }

  @dropTask
  *refreshTradesTask() {
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.isLoaded = true;
  }

  @dropTask
  *deleteTradeTask(deletingTrade: BookmarksTradeStruct) {
    yield this.bookmarks.deleteTrade(deletingTrade, this.folderId);
    yield performTask(this.refreshTradesTask);
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
    yield performTask(this.refreshTradesTask);
    this.stagedTrade = null;
  }

  @dropTask
  *updateTradeLocationTask(trade: BookmarksTradeStruct) {
    if (!this.location.slug) return;

    yield this.bookmarks.persistTrade(
      {
        ...trade,
        location: {
          slug: this.location.slug,
          type: this.location.type
        }
      },
      this.folderId
    );

    yield performTask(this.refreshTradesTask);
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

    yield performTask(this.refreshTradesTask);
  }

  @dropTask
  *toggleExpansionTask() {
    this.isAnimating = true;
    this.args.onExpansionToggle(this.args.folder.id);

    yield performTask(this.refreshTradesTask);
    yield timeout(EXPANSION_ANIMATION_DURATION_IN_MILLISECONDS);

    this.isAnimating = false;
  }

  @action
  unstageTrade() {
    this.stagedTrade = null;
  }

  @action
  createTrade() {
    if (!this.location.slug) return;

    const initializedTrade = this.bookmarks.initializeTradeStructFrom({
      slug: this.location.slug,
      type: this.location.type
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
}
