// Vendor
import Service, {inject as service} from '@ember/service';
import Evented from '@ember/object/evented';

// Types
import BookmarksState from 'better-trading/services/bookmarks/state';
import BookmarksStorage from 'better-trading/services/bookmarks/storage';
import BookmarksExport from 'better-trading/services/bookmarks/export';
import BookmarksBackup from 'better-trading/services/bookmarks/backup';
import {BookmarksFolderStruct, BookmarksTradeLocation, BookmarksTradeStruct, PartialBookmarksTradeLocation} from 'better-trading/types/bookmarks';

export default class Bookmarks extends Service.extend(Evented) {
  @service('bookmarks/storage')
  bookmarksStorage: BookmarksStorage;

  @service('bookmarks/state')
  bookmarksState: BookmarksState;

  @service('bookmarks/export')
  bookmarksExport: BookmarksExport;

  @service('bookmarks/backup')
  bookmarksBackup: BookmarksBackup;

  async fetchFolders() {
    return this.bookmarksStorage.fetchFolders();
  }

  async fetchTradesByFolderId(folderId: string) {
    return this.bookmarksStorage.fetchTradesByFolderId(folderId);
  }

  async fetchTradeByLocation(location: PartialBookmarksTradeLocation): Promise<BookmarksTradeStruct | null> {
    const folders = await this.fetchFolders();
    const foldersWithTrades = await Promise.all(
      folders.map(async folder => ({
        ...folder,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        trades: await this.fetchTradesByFolderId(folder.id!)
      })));
    const matches = foldersWithTrades
      .map(folderWithTrades => ({
        ...folderWithTrades,
        trades: folderWithTrades.trades.filter(trade =>
          trade.location.slug === location.slug &&
          trade.location.type === location.type)
      }))
      .filter(f => f.trades.length > 0);
    const unarchivedMatches = matches.filter(m => m.archivedAt);

    if (unarchivedMatches.length > 0) {
      return unarchivedMatches[0].trades[0];
    } else if(matches.length > 0) {
      return matches[0].trades[0];
    } else {
      return null;
    }
  }

  async persistFolder(bookmarkFolder: BookmarksFolderStruct) {
    const newId = await this.bookmarksStorage.persistFolder(bookmarkFolder);
    this.trigger('change');
    return newId;
  }

  async persistFolders(bookmarkFolders: BookmarksFolderStruct[]) {
    const newId = await this.bookmarksStorage.persistFolders(bookmarkFolders);
    this.trigger('change');
    return newId;
  }

  async persistTrade(bookmarkTrade: BookmarksTradeStruct, folderId: string) {
    const newId = await this.bookmarksStorage.persistTrade(bookmarkTrade, folderId);
    this.trigger('change');
    return newId;
  }

  async persistTrades(bookmarkTrades: BookmarksTradeStruct[], folderId: string) {
    const newId = await this.bookmarksStorage.persistTrades(bookmarkTrades, folderId);
    this.trigger('change');
    return newId;
  }

  async deleteTrade(deletingTrade: BookmarksTradeStruct, folderId: string) {
    if (!deletingTrade.id) return;

    await this.bookmarksStorage.deleteTrade(deletingTrade.id, folderId);
    this.trigger('change');
  }

  async deleteFolder(deletingFolder: BookmarksFolderStruct) {
    if (!deletingFolder.id) return;

    await this.bookmarksStorage.deleteFolder(deletingFolder.id);
    this.trigger('change');
  }

  async toggleTradeCompletion(trade: BookmarksTradeStruct, folderId: string) {
    return this.persistTrade(
      {
        ...trade,
        completedAt: trade.completedAt ? null : new Date().toUTCString(),
      },
      folderId
    );
  }

  async toggleFolderArchive(folder: BookmarksFolderStruct) {
    return this.persistFolder({
      ...folder,
      archivedAt: folder.archivedAt ? null : new Date().toUTCString(),
    });
  }

  initializeFolderStruct(): BookmarksFolderStruct {
    return {
      icon: null,
      title: '',
      archivedAt: null,
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

  collapseAllFolders() {
    return this.bookmarksState.collapseAllFolderIds();
  }

  serializeFolder(folder: BookmarksFolderStruct, trades: BookmarksTradeStruct[]) {
    return this.bookmarksExport.serialize(folder, trades);
  }

  deserializeFolder(serializedFolder: string) {
    return this.bookmarksExport.deserialize(serializedFolder);
  }

  async generateBackupDataString() {
    return this.bookmarksBackup.generateBackupDataString();
  }

  async restoreFromDataString(dataString: string) {
    return this.bookmarksBackup.restoreFromDataString(dataString);
  }
}

declare module '@ember/service' {
  interface Registry {
    bookmarks: Bookmarks;
  }
}
