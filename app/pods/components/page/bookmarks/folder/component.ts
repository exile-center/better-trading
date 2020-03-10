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
import {BookmarkFolderItemIcon, BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import Location from 'better-trading/services/location';
import Bookmarks from 'better-trading/services/bookmarks';

interface Args {
  folder: Required<BookmarksFolderStruct>;
  dragHandle: any;
  onEdit: (folder: BookmarksFolderStruct) => void;
  onDelete: (deletingFolder: BookmarksFolderStruct) => void;
}

// Constants
const EXPANSION_ANIMATION_DURATION_IN_MILLISECONDS = 500;

export default class BookmarksFolder extends Component<Args> {
  fadeTransition = fade;

  @service('location')
  location: Location;

  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  stagedTrade: BookmarksTradeStruct | null;

  @tracked
  stagedDeletingTrade: BookmarksTradeStruct | null;

  @tracked
  isStagedForDeletion: boolean;

  @tracked
  isExpanded: boolean = this.bookmarks.isFolderExpanded(this.args.folder.id);

  @tracked
  isLoaded: boolean = false;

  @tracked
  isAnimating: boolean = false;

  @tracked
  isReorderingTrades: boolean = false;

  @tracked
  trades: BookmarksTradeStruct[] = [];

  get iconPath() {
    if (!this.args.folder.icon) return;

    return `bookmark-folder/${this.args.folder.icon}.png`;
  }

  get iconIsItem() {
    if (!this.args.folder.icon) return false;

    return (Object.values(BookmarkFolderItemIcon) as string[]).includes(this.args.folder.icon);
  }

  @dropTask
  *refreshTradesTask() {
    if (!this.isExpanded) return;

    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.isLoaded = true;
  }

  @dropTask
  *deleteTradeTask(deletingTrade: BookmarksTradeStruct) {
    yield this.bookmarks.deleteTrade(deletingTrade);
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.stagedDeletingTrade = null;
  }

  @dropTask
  *reorderTradesTask(reorderedTrades: BookmarksTradeStruct[]) {
    this.trades = this.bookmarks.reorderTrades(reorderedTrades);

    yield this.bookmarks.persistTrades(this.trades);
  }

  @dropTask
  *persistTradeTask(trade: BookmarksTradeStruct) {
    yield this.bookmarks.persistTrade(trade);
    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.stagedTrade = null;
  }

  @dropTask
  *updateTradeLocationTask(trade: BookmarksTradeStruct) {
    if (!this.location.slug) return;

    yield this.bookmarks.persistTrade({
      ...trade,
      location: {
        slug: this.location.slug,
        type: this.location.type
      }
    });

    this.trades = yield this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
  }

  @dropTask
  *toggleExpansionTask() {
    this.isAnimating = true;
    this.isExpanded = this.bookmarks.toggleFolderExpansion(this.args.folder.id);
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

    this.stagedTrade = this.bookmarks.initializeTradeStructFrom(
      {
        slug: this.location.slug,
        type: this.location.type
      },
      this.args.folder.id,
      this.trades.length
    );
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
  navigateToTrade(trade: BookmarksTradeStruct) {
    this.location.navigateTo(trade.location.type, trade.location.slug);
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
}
