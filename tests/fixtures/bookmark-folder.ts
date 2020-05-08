// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {BookmarksFolderAscendancyScionIcon, BookmarksFolderStruct} from 'better-trading/types/bookmarks';

export default function(overrides: Partial<BookmarksFolderStruct>) {
  return {
    id: uniqueId(),
    icon: BookmarksFolderAscendancyScionIcon.ASCENDANT,
    title: 'Fake folder',
    ...overrides
  };
}
