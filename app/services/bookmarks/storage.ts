// Vendor
import Service, {inject as service} from '@ember/service';
// Types
import LocalStorage from 'better-trading/services/local-storage';
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import DexieService from 'better-trading/services/dexie';

export default class BookmarksStorage extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  @service('dexie')
  dexie: DexieService;

  /**
   * @description Temporary code to migrate bookmarks from the LS to Dexie
   */
  async migrateFromLocalStorage(): Promise<void> {
    const rawFolders = this.localStorage.getValue('bookmark-folders');
    const rawTrades = this.localStorage.getValue('bookmark-trades');

    if (!rawFolders || !rawTrades) return;

    interface FolderIdMapping {
      [key: string]: number;
    }

    const folderMappings: FolderIdMapping = {};

    const folders = Object.values(JSON.parse(rawFolders));
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i] as BookmarksFolderStruct;
      const oldId = (folder.id as unknown) as string;
      delete folder.id;

      folderMappings[oldId] = await this.persistFolder(folder);
    }

    const trades = Object.values(JSON.parse(rawTrades));
    for (let i = 0; i < trades.length; i++) {
      const trade = trades[i] as BookmarksTradeStruct;
      delete trade.id;
      trade.folderId = folderMappings[trade.folderId];
      await this.persistTrade(trade);
    }

    this.localStorage.delete('bookmark-folders');
    this.localStorage.delete('bookmark-trades');
    this.localStorage.delete('bookmark-folders-expansion');
  }

  async fetchFolders() {
    return this.dexie.fetchAll<BookmarksFolderStruct>('bookmarkFolders');
  }

  async fetchTradesByFolderId(folderId: number) {
    return this.dexie.searchQuery<BookmarksTradeStruct>('bookmarkTrades', 'folderId', folderId);
  }

  async persistFolder(folder: BookmarksFolderStruct) {
    return this.dexie.upsert<BookmarksFolderStruct>('bookmarkFolders', folder);
  }

  async persistTrade(trade: BookmarksTradeStruct) {
    return this.dexie.upsert<BookmarksTradeStruct>('bookmarkTrades', trade);
  }

  async persistTrades(bookmarkTrades: BookmarksTradeStruct[]) {
    return this.dexie.batchUpsert('bookmarkTrades', bookmarkTrades);
  }

  async persistFolders(bookmarkFolders: BookmarksFolderStruct[]) {
    return this.dexie.batchUpsert('bookmarkFolders', bookmarkFolders);
  }

  async deleteFolder(folderId: number) {
    await this.dexie.deleteQuery('bookmarkTrades', 'folderId', folderId);
    await this.dexie.delete('bookmarkFolders', folderId);
  }

  async deleteTrade(tradeId: number) {
    await this.dexie.delete('bookmarkTrades', tradeId);
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/storage': BookmarksStorage;
  }
}
