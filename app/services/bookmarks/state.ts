// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import LocalStorage from 'better-trading/services/local-storage';

export default class BookmarksState extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  toggleFolderExpansion(expandedFolderIds: number[], bookmarkFolderId: number) {
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
    const rawIds = this.localStorage.getValue('bookmark-folders-expansion');
    if (!rawIds) return [];

    return rawIds.split(',').map(rawId => parseInt(rawId, 10));
  }

  collapseAllFolderIds() {
    return this.persistExpandedFolderIds([]);
  }

  private persistExpandedFolderIds(expandedFolderIds: number[]) {
    this.localStorage.setValue('bookmark-folders-expansion', expandedFolderIds.join(','));

    return expandedFolderIds;
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/state': BookmarksState;
  }
}
