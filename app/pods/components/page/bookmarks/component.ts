// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {dropTask, restartableTask} from 'ember-concurrency-decorators';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import IntlService from 'ember-intl/services/intl';

// Constants
const FOLDERS_WARNING_THRESHOLD = 10;

export default class PageBookmarks extends Component {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('flash-messages')
  flashMessages: FlashMessages;

  @service('intl')
  intl: IntlService;

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
  *initialFetchFoldersTask() {
    this.folders = yield this.bookmarks.fetchFolders();
  }

  @restartableTask
  *refetchFoldersTask() {
    this.folders = yield this.bookmarks.fetchFolders();
  }

  @dropTask
  *deleteFolderTask(deletingFolder: BookmarksFolderStruct) {
    try {
      yield this.bookmarks.deleteFolder(deletingFolder);
      this.folders = yield this.bookmarks.fetchFolders();

      this.flashMessages.success(
        this.intl.t('page.bookmarks.delete-folder-success-flash', {title: deletingFolder.title})
      );
    } catch (_error) {
      this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    }
  }

  @dropTask
  *reorderFoldersTask(reorderedFolders: BookmarksFolderStruct[]) {
    this.folders = reorderedFolders;

    yield this.bookmarks.persistFolders(this.folders);
  }

  @dropTask
  *persistFolderTask(folder: BookmarksFolderStruct) {
    try {
      const isNewlyCreated = !folder.id;

      const folderId = yield this.bookmarks.persistFolder(folder);
      if (isNewlyCreated) this.toggleFolderExpansion(folderId);
      this.folders = yield this.bookmarks.fetchFolders();

      const successTranslationKey = isNewlyCreated
        ? 'page.bookmarks.create-folder-success-flash'
        : 'page.bookmarks.update-folder-success-flash';
      this.flashMessages.success(this.intl.t(successTranslationKey, {title: folder.title}));
    } catch (_error) {
      this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    } finally {
      this.stagedFolder = null;
    }
  }

  @dropTask
  *persistImportedFolderTask({folder, trades}: {folder: BookmarksFolderStruct; trades: BookmarksTradeStruct[]}) {
    try {
      const folderId = yield this.bookmarks.persistFolder(folder);
      yield this.bookmarks.persistTrades(trades, folderId);

      this.toggleFolderExpansion(folderId);
      this.folders = yield this.bookmarks.fetchFolders();

      this.flashMessages.success(this.intl.t('page.bookmarks.import-folder-success-flash', {title: folder.title}));
    } catch (_error) {
      this.flashMessages.alert(this.intl.t('general.generic-alert-flash'));
    } finally {
      this.isImportingFolder = false;
    }
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
