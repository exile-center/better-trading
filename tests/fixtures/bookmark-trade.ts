// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {BookmarksTradeStruct} from 'better-trading/types/bookmarks';

export default function(overrides: Partial<BookmarksTradeStruct>) {
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
