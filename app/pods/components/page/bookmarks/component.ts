// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from "better-trading/services/bookmarks";
import {BookmarksFolderStruct} from "better-trading/types/bookmarks";

export default class PageBookmarks extends Component {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  stagedFolder: BookmarksFolderStruct | null;

  @tracked
  folders: BookmarksFolderStruct[] = this.bookmarks.fetchFolders();

  @action
  createFolder() {
    this.stagedFolder = this.bookmarks.initializeFolderStruct();
  }

  @action
  unstageFolder() {
    this.stagedFolder = null;
  }

  @action
  handleFolderSave(folder: BookmarksFolderStruct) {
    this.folders = [...this.folders, folder];
    this.unstageFolder();
  }
}
