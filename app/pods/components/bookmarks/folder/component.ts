// Vendor
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';
import {action} from "@ember/object";
import {inject as service} from '@ember/service';

// Types
import {BookmarksFolderStruct, BookmarksTradeStruct} from "better-trading/types/bookmarks";
import Location from "better-trading/services/location";
import Bookmarks from "better-trading/services/bookmarks";

interface Args {
  folder: BookmarksFolderStruct;
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

  @action
  toggleExpansion() {
    this.isExpanded = this.bookmarks.toggleFolderExpansion(this.args.folder.id);
  }

  @action
  unstageTrade() {
    this.stagedTrade = null;
  }

  @action
  handleTradeSave(trade: BookmarksTradeStruct) {
    this.trades = [...this.trades, trade];
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
}