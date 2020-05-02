// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {
  BookmarkFolderAscendancyIcon,
  BookmarkFolderItemIcon,
  BookmarkFolderStruct,
  BookmarkTradeLocation,
  BookmarkTradeStruct
} from 'better-trading/types/bookmarks';
import Storage from 'better-trading/services/storage';
import DexieService from 'better-trading/services/dexie';

// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Config
import config from 'better-trading/config/environment';

// Constants
const FOLDERS_KEY = 'bookmark-folders';
const TRADES_PREFIX_KEY = 'bookmark-trades';

// Dexie legacy types
interface DexieBookmarkTradeStruct {
  id?: number;
  title: string;
  location: BookmarkTradeLocation;
  rank: number;
  folderId: number;
  completedAt: string | null;
}

interface DexieBookmarkFolderStruct {
  id?: number;
  title: string;
  icon: BookmarkFolderAscendancyIcon | BookmarkFolderItemIcon | null;
  rank: number;
}

export default class BookmarksStorage extends Service {
  @service('storage')
  storage: Storage;

  @service('dexie')
  dexie: DexieService;

  async migrateDexieToStorage() {
    if (config.APP.browser !== 'chrome') return;
    const dbExists = await this.dexie.exists();
    if (!dbExists) return;

    await this.dexie.initialize();

    const folders = (await this.dexie.fetchAll<DexieBookmarkFolderStruct>('bookmarkFolders')).sort(
      (entityA, entityB) => entityA.rank - entityB.rank
    );

    const updatedFolders: BookmarkFolderStruct[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
      const folder = folders[folderIndex];

      const newFolderId = uniqueId();

      const updatedFolder = {
        title: folder.title,
        icon: folder.icon,
        id: newFolderId
      };

      const trades = await this.dexie.searchQuery<DexieBookmarkTradeStruct>('bookmarkTrades', 'folderId', folder.id);

      const updatedTrades = trades
        .sort((entityA, entityB) => entityA.rank - entityB.rank)
        .map(trade => ({
          title: trade.title,
          location: trade.location,
          completedAt: trade.completedAt,
          id: uniqueId()
        }));

      await this.persistTrades(updatedTrades, newFolderId);
      updatedFolders.push(updatedFolder);
    }

    const existingFolders = await this.fetchFolders();

    await this.persistFolders([...existingFolders, ...updatedFolders]);

    await this.dexie.teardown();
  }

  async fetchFolders() {
    const folders = await this.storage.getValue(FOLDERS_KEY);
    if (!folders) return [];

    return folders;
  }

  async fetchTradesByFolderId(folderId: string) {
    const trades = await this.storage.getValue(`${TRADES_PREFIX_KEY}--${folderId}`);
    if (!trades) return [];

    return trades;
  }

  async persistFolder(folderToPersist: BookmarkFolderStruct) {
    const folders = (await this.fetchFolders()) || [];
    let updatedFolders;

    if (!folderToPersist.id) {
      updatedFolders = [...folders, {...folderToPersist, id: uniqueId()}];
    } else {
      updatedFolders = folders.map((folder: BookmarkFolderStruct) => {
        if (folder.id !== folderToPersist.id) return folder;

        return {
          ...folder,
          ...folderToPersist
        };
      });
    }

    return this.persistFolders(updatedFolders);
  }

  async persistTrade(tradeToPersist: BookmarkTradeStruct, folderId: string) {
    const trades = await this.fetchTradesByFolderId(folderId);
    let updatedTrades;

    if (!tradeToPersist.id) {
      updatedTrades = [...trades, {...tradeToPersist, id: uniqueId()}];
    } else {
      updatedTrades = trades.map((trade: BookmarkTradeStruct) => {
        if (trade.id !== tradeToPersist.id) return trade;

        return {
          ...trade,
          ...tradeToPersist
        };
      });
    }

    return this.persistTrades(updatedTrades, folderId);
  }

  async persistTrades(bookmarkTrades: BookmarkTradeStruct[], folderId: string) {
    return this.storage.setValue(`${TRADES_PREFIX_KEY}--${folderId}`, bookmarkTrades);
  }

  async persistFolders(bookmarkFolders: BookmarkFolderStruct[]) {
    return this.storage.setValue(FOLDERS_KEY, bookmarkFolders);
  }

  async deleteFolder(folderId: string) {
    const folders = await this.fetchFolders();

    const updatedFolders = folders.filter((folder: BookmarkFolderStruct) => {
      return folder.id !== folderId;
    });

    await this.persistFolders(updatedFolders);

    return this.storage.deleteValue(`${TRADES_PREFIX_KEY}--${folderId}`);
  }

  async deleteTrade(tradeId: string, folderId: string) {
    const trades = await this.fetchTradesByFolderId(folderId);

    const updatedTrades = trades.filter((trade: BookmarkTradeStruct) => {
      return trade.id !== tradeId;
    });

    return this.persistTrades(updatedTrades, folderId);
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/storage': BookmarksStorage;
  }
}
