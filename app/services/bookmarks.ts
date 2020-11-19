// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import BookmarksState from 'better-trading/services/bookmarks/state';
import BookmarksStorage from 'better-trading/services/bookmarks/storage';
import BookmarksShare from 'better-trading/services/bookmarks/share';
import {BookmarksFolderStruct, BookmarksTradeLocation, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

export default class Bookmarks extends Service {
  @service('bookmarks/storage')
  bookmarksStorage: BookmarksStorage;

  @service('bookmarks/state')
  bookmarksState: BookmarksState;

  @service('bookmarks/share')
  bookmarksShare: BookmarksShare;

  async fetchFolders() {
    return this.bookmarksStorage.fetchFolders();
  }

  async fetchTradesByFolderId(folderId: string) {
    return this.bookmarksStorage.fetchTradesByFolderId(folderId);
  }

  async persistFolder(bookmarkFolder: BookmarksFolderStruct) {
    return this.bookmarksStorage.persistFolder(bookmarkFolder);
  }

  async persistFolders(bookmarkFolders: BookmarksFolderStruct[]) {
    return this.bookmarksStorage.persistFolders(bookmarkFolders);
  }

  async persistTrade(bookmarkTrade: BookmarksTradeStruct, folderId: string) {
    return this.bookmarksStorage.persistTrade(bookmarkTrade, folderId);
  }

  async persistTrades(bookmarkTrades: BookmarksTradeStruct[], folderId: string) {
    return this.bookmarksStorage.persistTrades(bookmarkTrades, folderId);
  }

  async deleteTrade(deletingTrade: BookmarksTradeStruct, folderId: string) {
    if (!deletingTrade.id) return;

    return this.bookmarksStorage.deleteTrade(deletingTrade.id, folderId);
  }

  async deleteFolder(deletingFolder: BookmarksFolderStruct) {
    if (!deletingFolder.id) return;

    return this.bookmarksStorage.deleteFolder(deletingFolder.id);
  }

  initializeFolderStruct(): BookmarksFolderStruct {
    return {
      icon: null,
      title: '',
    };
  }

  initializeTradeStructFrom(location: BookmarksTradeLocation): BookmarksTradeStruct {
    return {
      location,
      title: '',
      completedAt: null,
    };
  }

  toggleFolderExpansion(expandedFolderIds: string[], bookmarkFolderId: string) {
    return this.bookmarksState.toggleFolderExpansion(expandedFolderIds, bookmarkFolderId);
  }

  getExpandedFolderIds() {
    return this.bookmarksState.getExpandedFolderIds();
  }

  collapseAllFolderIds() {
    return this.bookmarksState.collapseAllFolderIds();
  }

  serializeFolder(folder: BookmarksFolderStruct, trades: BookmarksTradeStruct[]) {
    return this.bookmarksShare.serialize(folder, trades);
  }

  deserializeFolder(serializedFolder: string) {
    return this.bookmarksShare.deserialize(serializedFolder);
  }
}

declare module '@ember/service' {
  interface Registry {
    bookmarks: Bookmarks;
  }
}
