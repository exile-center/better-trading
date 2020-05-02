// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import BookmarksState from 'better-trading/services/bookmarks/state';
import BookmarksStorage from 'better-trading/services/bookmarks/storage';
import {BookmarkFolderStruct, BookmarkTradeLocation, BookmarkTradeStruct} from 'better-trading/types/bookmarks';

export default class Bookmarks extends Service {
  @service('bookmarks/storage')
  bookmarksStorage: BookmarksStorage;

  @service('bookmarks/state')
  bookmarksState: BookmarksState;

  async fetchFolders() {
    return this.bookmarksStorage.fetchFolders();
  }

  async fetchTradesByFolderId(folderId: string) {
    return this.bookmarksStorage.fetchTradesByFolderId(folderId);
  }

  async persistFolder(bookmarkFolder: BookmarkFolderStruct) {
    return this.bookmarksStorage.persistFolder(bookmarkFolder);
  }

  async persistFolders(bookmarkFolders: BookmarkFolderStruct[]) {
    return this.bookmarksStorage.persistFolders(bookmarkFolders);
  }

  async persistTrade(bookmarkTrade: BookmarkTradeStruct, folderId: string) {
    return this.bookmarksStorage.persistTrade(bookmarkTrade, folderId);
  }

  async persistTrades(bookmarkTrades: BookmarkTradeStruct[], folderId: string) {
    return this.bookmarksStorage.persistTrades(bookmarkTrades, folderId);
  }

  async deleteTrade(deletingTrade: BookmarkTradeStruct, folderId: string) {
    if (!deletingTrade.id) return;

    return this.bookmarksStorage.deleteTrade(deletingTrade.id, folderId);
  }

  async deleteFolder(deletingFolder: BookmarkFolderStruct) {
    if (!deletingFolder.id) return;

    return this.bookmarksStorage.deleteFolder(deletingFolder.id);
  }

  initializeFolderStruct(): BookmarkFolderStruct {
    return {
      icon: null,
      title: ''
    };
  }

  initializeTradeStructFrom(location: BookmarkTradeLocation): BookmarkTradeStruct {
    return {
      location,
      title: '',
      completedAt: null
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
}

declare module '@ember/service' {
  interface Registry {
    bookmarks: Bookmarks;
  }
}
