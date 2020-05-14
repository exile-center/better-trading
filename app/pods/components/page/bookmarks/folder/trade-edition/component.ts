// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface Args {
  folderId: string;
  trade: BookmarksTradeStruct;
  onCancel: () => void;
  submitTask: any;
}

export default class TradeEdition extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  trade: BookmarksTradeStruct = this.args.trade;

  get canSubmit() {
    return Boolean(this.trade.title);
  }

  @action
  changeTitle(title: string) {
    this.trade = {...this.trade, title};
  }
}
