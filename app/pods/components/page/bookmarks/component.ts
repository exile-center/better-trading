// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct} from 'better-trading/types/bookmarks';

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
  handleEdit(folder: BookmarksFolderStruct) {
    this.stagedFolder = folder;
  }

  @action
  unstageFolder() {
    this.stagedFolder = null;
  }

  @action
  handleFolderSave() {
    this.folders = this.bookmarks.fetchFolders();
    this.unstageFolder();
  }

  @action
  reorderFolders(reorderedFolders: BookmarksFolderStruct[]) {
    this.folders = this.bookmarks.reorderFolders(reorderedFolders);
  }
}
