// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import LocalStorage from 'better-trading/services/local-storage';

export default class BookmarksState extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  expandedFolderIds: number[] = this.computeExpandedFolderIds();

  isFolderExpanded(bookmarkFolderId: number) {
    return this.expandedFolderIds.includes(bookmarkFolderId);
  }

  toggleFolderExpansion(bookmarkFolderId: number) {
    const bookmarkFolderIdIndex = this.expandedFolderIds.indexOf(bookmarkFolderId);

    if (bookmarkFolderIdIndex > -1) {
      this.expandedFolderIds.splice(bookmarkFolderIdIndex, 1);
    } else {
      this.expandedFolderIds.push(bookmarkFolderId);
    }

    this.persistExpandedFolderIds();

    return bookmarkFolderIdIndex === -1;
  }

  private computeExpandedFolderIds() {
    const rawIds = this.localStorage.getValue('bookmark-folders-expansion');
    if (!rawIds) return [];

    return rawIds.split(',').map(rawId => parseInt(rawId, 10));
  }

  private persistExpandedFolderIds() {
    this.localStorage.setValue('bookmark-folders-expansion', this.expandedFolderIds.join(','));
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/state': BookmarksState;
  }
}
