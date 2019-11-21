// Vendor
import Service, {inject as service} from '@ember/service';

// Utilities
import {slugify} from 'better-trading/utilities/slugify';

// Types
import Location from 'better-trading/services/location';
import PoeNinja, {PoeNinjaCurrenciesRatios} from 'better-trading/services/poe-ninja';

// Constants
const CHAOS_IMAGE_URL = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png';
const CHAOS_ALT = 'chaos';
const PRICING_CONTAINER_SELECTOR = '.price';
const CURRENCY_NAME_SELECTOR = '[data-field="price"] .currency-text span';
const CURRENCY_IMAGE_SELECTOR = '[data-field="price"] .currency-image img';
const CURRENCY_VALUE_SELECTOR = '[data-field="price"] > br + span';
const EQUAL_HTML = '<span class="bt-equivalent-pricings-equals">=</span>';

export default class ItemResultsEquivalentPricings extends Service {
  @service('poe-ninja')
  poeNinja: PoeNinja;

  @service('location')
  location: Location;

  private chaosRatios: PoeNinjaCurrenciesRatios | null;

  async prepare(): Promise<void> {
    this.chaosRatios = await this.poeNinja.fetchChaosRatiosFor(this.location.league);
  }

  // eslint-disable-next-line complexity
  process(result: HTMLElement): void {
    if (!this.chaosRatios) return;

    const pricingContainerElement = result.querySelector(PRICING_CONTAINER_SELECTOR);
    const currencyNameElement = result.querySelector(CURRENCY_NAME_SELECTOR);
    const currencyValueElement = result.querySelector(CURRENCY_VALUE_SELECTOR);
    const currencyImageElement = result.querySelector(CURRENCY_IMAGE_SELECTOR) as HTMLImageElement;

    if (!currencyNameElement) return;
    if (!pricingContainerElement) return;
    if (!currencyValueElement) return;
    if (!currencyImageElement) return;

    const currencySlug = slugify(currencyNameElement.textContent || '');
    const currencyValue = parseFloat(currencyValueElement.textContent || '');
    const chaosValue = this.chaosRatios[currencySlug];
    if (!chaosValue || !currencyValue) return;

    const chaosEquivalentValue = Math.round(currencyValue * chaosValue);
    pricingContainerElement.append(this.renderChaosEquivalence(chaosEquivalentValue));

    const flooredCurrencyValue = Math.floor(currencyValue);
    if (flooredCurrencyValue === 0 || chaosValue < 1 || flooredCurrencyValue === currencyValue) return;

    const chaosFractionValue = Math.round((currencyValue - flooredCurrencyValue) * chaosValue);
    pricingContainerElement.append(
      this.renderChaosFraction(
        flooredCurrencyValue,
        currencyImageElement.src,
        currencyImageElement.alt,
        chaosFractionValue
      )
    );
  }

  private renderChaosEquivalence(chaosEquivalentValue: number): HTMLElement {
    const element = window.document.createElement('span');
    element.classList.add('bt-equivalent-pricings');
    element.classList.add('bt-equivalent-pricings-equivalent');

    element.innerHTML = `<span>${EQUAL_HTML}${chaosEquivalentValue}×<img src="${CHAOS_IMAGE_URL}" alt="${CHAOS_ALT}" /></span>`;

    return element;
  }

  private renderChaosFraction(
    flooredCurrencyValue: number,
    currencyIconUrl: string,
    currencyIconAlt: string,
    chaosFractionValue: number
  ): HTMLElement {
    const element = window.document.createElement('span');
    element.classList.add('bt-equivalent-pricings');
    element.classList.add('bt-equivalent-pricings-chaos-fraction');

    const flooredPart = `${flooredCurrencyValue}×<img src="${currencyIconUrl}" alt="${currencyIconAlt}" />`;
    const fractionPart = `+${chaosFractionValue}×<img src="${CHAOS_IMAGE_URL}" alt="${CHAOS_ALT}" />`;
    element.innerHTML = `<span>${EQUAL_HTML}${flooredPart}${fractionPart}</span>`;

    return element;
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/equivalent-pricings': ItemResultsEquivalentPricings;
  }
}
