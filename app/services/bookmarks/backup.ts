// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import {BookmarksFolderStruct} from 'better-trading/types/bookmarks';

// Utilities
import {asyncLoop} from 'better-trading/utilities/async-loop';

// Constants
const SECTION_DELIMITER = '\n--------------------\n';
const LINE_DELIMITER = '\n';

export default class Backup extends Service {
  @service('bookmarks')
  bookmarks: Bookmarks;

  async generateBackupDataString() {
    const activeFolderStrings: string[] = [];
    const archivedFolderStrings: string[] = [];

    const folders = await this.bookmarks.fetchFolders();

    await asyncLoop<BookmarksFolderStruct>(folders, async (folder) => {
      if (!folder.id) return;

      const trades = await this.bookmarks.fetchTradesByFolderId(folder.id);
      const serializedFolder = this.bookmarks.serializeFolder(folder, trades);

      (folder.archivedAt ? archivedFolderStrings : activeFolderStrings).push(serializedFolder);
    });

    return [activeFolderStrings.join(LINE_DELIMITER), archivedFolderStrings.join(LINE_DELIMITER)].join(
      SECTION_DELIMITER
    );
  }

  async restoreFromDataString(stringData: string) {
    try {
      const [activeSection, archivedSection] = stringData.split(SECTION_DELIMITER);
      const activeFolderStrings = activeSection.split(LINE_DELIMITER).filter(Boolean);
      const archivedFolderStrings = archivedSection.split(LINE_DELIMITER).filter(Boolean);

      const restoredActiveFoldersCount = await this.restoreFolders(activeFolderStrings);
      const restoredArchivedFoldersCount = await this.restoreFolders(archivedFolderStrings, {
        archivedAt: new Date().toUTCString(),
      });

      return restoredActiveFoldersCount + restoredArchivedFoldersCount > 0;
    } catch (e) {
      return false;
    }
  }

  private async restoreFolders(folderStrings: string[], folderOverrides: Partial<BookmarksFolderStruct> = {}) {
    let restoredFoldersCount = 0;

    await asyncLoop<string>(folderStrings, async (folderString) => {
      const deserializedData = this.bookmarks.deserializeFolder(folderString);
      if (!deserializedData) return;

      const [folder, trades] = deserializedData;

      const folderId = await this.bookmarks.persistFolder({
        ...folder,
        ...folderOverrides,
      });
      await this.bookmarks.persistTrades(trades, folderId);
      restoredFoldersCount++;
    });

    return restoredFoldersCount;
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/backup': Backup;
  }
}
