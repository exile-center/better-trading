// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarkTradeStruct} from 'better-trading/types/bookmarks';

interface Args {
  folderId: string;
  trade: BookmarkTradeStruct;
  onCancel: () => void;
  submitTask: any;
}

export default class BookmarksTradeEdition extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  trade: BookmarkTradeStruct = this.args.trade;

  @action
  changeTitle(title: string) {
    this.trade = {...this.trade, title};
  }
}
