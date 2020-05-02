// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import Storage from 'better-trading/services/storage';

export default class BookmarksState extends Service {
  @service('storage')
  storage: Storage;

  toggleFolderExpansion(expandedFolderIds: string[], bookmarkFolderId: string) {
    const expandedFolderIdsCopy = [...expandedFolderIds];
    const bookmarkFolderIdIndex = expandedFolderIdsCopy.indexOf(bookmarkFolderId);

    if (bookmarkFolderIdIndex > -1) {
      expandedFolderIdsCopy.splice(bookmarkFolderIdIndex, 1);
    } else {
      expandedFolderIdsCopy.push(bookmarkFolderId);
    }

    return this.persistExpandedFolderIds(expandedFolderIdsCopy);
  }

  getExpandedFolderIds() {
    const rawIds = this.storage.getLocalValue('bookmark-folders-expansion');
    if (!rawIds) return [];

    return rawIds.split(',');
  }

  collapseAllFolderIds() {
    return this.persistExpandedFolderIds([]);
  }

  private persistExpandedFolderIds(expandedFolderIds: string[]) {
    this.storage.setLocalValue('bookmark-folders-expansion', expandedFolderIds.join(','));

    return expandedFolderIds;
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/state': BookmarksState;
  }
}
