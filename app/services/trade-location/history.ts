// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {uniqueId} from 'better-trading/utilities/unique-id';

// Types
import Storage from 'better-trading/services/storage';
import {TradeLocationHistoryStruct, TradeLocationStruct} from 'better-trading/types/trade-location';
import TradeLocation from 'better-trading/services/trade-location';
import SearchPanel from 'better-trading/services/search-panel';

// Config
import config from 'better-trading/config/environment';

// Constants
const HISTORY_KEY = 'trade-history';

export default class TradeLocationHistory extends Service {
  @service('storage')
  storage: Storage;

  @service('trade-location')
  tradeLocation: TradeLocation;

  @service('search-panel')
  searchPanel: SearchPanel;

  // eslint-disable-next-line complexity
  async maybeLogTradeLocation(newTradeLocation: TradeLocationStruct) {
    if (!newTradeLocation.league || !newTradeLocation.type || !newTradeLocation.slug) return;

    const historyEntries = await this.fetchHistoryEntries();
    const lastEntry = historyEntries[0];
    if (lastEntry && this.tradeLocation.compareTradeLocations(newTradeLocation, lastEntry)) return;

    historyEntries.unshift({
      ...newTradeLocation,
      id: uniqueId(),
      title: this.searchPanel.recommendTitle(),
      createdAt: new Date().toISOString(),
    } as TradeLocationHistoryStruct);
    historyEntries.splice(config.APP.maximumHistoryLength);

    await this.storage.setValue(HISTORY_KEY, historyEntries);
  }

  async fetchHistoryEntries() {
    const history = await this.storage.getValue<TradeLocationHistoryStruct[]>(HISTORY_KEY);
    if (!history) return [];

    return history;
  }

  async clearHistoryEntries() {
    return this.storage.deleteValue(HISTORY_KEY);
  }
}

declare module '@ember/service' {
  interface Registry {
    'trade-location/history': TradeLocationHistory;
  }
}
