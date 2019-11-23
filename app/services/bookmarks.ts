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

  fetchFolders(): BookmarksFolderStruct[] {
    return this.bookmarksStorage.fetchFolders();
  }

  fetchTradesByFolderId(folderId: string): BookmarksTradeStruct[] {
    return this.bookmarksStorage.fetchTradesByFolderId(folderId);
  }

  persistFolder(bookmarkFolder: BookmarksFolderStruct): BookmarksFolderStruct {
    return this.bookmarksStorage.persistFolder(bookmarkFolder);
  }

  persistTrade(bookmarkTrade: BookmarksTradeStruct): BookmarksTradeStruct {
    return this.bookmarksStorage.persistTrade(bookmarkTrade);
  }

  reorderTrades(reorderedTrades: BookmarksTradeStruct[]) {
    return this.bookmarksStorage.persistTradeRanks(reorderedTrades);
  }

  reorderFolders(reorderedFolders: BookmarksFolderStruct[]) {
    return this.bookmarksStorage.persistFolderRanks(reorderedFolders);
  }

  initializeFolderStruct(): BookmarksFolderStruct {
    return {
      icon: null,
      id: '',
      title: '',
      rank: 0
    };
  }

  initializeTradeStructFrom(location: BookmarksTradeLocation, folderId: string): BookmarksTradeStruct {
    return {
      location,
      folderId,
      color: null,
      id: '',
      title: '',
      rank: 0
    };
  }

  isFolderExpanded(bookmarkFolderId: string): boolean {
    return this.bookmarksState.isFolderExpanded(bookmarkFolderId);
  }

  toggleFolderExpansion(bookmarkFolderId: string): boolean {
    return this.bookmarksState.toggleFolderExpansion(bookmarkFolderId);
  }
}

declare module '@ember/service' {
  interface Registry {
    bookmarks: Bookmarks;
  }
}
