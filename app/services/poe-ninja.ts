// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {slugify} from 'better-trading/utilities/slugify';

// Types
import ExtensionBackground from 'better-trading/services/extension-background';
import LocalStorage from 'better-trading/services/local-storage';

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
    const payload = (await this.extensionBackground.fetchPoeNinjaResource(uri)) as PoeNinjaCurrenciesPayload;

    const ratios = this.parseChaosRatios(payload);
    this.cacheChaosRatiosFor(league, ratios);

    return ratios;
  }

  private lookupCachedChaosRatiosFor(league: string): PoeNinjaCurrenciesRatios | null {
    const rawCachedRatios = this.localStorage.getValue('poe-ninja-chaos-ratios-cache', league);
    if (!rawCachedRatios) return null;

    return JSON.parse(rawCachedRatios);
  }

  private cacheChaosRatiosFor(league: string, ratios: PoeNinjaCurrenciesRatios): void {
    this.localStorage.setEphemeralValue('poe-ninja-chaos-ratios-cache', JSON.stringify(ratios), SIX_HOURS, league);
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
