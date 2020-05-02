// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {BookmarkTradeStruct} from 'better-trading/types/bookmarks';

export default function(overrides: Partial<BookmarkTradeStruct>) {
  return {
    id: uniqueId(),
    location: {
      type: 'search',
      slug: 'foobar'
    },
    completedAt: null,
    title: 'Fake trade',
    ...overrides
  };
}
