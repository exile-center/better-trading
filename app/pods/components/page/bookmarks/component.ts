// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {dropTask} from 'ember-concurrency-decorators';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

// Constants
const FOLDERS_WARNING_THRESHOLD = 10;

export default class PageBookmarks extends Component {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @tracked
  stagedFolder: BookmarksFolderStruct | null;

  @tracked
  folders: BookmarksFolderStruct[] = [];

  @tracked
  newFolderId: number | null = null;

  @tracked
  expandedFolderIds: string[] = this.bookmarks.getExpandedFolderIds();

  @tracked
  isImportingFolder: boolean = false;

  get foldersWarningIsVisible() {
    return this.folders.length >= FOLDERS_WARNING_THRESHOLD;
  }

  @dropTask
  *fetchFoldersTask() {
    this.folders = yield this.bookmarks.fetchFolders();
  }

  @dropTask
  *deleteFolderTask(deletingFolder: BookmarksFolderStruct) {
    yield this.bookmarks.deleteFolder(deletingFolder);
    this.folders = yield this.bookmarks.fetchFolders();
  }

  @dropTask
  *reorderFoldersTask(reorderedFolders: BookmarksFolderStruct[]) {
    this.folders = reorderedFolders;

    yield this.bookmarks.persistFolders(this.folders);
  }

  @dropTask
  *persistFolderTask(folder: BookmarksFolderStruct) {
    const isNewlyCreated = !folder.id;

    const folderId = yield this.bookmarks.persistFolder(folder);

    if (isNewlyCreated) this.toggleFolderExpansion(folderId);
    this.folders = yield this.bookmarks.fetchFolders();
    this.stagedFolder = null;
  }

  @dropTask
  *persistImportedFolderTask({folder, trades}: {folder: BookmarksFolderStruct; trades: BookmarksTradeStruct[]}) {
    const folderId = yield this.bookmarks.persistFolder(folder);
    yield this.bookmarks.persistTrades(trades, folderId);

    this.toggleFolderExpansion(folderId);
    this.folders = yield this.bookmarks.fetchFolders();
    this.isImportingFolder = false;
  }

  @action
  createFolder() {
    this.stagedFolder = this.bookmarks.initializeFolderStruct();
  }

  @action
  stageFolder(folder: BookmarksFolderStruct) {
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

  @action
  importFolder() {
    this.isImportingFolder = true;
  }

  @action
  cancelImportFolder() {
    this.isImportingFolder = false;
  }
}
