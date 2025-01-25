// Vendor
import Service, {inject as service} from '@ember/service';
import Evented from '@ember/object/evented';

// Types
import BookmarksState from 'better-trading/services/bookmarks/state';
import BookmarksStorage, {PersistFolderOptions} from 'better-trading/services/bookmarks/storage';
import BookmarksExport from 'better-trading/services/bookmarks/export';
import BookmarksBackup from 'better-trading/services/bookmarks/backup';
import {
  BookmarksFolderStruct,
  BookmarksTradeLocation,
  BookmarksTradeStruct,
  PartialBookmarksTradeLocation,
} from 'better-trading/types/bookmarks';
import {TradeSiteVersion} from 'better-trading/types/trade-location';

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
      folders.map(async (folder) => ({
        ...folder,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        trades: await this.fetchTradesByFolderId(folder.id!),
      }))
    );
    let matches = foldersWithTrades
      .map((folderWithTrades) => ({
        ...folderWithTrades,
        trades: folderWithTrades.trades.filter(
          (trade) =>
            trade.location.version === location.version &&
            trade.location.slug === location.slug &&
            trade.location.type === location.type
        ),
      }))
      .filter((f) => f.trades.length > 0);

    if (matches.length === 0) return null;

    const unarchivedMatches = matches.filter((m) => !m.archivedAt);
    if (unarchivedMatches.length > 0) matches = unarchivedMatches;

    const matchingTrades = matches.flatMap((m) => m.trades);

    // Sort alphabetically by title. "by title" is an arbitrary choice, we just want some
    // consistent sort order to make sure the result stays consistent between repeated calls
    //
    // eslint-disable-next-line no-nested-ternary
    matchingTrades.sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0));
    return matchingTrades[0];
  }

  async persistFolder(bookmarkFolder: BookmarksFolderStruct, options?: PersistFolderOptions) {
    const newId = await this.bookmarksStorage.persistFolder(bookmarkFolder, options);
    this.trigger('change');
    return newId;
  }

  async persistFolders(bookmarkFolders: BookmarksFolderStruct[]) {
    await this.bookmarksStorage.persistFolders(bookmarkFolders);
    this.trigger('change');
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
    return this.persistFolder(
      {
        ...folder,
        archivedAt: folder.archivedAt ? null : new Date().toUTCString(),
      },
      {moveToEnd: true}
    );
  }

  // This function reorders the `reorderedFolders` within `allFolders` relative to
  // one another without affecting the relative order of non-reordered folders.
  //
  // Does *not* persist the changes.
  //
  // Precondition: `reorderedFolders` must be a subset of `allFolders`.
  partiallyReorderFolders(
    allFolders: BookmarksFolderStruct[],
    reorderedFolders: BookmarksFolderStruct[]
  ): BookmarksFolderStruct[] {
    const reorderedSet = new Set(reorderedFolders);
    const result = [...allFolders];
    let reorderedIndex = 0;
    for (let i = 0; i < allFolders.length; i++) {
      if (reorderedSet.has(allFolders[i])) {
        result[i] = reorderedFolders[reorderedIndex];
        reorderedIndex++;
      }
    }
    if (reorderedIndex !== reorderedFolders.length) {
      throw new Error('partiallyReorderFolders precondition violated: reorderedFolders was not a subset of allFolders');
    }
    return result;
  }

  initializeFolderStruct(version: TradeSiteVersion): BookmarksFolderStruct {
    return {
      version,
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
