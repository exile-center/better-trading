// Vendor
import Component from '@glimmer/component';

// Types
import {BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface Args {
  trade: BookmarksTradeStruct;
  onCancel: () => void;
  submitTask: any;
}

export default class TradeDeletion extends Component<Args> {}
