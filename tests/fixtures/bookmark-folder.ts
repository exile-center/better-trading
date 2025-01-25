// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {BookmarksFolderAscendancyScionIcon, BookmarksFolderStruct} from 'better-trading/types/bookmarks';

export default function (overrides: Partial<BookmarksFolderStruct>): BookmarksFolderStruct {
  return {
    id: uniqueId(),
    icon: BookmarksFolderAscendancyScionIcon.ASCENDANT,
    version: '1',
    title: 'Fake folder',
    archivedAt: null,
    ...overrides,
  };
}
