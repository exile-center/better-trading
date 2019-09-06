// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {slugify} from 'better-trading/utilities/slugify';

// Types
import ExtensionBackground from 'better-trading/services/extension-background';
import LocalStorage from 'better-trading/services/local-storage';
import {
  PoeNinjaCurrenciesPayload,
  PoeNinjaCurrenciesPayloadLine,
  PoeNinjaCurrenciesRatios
} from 'better-trading/types/poe-ninja';

// Constants
const CURRENCIES_RESOURCE_URI = '/data/currencyoverview?type=Currency';
const SIX_HOURS = 21600000;

export default class PoeNinja extends Service {
  @service('extension-background')
  extensionBackground: ExtensionBackground;

  @service('local-storage')
  localStorage: LocalStorage;

  async fetchChaosRatiosFor(league: string): Promise<PoeNinjaCurrenciesRatios> {
    const cachedRatios = this.lookupCachedChaosRatiosFor(league);
    if (cachedRatios) return cachedRatios;

    const uri = `${CURRENCIES_RESOURCE_URI}&league=${league}`;
    const payload = await this.extensionBackground.fetchPoeNinjaResource(uri);

    const ratios = this.parseChaosRatios(payload as PoeNinjaCurrenciesPayload);
    this.cacheChaosRatiosFor(league, ratios);

    return ratios;
  }

  private lookupCachedChaosRatiosFor(
    league: string
  ): PoeNinjaCurrenciesRatios | null {
    const rawCachedRatios = this.localStorage.getValue(
      'poe-ninja-chaos-ratios-cache'
    );
    if (!rawCachedRatios) return null;

    const cachedRatios = JSON.parse(rawCachedRatios);

    return cachedRatios[league] || null;
  }

  private cacheChaosRatiosFor(
    league: string,
    ratios: PoeNinjaCurrenciesRatios
  ): void {
    const rawCachedRatios = this.localStorage.getValue(
      'poe-ninja-chaos-ratios-cache'
    );
    const cachedRatios = rawCachedRatios ? JSON.parse(rawCachedRatios) : {};

    cachedRatios[league] = ratios;

    this.localStorage.setEphemeralValue(
      'poe-ninja-chaos-ratios-cache',
      JSON.stringify(cachedRatios),
      SIX_HOURS
    );
  }

  private parseChaosRatios(
    payload: PoeNinjaCurrenciesPayload
  ): PoeNinjaCurrenciesRatios {
    return payload.lines.reduce(
      (
        acc: PoeNinjaCurrenciesRatios,
        {currencyTypeName, chaosEquivalent}: PoeNinjaCurrenciesPayloadLine
      ) => {
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
