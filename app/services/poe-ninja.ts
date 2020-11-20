// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {slugify} from 'better-trading/utilities/slugify';
import {dateDelta} from 'better-trading/utilities/date-delta';

// Types
import ExtensionBackground from 'better-trading/services/extension-background';
import Storage from 'better-trading/services/storage';

export interface PoeNinjaCurrenciesPayloadLine {
  currencyTypeName: string;
  chaosEquivalent: number;
}

export interface PoeNinjaCurrenciesPayload {
  lines: PoeNinjaCurrenciesPayloadLine[];
}

export interface PoeNinjaCurrenciesRatios {
  [key: string]: number;
}

// Constants
const CURRENCIES_RESOURCE_URI = '/data/currencyoverview?type=Currency';
const RATIOS_CACHE_DURATION = 3600000; // 1 hour
const RATIOS_CACHE_KEY = 'poe-ninja-chaos-ratios-cache';

export default class PoeNinja extends Service {
  @service('extension-background')
  extensionBackground: ExtensionBackground;

  @service('storage')
  storage: Storage;

  async fetchChaosRatiosFor(league: string): Promise<PoeNinjaCurrenciesRatios> {
    const cachedRatios = await this.lookupCachedChaosRatiosFor(league);
    if (cachedRatios) return cachedRatios;

    const uri = `${CURRENCIES_RESOURCE_URI}&league=${league}`;
    const payload = (await this.extensionBackground.fetchPoeNinjaResource(uri)) as PoeNinjaCurrenciesPayload;

    const ratios = this.parseChaosRatios(payload);
    await this.cacheChaosRatiosFor(league, ratios);

    return ratios;
  }

  private async lookupCachedChaosRatiosFor(league: string): Promise<PoeNinjaCurrenciesRatios | null> {
    return this.storage.getValue(RATIOS_CACHE_KEY, league);
  }

  private async cacheChaosRatiosFor(league: string, ratios: PoeNinjaCurrenciesRatios): Promise<void> {
    return this.storage.setEphemeralValue(RATIOS_CACHE_KEY, ratios, dateDelta(RATIOS_CACHE_DURATION), league);
  }

  private parseChaosRatios(payload: PoeNinjaCurrenciesPayload): PoeNinjaCurrenciesRatios {
    return payload.lines.reduce(
      (acc: PoeNinjaCurrenciesRatios, {currencyTypeName, chaosEquivalent}: PoeNinjaCurrenciesPayloadLine) => {
        acc[slugify(currencyTypeName)] = chaosEquivalent;

        return acc;
      },
      {}
    );
  }
}

declare module '@ember/service' {
  interface Registry {
    'poe-ninja': PoeNinja;
  }
}
