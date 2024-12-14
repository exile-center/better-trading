// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import Storage from 'better-trading/services/storage';

// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';
import Bookmarks from 'better-trading/services/bookmarks';

// Constants
const FOLDERS_KEY = 'bookmark-folders';
const TRADES_PREFIX_KEY = 'bookmark-trades';

export default class BookmarksStorage extends Service {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('storage')
  storage: Storage;

  async fetchFolders(): Promise<BookmarksFolderStruct[]> {
    type PersistedType = Array<Partial<BookmarksFolderStruct>>;
    const persistedFolders = await this.storage.getValue<PersistedType>(FOLDERS_KEY);
    if (!persistedFolders) return [];

    const baseFolder = this.bookmarks.initializeFolderStruct();

    return persistedFolders.map((persistedPartialFolder) => ({
      ...baseFolder,
      ...persistedPartialFolder,
    }));
  }

  async fetchTradesByFolderId(folderId: string) {
    const trades = await this.storage.getValue<BookmarksTradeStruct[]>(`${TRADES_PREFIX_KEY}--${folderId}`);
    if (!trades) return [];

    return trades.map(this.migrateOldTrade);
  }

  async persistFolder(folderToPersist: BookmarksFolderStruct) {
    const folders = (await this.fetchFolders()) || [];
    let updatedFolders;
    let persistingId = folderToPersist.id;

    if (!persistingId) {
      persistingId = uniqueId();
      updatedFolders = [...folders, {...folderToPersist, id: persistingId}];
    } else {
      updatedFolders = folders.map((folder: BookmarksFolderStruct) => {
        if (folder.id !== folderToPersist.id) return folder;

        return {
          ...folder,
          ...folderToPersist,
        };
      });
    }

    await this.persistFolders(updatedFolders);

    return persistingId;
  }

  async persistTrade(tradeToPersist: BookmarksTradeStruct, folderId: string) {
    const trades = await this.fetchTradesByFolderId(folderId);
    let updatedTrades;
    let persistingId = tradeToPersist.id;

    if (!tradeToPersist.id) {
      persistingId = uniqueId();
      updatedTrades = [...trades, {...tradeToPersist, id: persistingId}];
    } else {
      updatedTrades = trades.map((trade: BookmarksTradeStruct) => {
        if (trade.id !== tradeToPersist.id) return trade;

        return {
          ...trade,
          ...tradeToPersist,
        };
      });
    }

    await this.persistTrades(updatedTrades, folderId);

    return persistingId;
  }

  async persistTrades(bookmarkTrades: BookmarksTradeStruct[], folderId: string) {
    const safeBookmarkTrades = bookmarkTrades.map((bookmarkTrade) => ({
      ...bookmarkTrade,
      id: bookmarkTrade.id || uniqueId(),
    }));

    return this.storage.setValue(`${TRADES_PREFIX_KEY}--${folderId}`, safeBookmarkTrades);
  }

  async persistFolders(bookmarkFolders: BookmarksFolderStruct[]) {
    return this.storage.setValue(FOLDERS_KEY, bookmarkFolders);
  }

  async deleteFolder(folderId: string) {
    const folders = await this.fetchFolders();

    const updatedFolders = folders.filter((folder: BookmarksFolderStruct) => {
      return folder.id !== folderId;
    });

    await this.persistFolders(updatedFolders);

    return this.storage.deleteValue(`${TRADES_PREFIX_KEY}--${folderId}`);
  }

  async deleteTrade(tradeId: string, folderId: string) {
    const trades = await this.fetchTradesByFolderId(folderId);

    const updatedTrades = trades.filter((trade: BookmarksTradeStruct) => {
      return trade.id !== tradeId;
    });

    return this.persistTrades(updatedTrades, folderId);
  }

  private migrateOldTrade(trade: BookmarksTradeStruct) {
    if (!trade.location.version) {
      trade.location.version = '1';
    }
    return trade;
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/storage': BookmarksStorage;
  }
}
