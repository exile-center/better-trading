// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {BookmarksTradeStruct} from 'better-trading/types/bookmarks';

export default function (overrides: Partial<BookmarksTradeStruct>): BookmarksTradeStruct {
  return {
    id: uniqueId(),
    location: {
      version: '2',
      type: 'search',
      slug: 'foobar',
    },
    completedAt: null,
    title: 'Fake trade',
    ...overrides,
  };
}
