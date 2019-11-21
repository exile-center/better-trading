// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import LocalStorage from 'better-trading/services/local-storage';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';

interface BookmarksFoldersMap {
  [id: string]: BookmarksFolderStruct;
}

interface BookmarksTradesMap {
  [id: string]: BookmarksTradeStruct;
}

export default class BookmarksStorage extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  fetchFolders(): BookmarksFolderStruct[] {
    return Object.values(this.fetchFoldersMap());
  }

  fetchTradesByFolderId(folderId: string): BookmarksTradeStruct[] {
    return Object.values(this.fetchTradesMap()).filter(trade => trade.folderId === folderId);
  }

  persistFolder(folder: BookmarksFolderStruct): BookmarksFolderStruct {
    if (!folder.id) return this.persistNewFolder(folder);
    return this.persistExistingFolder(folder);
  }

  persistTrade(trade: BookmarksTradeStruct): BookmarksTradeStruct {
    if (!trade.id) return this.persistNewTrade(trade);
    return this.persistExistingTrade(trade);
  }

  private persistNewFolder(folder: BookmarksFolderStruct): BookmarksFolderStruct {
    const foldersMap = this.fetchFoldersMap();
    const newId = uniqueId();

    foldersMap[newId] = {
      ...folder,
      id: newId
    };

    this.localStorage.setValue('bookmark-folders', JSON.stringify(foldersMap));

    return foldersMap[newId];
  }

  private persistExistingFolder(folder: BookmarksFolderStruct): BookmarksFolderStruct {
    const foldersMap = this.fetchFoldersMap();

    foldersMap[folder.id] = {
      ...foldersMap[folder.id],
      ...folder
    };

    this.localStorage.setValue('bookmark-folders', JSON.stringify(foldersMap));

    return foldersMap[folder.id];
  }

  private persistNewTrade(trade: BookmarksTradeStruct): BookmarksTradeStruct {
    const tradesMap = this.fetchTradesMap();
    const newId = uniqueId();

    tradesMap[newId] = {
      ...trade,
      id: newId
    };

    this.localStorage.setValue('bookmark-trades', JSON.stringify(tradesMap));

    return tradesMap[newId];
  }

  private persistExistingTrade(trade: BookmarksTradeStruct): BookmarksTradeStruct {
    const tradesMap = this.fetchTradesMap();

    tradesMap[trade.id] = {
      ...tradesMap[trade.id],
      ...trade
    };

    this.localStorage.setValue('bookmark-trades', JSON.stringify(tradesMap));

    return tradesMap[trade.id];
  }

  private fetchFoldersMap(): BookmarksFoldersMap {
    const rawBookmarks = this.localStorage.getValue('bookmark-folders');
    if (!rawBookmarks) return {};

    return JSON.parse(rawBookmarks);
  }

  private fetchTradesMap(): BookmarksTradesMap {
    const rawTrades = this.localStorage.getValue('bookmark-trades');
    if (!rawTrades) return {};

    return JSON.parse(rawTrades);
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/storage': BookmarksStorage;
  }
}
