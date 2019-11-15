// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import LocalStorage from 'better-trading/services/local-storage';

export default class BookmarksState extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  expandedFolderIds: string[] = this.computeExpandedFolderIds();

  isFolderExpanded(bookmarkFolderId: string): boolean {
    return this.expandedFolderIds.includes(bookmarkFolderId);
  }

  toggleFolderExpansion(bookmarkFolderId: string): boolean {
    const bookmarkFolderIdIndex = this.expandedFolderIds.indexOf(bookmarkFolderId);

    if (bookmarkFolderIdIndex > -1) {
      this.expandedFolderIds.splice(bookmarkFolderIdIndex, 1);
    } else {
      this.expandedFolderIds.push(bookmarkFolderId)
    }

    this.persistExpandedFolderIds();

    return bookmarkFolderIdIndex === -1;
  }

  private computeExpandedFolderIds(): string[] {
    const rawIds = this.localStorage.getValue('bookmark-folders-expansion');
    if (!rawIds) return [];

    return rawIds.split(',');
  }

  private persistExpandedFolderIds(): void {
    this.localStorage.setValue('bookmark-folders-expansion', this.expandedFolderIds.join(','));
  }
}

declare module '@ember/service' {
  interface Registry {
    'bookmarks/state': BookmarksState;
  }
}
