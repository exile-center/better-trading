// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import BookmarksState from 'better-trading/services/bookmarks/state';
import BookmarksStorage from 'better-trading/services/bookmarks/storage';
import {BookmarksFolderStruct, BookmarksTradeLocation, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

export default class Bookmarks extends Service {
  @service('bookmarks/storage')
  bookmarksStorage: BookmarksStorage;

  @service('bookmarks/state')
  bookmarksState: BookmarksState;

  async migrateFromLocalStorage() {
    return this.bookmarksStorage.migrateFromLocalStorage();
  }

  async fetchFolders() {
    return this.bookmarksStorage.fetchFolders();
  }

  async fetchTradesByFolderId(folderId: number) {
    return this.bookmarksStorage.fetchTradesByFolderId(folderId);
  }

  async persistFolder(bookmarkFolder: BookmarksFolderStruct) {
    return this.bookmarksStorage.persistFolder(bookmarkFolder);
  }

  async persistFolders(bookmarkFolders: BookmarksFolderStruct[]) {
    return this.bookmarksStorage.persistFolders(bookmarkFolders);
  }

  async persistTrade(bookmarkTrade: BookmarksTradeStruct) {
    return this.bookmarksStorage.persistTrade(bookmarkTrade);
  }

  async persistTrades(bookmarkTrades: BookmarksTradeStruct[]) {
    return this.bookmarksStorage.persistTrades(bookmarkTrades);
  }

  reorderTrades(reorderedTrades: BookmarksTradeStruct[]) {
    return reorderedTrades.map((trade, index) => ({
      ...trade,
      rank: index
    }));
  }

  reorderFolders(reorderedFolders: BookmarksFolderStruct[]) {
    return reorderedFolders.map((folder, index) => ({
      ...folder,
      rank: index
    }));
  }

  async deleteTrade(deletingTrade: BookmarksTradeStruct) {
    if (!deletingTrade.id) return;
    return this.bookmarksStorage.deleteTrade(deletingTrade.id);
  }

  async deleteFolder(deletingFolder: BookmarksFolderStruct) {
    if (!deletingFolder.id) return;
    return this.bookmarksStorage.deleteFolder(deletingFolder.id);
  }

  initializeFolderStruct(rank: number): BookmarksFolderStruct {
    return {
      icon: null,
      title: '',
      rank
    };
  }

  initializeTradeStructFrom(location: BookmarksTradeLocation, folderId: number, rank: number): BookmarksTradeStruct {
    return {
      location,
      folderId,
      title: '',
      rank
    };
  }

  isFolderExpanded(bookmarkFolderId?: number) {
    if (!bookmarkFolderId) return false;
    return this.bookmarksState.isFolderExpanded(bookmarkFolderId);
  }

  toggleFolderExpansion(bookmarkFolderId: number) {
    return this.bookmarksState.toggleFolderExpansion(bookmarkFolderId);
  }
}

declare module '@ember/service' {
  interface Registry {
    bookmarks: Bookmarks;
  }
}
