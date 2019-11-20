// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';
import {action} from "@ember/object";
import {inject as service} from '@ember/service';

// Types
import {
  BookmarkFolderItemIcon,
  BookmarksFolderStruct,
  BookmarksTradeStruct
} from "better-trading/types/bookmarks";
import Location from "better-trading/services/location";
import Bookmarks from "better-trading/services/bookmarks";

interface Args {
  folder: BookmarksFolderStruct;
  onEdit: (folder: BookmarksFolderStruct) => void;
}

export default class BookmarksFolder extends Component<Args> {
  fadeTransition = fade;

  @service('location')
  location: Location;

  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  stagedTrade: BookmarksTradeStruct | null;

  @tracked
  isExpanded: boolean = this.bookmarks.isFolderExpanded(this.args.folder.id);

  @tracked
  trades: BookmarksTradeStruct[] = this.bookmarks.fetchTradesByFolderId(this.args.folder.id);

  get iconPath() {
    if (!this.args.folder.icon) return;

    return `bookmark-folder/${this.args.folder.icon}.png`;
  }

  get iconIsItem() {
    if (!this.args.folder.icon) return false;

    return (Object.values(BookmarkFolderItemIcon) as string[]).includes(this.args.folder.icon);
  }

  @action
  toggleExpansion() {
    this.isExpanded = this.bookmarks.toggleFolderExpansion(this.args.folder.id);
  }

  @action
  unstageTrade() {
    this.stagedTrade = null;
  }

  @action
  handleTradeSave() {
    this.trades = this.bookmarks.fetchTradesByFolderId(this.args.folder.id);
    this.unstageTrade();
  }

  @action
  createTrade() {
    if (!this.location.slug) return;

    this.stagedTrade = this.bookmarks.initializeTradeStructFrom({
      slug: this.location.slug,
      type: this.location.type
    }, this.args.folder.id);
  }

  @action
  navigateToTrade(trade: BookmarksTradeStruct) {
    this.location.navigateToTradeLocation(trade.location)
  }

  @action
  editFolder() {
    this.args.onEdit(this.args.folder);
  }
}
