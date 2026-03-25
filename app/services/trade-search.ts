// Vendor
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import {ParsedItem, ParsedMod} from 'better-trading/types/item-parser';
import {TradeSiteVersion} from 'better-trading/types/trade-location';

interface StatEntry {
  id: string;
  text: string;
  type: string;
}

interface StatsCache {
  [version: string]: StatEntry[];
}

interface SearchFilter {
  id: string;
  value: {min?: number; max?: number};
}

interface SearchPayload {
  query: {
    name?: string;
    type?: string;
    stats: Array<{
      type: string;
      filters: SearchFilter[];
    }>;
    filters?: {
      misc_filters?: {
        filters: {
          ilvl?: {min?: number};
          corrupted?: {option?: boolean};
          mirrored?: {option?: boolean};
          fractured_item?: {option?: boolean};
        };
      };
      type_filters?: {
        filters: {
          category?: {option?: string};
          rarity?: {option?: string};
        };
      };
    };
  };
  sort: {price: string};
}

export default class TradeSearch extends Service {
  @service('trade-location')
  tradeLocation: TradeLocation;

  private statsCache: StatsCache = {};

  async fetchStats(version: TradeSiteVersion): Promise<StatEntry[]> {
    const cacheKey = version;
    if (this.statsCache[cacheKey]) return this.statsCache[cacheKey];

    const basePath = version === '2' ? 'trade2' : 'trade';
    const url = `https://www.pathofexile.com/api/${basePath}/data/stats`;

    const response = await window.fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`);

    const data = await response.json();
    const entries: StatEntry[] = [];

    // Stats response has result array with groups, each group has entries
    for (const group of data.result || []) {
      for (const entry of group.entries || []) {
        entries.push({
          id: entry.id,
          text: entry.text,
          type: entry.type,
        });
      }
    }

    this.statsCache[cacheKey] = entries;
    return entries;
  }

  matchMod(mod: ParsedMod, stats: StatEntry[]): {statId: string; value: number | null} | null {
    const normalized = mod.normalizedText.trim();

    // Determine expected stat type prefix based on mod tag
    const typePrefix = this.getStatTypePrefix(mod.tag);

    // Try exact normalized match first
    for (const stat of stats) {
      if (stat.text === normalized && stat.id.startsWith(typePrefix)) {
        return {
          statId: stat.id,
          value: mod.values.length > 0 ? mod.values[0] : null,
        };
      }
    }

    // Try case-insensitive match
    const normalizedLower = normalized.toLowerCase();
    for (const stat of stats) {
      if (stat.text.toLowerCase() === normalizedLower && stat.id.startsWith(typePrefix)) {
        return {
          statId: stat.id,
          value: mod.values.length > 0 ? mod.values[0] : null,
        };
      }
    }

    // Try without type prefix constraint (fallback)
    for (const stat of stats) {
      if (stat.text === normalized) {
        return {
          statId: stat.id,
          value: mod.values.length > 0 ? mod.values[0] : null,
        };
      }
    }

    // Try case-insensitive without type constraint
    for (const stat of stats) {
      if (stat.text.toLowerCase() === normalizedLower) {
        return {
          statId: stat.id,
          value: mod.values.length > 0 ? mod.values[0] : null,
        };
      }
    }

    return null;
  }

  buildSearchPayload(item: ParsedItem, stats: StatEntry[]): SearchPayload {
    const explicitFilters: SearchFilter[] = [];
    const implicitFilters: SearchFilter[] = [];

    // Match explicit mods
    for (const mod of item.explicits) {
      const match = this.matchMod(mod, stats);
      if (match) {
        const filter: SearchFilter = {id: match.statId, value: {}};
        if (match.value !== null) {
          filter.value.min = match.value;
        }
        explicitFilters.push(filter);
      }
    }

    // Match implicit mods
    for (const mod of item.implicits) {
      const match = this.matchMod(mod, stats);
      if (match) {
        const filter: SearchFilter = {id: match.statId, value: {}};
        if (match.value !== null) {
          filter.value.min = match.value;
        }
        implicitFilters.push(filter);
      }
    }

    const allFilters = [...explicitFilters, ...implicitFilters];

    const payload: SearchPayload = {
      query: {
        stats: [{type: 'and', filters: allFilters}],
      },
      sort: {price: 'asc'},
    };

    // Set type (base type) for non-magic items
    if (item.baseType && item.rarity !== 'Magic') {
      payload.query.type = item.baseType;
    }

    // Set name for unique items
    if (item.rarity === 'Unique' && item.name) {
      payload.query.name = item.name;
    }

    // Add misc filters
    const miscFilters: SearchPayload['query']['filters'] = {
      misc_filters: {filters: {}},
    };

    if (item.corrupted) {
      miscFilters.misc_filters!.filters.corrupted = {option: true};
    }
    if (item.fractured) {
      miscFilters.misc_filters!.filters.fractured_item = {option: true};
    }

    // Only include filters if there's something in them
    const hasMiscFilters = Object.keys(miscFilters.misc_filters!.filters).length > 0;
    if (hasMiscFilters) {
      payload.query.filters = miscFilters;
    }

    return payload;
  }

  async executeSearch(item: ParsedItem): Promise<string> {
    const version = this.tradeLocation.version;
    const league = this.tradeLocation.league;

    if (!league) throw new Error('No league detected from current URL');

    const stats = await this.fetchStats(version);
    const payload = this.buildSearchPayload(item, stats);

    const basePath = version === '2' ? 'trade2' : 'trade';
    const searchUrl = `https://www.pathofexile.com/api/${basePath}/search/${league}`;

    const response = await window.fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trade search failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const searchId = data.id;

    if (!searchId) throw new Error('No search ID returned from trade API');

    return `https://www.pathofexile.com/${basePath}/search/${league}/${searchId}`;
  }

  private getStatTypePrefix(tag: string): string {
    switch (tag) {
      case 'implicit':
        return 'implicit';
      case 'crafted':
        return 'crafted';
      case 'fractured':
        return 'fractured';
      case 'enchant':
        return 'enchant';
      default:
        return 'explicit';
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'trade-search': TradeSearch;
  }
}
