// Vendor
import Service, {inject as service} from '@ember/service';
import window from 'ember-window-mock';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import {ParsedItem, ParsedMod, ModTag} from 'better-trading/types/item-parser';
import {TradeSiteVersion} from 'better-trading/types/trade-location';

// Constants
const BASE_URL = 'https://www.pathofexile.com';

interface StatEntry {
  id: string;
  text: string;
  type: string;
}

interface StatIndex {
  entries: StatEntry[];
  // Keyed by normalized lowercase text -> list of matching stats
  byText: Map<string, StatEntry[]>;
}

interface SearchFilter {
  id: string;
  value: {min?: number; max?: number};
}

interface MiscFilterValues {
  ilvl?: {min?: number};
  corrupted?: {option?: boolean};
  mirrored?: {option?: boolean};
  fractured_item?: {option?: boolean};
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
        filters: MiscFilterValues;
      };
    };
  };
  sort: {price: string};
}

// Fix #14: Store in-flight Promise to prevent concurrent duplicate fetches
const statsCachePromises: {[version: string]: Promise<StatIndex>} = {};

const STAT_TYPE_PREFIXES: Record<ModTag, string> = {
  implicit: 'implicit',
  explicit: 'explicit',
  crafted: 'crafted',
  fractured: 'fractured',
  enchant: 'enchant',
  rune: 'rune',           // Fix #3: handle PoE 2 mod tags
  desecrated: 'desecrated', // Fix #3: handle PoE 2 mod tags
};

export default class TradeSearch extends Service {
  @service('trade-location')
  tradeLocation: TradeLocation;

  // Fix #14: Returns cached promise to deduplicate concurrent calls
  fetchStats(version: TradeSiteVersion): Promise<StatIndex> {
    if (statsCachePromises[version]) return statsCachePromises[version];

    statsCachePromises[version] = this._doFetchStats(version);
    return statsCachePromises[version];
  }

  // Fix #11: Single-pass O(1) lookup via Map instead of 4x linear scan
  matchMod(mod: ParsedMod, index: StatIndex): {statId: string; value: number | null} | null {
    const normalized = mod.normalizedText.trim();
    const normalizedLower = normalized.toLowerCase();
    const typePrefix = STAT_TYPE_PREFIXES[mod.tag];
    const value = mod.values.length > 0 ? mod.values[0] : null;

    const candidates = index.byText.get(normalizedLower);
    if (!candidates) return null;

    // Priority: exact text + typed > exact text + untyped > case-insensitive + typed > case-insensitive + untyped
    let exactTyped: StatEntry | null = null;
    let exactUntyped: StatEntry | null = null;
    let caseTyped: StatEntry | null = null;
    let caseUntyped: StatEntry | null = null;

    for (const stat of candidates) {
      const isTyped = stat.id.startsWith(typePrefix);
      const isExact = stat.text === normalized;

      if (isExact && isTyped) return {statId: stat.id, value};
      if (isExact && !exactUntyped) exactUntyped = stat;
      if (!isExact && isTyped && !caseTyped) caseTyped = stat;
      if (!isExact && !isTyped && !caseUntyped) caseUntyped = stat;
    }

    const best = exactTyped ?? caseTyped ?? exactUntyped ?? caseUntyped;
    return best ? {statId: best.id, value} : null;
  }

  buildSearchPayload(item: ParsedItem, index: StatIndex): SearchPayload {
    // Fix #1: Separate stat groups for explicit vs implicit mods
    const statGroups: Array<{type: string; filters: SearchFilter[]}> = [];

    const explicitFilters = this._matchMods(item.explicits, index);
    const implicitFilters = this._matchMods(item.implicits, index);

    if (explicitFilters.length) {
      statGroups.push({type: 'and', filters: explicitFilters});
    }
    if (implicitFilters.length) {
      statGroups.push({type: 'and', filters: implicitFilters});
    }
    if (!statGroups.length) {
      statGroups.push({type: 'and', filters: []});
    }

    const payload: SearchPayload = {
      query: {stats: statGroups},
      sort: {price: 'asc'},
    };

    if (item.baseType && item.rarity !== 'Magic') {
      payload.query.type = item.baseType;
    }

    if (item.rarity === 'Unique' && item.name) {
      payload.query.name = item.name;
    }

    // Fix #4: No non-null assertions; build object directly
    // Fix #13: Include mirrored and itemLevel in payload
    const miscFilterValues: MiscFilterValues = {};

    if (item.corrupted) miscFilterValues.corrupted = {option: true};
    if (item.mirrored) miscFilterValues.mirrored = {option: true};
    if (item.fractured) miscFilterValues.fractured_item = {option: true};
    if (item.itemLevel !== null) miscFilterValues.ilvl = {min: item.itemLevel};

    if (Object.keys(miscFilterValues).length > 0) {
      payload.query.filters = {misc_filters: {filters: miscFilterValues}};
    }

    return payload;
  }

  async executeSearch(item: ParsedItem): Promise<string> {
    const version = this.tradeLocation.version;
    const league = this.tradeLocation.league;

    if (!league) throw new Error('No league detected from current URL');

    const index = await this.fetchStats(version);
    const payload = this.buildSearchPayload(item, index);

    // Fix #12: Derive basePath from shared constant
    const basePath = this._basePath(version);
    const searchUrl = `${BASE_URL}/api/${basePath}/search/${league}`;

    const response = await window.fetch(searchUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Trade search failed (${response.status})`);
    }

    const data = await response.json();
    const searchId = data.id;

    if (!searchId) throw new Error('No search ID returned from trade API');

    return `${BASE_URL}/${basePath}/search/${league}/${searchId}`;
  }

  private async _doFetchStats(version: TradeSiteVersion): Promise<StatIndex> {
    const basePath = this._basePath(version);
    const url = `${BASE_URL}/api/${basePath}/data/stats`;

    const response = await window.fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`);

    const data = await response.json();
    const entries: StatEntry[] = [];
    const byText = new Map<string, StatEntry[]>();

    for (const group of data.result || []) {
      for (const entry of group.entries || []) {
        const stat: StatEntry = {id: entry.id, text: entry.text, type: entry.type};
        entries.push(stat);

        // Build lookup index keyed by normalized lowercase text
        const key = entry.text.toLowerCase();
        const existing = byText.get(key);
        if (existing) {
          existing.push(stat);
        } else {
          byText.set(key, [stat]);
        }
      }
    }

    return {entries, byText};
  }

  // DRY helper for matching a list of mods to search filters
  private _matchMods(mods: ParsedMod[], index: StatIndex): SearchFilter[] {
    const filters: SearchFilter[] = [];

    for (const mod of mods) {
      const match = this.matchMod(mod, index);
      if (match) {
        const filter: SearchFilter = {id: match.statId, value: {}};
        if (match.value !== null) {
          filter.value.min = match.value;
        }
        filters.push(filter);
      }
    }

    return filters;
  }

  private _basePath(version: TradeSiteVersion): string {
    return version === '2' ? 'trade2' : 'trade';
  }
}

declare module '@ember/service' {
  interface Registry {
    'trade-search': TradeSearch;
  }
}
