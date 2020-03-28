// Vendor
import Service, {inject as service} from '@ember/service';
// Types
import {BookmarksFolderStruct, BookmarksTradeStruct} from 'better-trading/types/bookmarks';
import DexieService from 'better-trading/services/dexie';

export default class BookmarksStorage extends Service {
  @service('dexie')
  dexie: DexieService;

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
