// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {BookmarkFolderAscendancyScionIcon, BookmarkFolderStruct} from 'better-trading/types/bookmarks';

export default function(overrides: Partial<BookmarkFolderStruct>) {
  return {
    id: uniqueId(),
    icon: BookmarkFolderAscendancyScionIcon.ASCENDANT,
    title: 'Fake folder',
    ...overrides
  };
}
