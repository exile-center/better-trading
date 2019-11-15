// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {dropTask} from "ember-concurrency-decorators";

// Types
import Bookmarks from "better-trading/services/bookmarks";
import {BookmarksFolderStruct} from "better-trading/types/bookmarks";

interface Args {
  folder: BookmarksFolderStruct;
  onCancel: () => void;
  onSave: (bookmarkFolder: BookmarksFolderStruct) => void;
}

export default class BookmarksFolderEdition extends Component<Args> {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  folder: BookmarksFolderStruct = this.args.folder;

  @dropTask
  *persistFolderTask() {
    const updatedFolder = this.bookmarks.persistFolder(this.folder);
    this.args.onSave(updatedFolder);
  }

  @action
  changeTitle(title: string) {
    this.folder = {...this.folder, title};
  }
}
