// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {slugify} from 'better-trading/utilities/slugify';

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
const ONE_HOUR_IN_MILLISECONDS = 3600000;

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
    return this.storage.getValue('poe-ninja-chaos-ratios-cache', league);
  }

  private async cacheChaosRatiosFor(league: string, ratios: PoeNinjaCurrenciesRatios): Promise<void> {
    return this.storage.setEphemeralValue(
      'poe-ninja-chaos-ratios-cache',
      ratios,
      this.cacheExpirationDate(),
      league
    );
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

  private cacheExpirationDate() {
    const currentTimestamp = new Date().getTime();

    return new Date(currentTimestamp + ONE_HOUR_IN_MILLISECONDS);
  }
}

declare module '@ember/service' {
  interface Registry {
    'poe-ninja': PoeNinja;
  }
}
