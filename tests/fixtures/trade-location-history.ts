// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import {TradeLocationHistoryStruct} from 'better-trading/types/trade-location';

export default function (overrides: Partial<TradeLocationHistoryStruct>) {
  return {
    id: uniqueId(),
    title: 'Fake history',
    version: '1',
    slug: 'Fake slug',
    type: 'Fake type',
    league: 'Fake league',
    ...overrides,
  };
}
