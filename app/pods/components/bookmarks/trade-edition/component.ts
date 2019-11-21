// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {dropTask} from 'ember-concurrency-decorators';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface Args {
  folderId: string;
  trade: BookmarksTradeStruct;
  onCancel: () => void;
  onSave: (trade: BookmarksTradeStruct) => void;
}

export default class BookmarksTradeEdition extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  trade: BookmarksTradeStruct = this.args.trade;

  @dropTask
  *persistTradeTask() {
    const updatedTrade = this.bookmarks.persistTrade(this.trade);
    this.args.onSave(updatedTrade);
  }

  @action
  changeTitle(title: string) {
    this.trade = {...this.trade, title};
  }
}
