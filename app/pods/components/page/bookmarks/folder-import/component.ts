// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface Args {
  onCancel: () => void;
  submitTask: any;
}

export default class FolderImport extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  stagedFolder: BookmarksFolderStruct | null = null;

  @tracked
  stagedTrades: BookmarksTradeStruct[] = [];

  @tracked
  isInvalid: boolean = false;

  get canSubmit() {
    return Boolean(this.stagedFolder);
  }

  get submitEntity() {
    return {
      folder: this.stagedFolder,
      trades: this.stagedTrades
    };
  }

  @action
  handleInput(input: string) {
    const result = this.bookmarks.deserializeFolder(input);

    if (result) {
      const [folder, trades] = result;

      this.isInvalid = false;
      this.stagedFolder = folder;
      this.stagedTrades = trades;
    } else {
      this.isInvalid = true;
      this.stagedFolder = null;
      this.stagedTrades = [];
    }
  }
}
