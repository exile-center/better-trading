// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {dropTask} from 'ember-concurrency-decorators';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarkFolderStruct} from 'better-trading/types/bookmarks';

export default class PageBookmarks extends Component {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  stagedFolder: BookmarkFolderStruct | null;

  @tracked
  folders: BookmarkFolderStruct[] = [];

  @tracked
  newFolderId: number | null = null;

  @tracked
  expandedFolderIds: string[] = this.bookmarks.getExpandedFolderIds();

  @dropTask
  *fetchFoldersTask() {
    this.folders = yield this.bookmarks.fetchFolders();
  }

  @dropTask
  *deleteFolderTask(deletingFolder: BookmarkFolderStruct) {
    yield this.bookmarks.deleteFolder(deletingFolder);
    this.folders = yield this.bookmarks.fetchFolders();
  }

  @dropTask
  *reorderFoldersTask(reorderedFolders: BookmarkFolderStruct[]) {
    this.folders = reorderedFolders;

    yield this.bookmarks.persistFolders(this.folders);
  }

  @dropTask
  *persistFolderTask(folder: BookmarkFolderStruct) {
    const isNewlyCreated = !folder.id;

    const folderId = yield this.bookmarks.persistFolder(folder);

    if (isNewlyCreated) this.toggleFolderExpansion(folderId);
    this.folders = yield this.bookmarks.fetchFolders();
    this.stagedFolder = null;
  }

  @action
  createFolder() {
    this.stagedFolder = this.bookmarks.initializeFolderStruct();
  }

  @action
  stageFolder(folder: BookmarkFolderStruct) {
    this.stagedFolder = folder;
  }

  @action
  unstageFolder() {
    this.stagedFolder = null;
  }

  @action
  toggleFolderExpansion(folderId: string) {
    this.expandedFolderIds = this.bookmarks.toggleFolderExpansion(this.expandedFolderIds, folderId);
  }

  @action
  collapseAllFolderIds() {
    this.expandedFolderIds = this.bookmarks.collapseAllFolderIds();
  }
}
