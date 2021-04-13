// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import PoeNinja, {PoeNinjaCurrenciesRatios} from 'better-trading/services/poe-ninja';
import {ItemResultsEnhancerService, ItemResultsParsedItem} from 'better-trading/types/item-results';

// Constants
const CHAOS_IMAGE_URL = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png';
const CHAOS_ALT = 'chaos';
const CHAOS_SLUG = 'chaos-orb';
const EXALT_IMAGE_URL = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png';
const EXALT_ALT = 'exalt';
const EXALT_SLUG = 'exalted-orb';
const EXALT_EQUIVALENCE_THRESHOLD = 0.5;
const EQUAL_HTML = '<span class="bt-equivalent-pricings-equals">=</span>';

export default class EquivalentPricings extends Service implements ItemResultsEnhancerService {
  @service('poe-ninja')
  poeNinja: PoeNinja;

  @service('trade-location')
  tradeLocation: TradeLocation;

  slug = 'equivalent-pricings';

  chaosRatios: PoeNinjaCurrenciesRatios | null;

  async prepare() {
    const currentLeague = this.tradeLocation.league;
    this.chaosRatios = currentLeague ? await this.poeNinja.fetchChaosRatiosFor(currentLeague) : null;
  }

  // eslint-disable-next-line complexity
  enhance(itemElement: HTMLElement, {price}: ItemResultsParsedItem) {
    if (!this.chaosRatios) return;

    const pricingContainerElement = itemElement.querySelector<HTMLDivElement>('.price');
    const currencyImageElement = itemElement.querySelector<HTMLImageElement>(
      '[data-field="price"] .currency-image img'
    );

    if (!pricingContainerElement || !currencyImageElement || !price.currencySlug || !price.value) return;

    const currencySlug = price.currencySlug;
    const currencyValue = price.value;
    const chaosValue = this.chaosRatios[currencySlug];
    const exaltValue = this.chaosRatios[EXALT_SLUG];

    if (chaosValue && currencyValue) {
      this.handleNonChaosPricedItem(pricingContainerElement, currencyImageElement, currencyValue, chaosValue);
    } else if (currencySlug === CHAOS_SLUG && exaltValue) {
      this.handleChaosPricedItem(pricingContainerElement, currencyValue, exaltValue);
    }
  }

  private handleNonChaosPricedItem(
    pricingContainerElement: HTMLElement,
    currencyImageElement: HTMLImageElement,
    currencyValue: number,
    chaosValue: number
  ) {
    const chaosEquivalentValue = Math.round(currencyValue * chaosValue);
    if (!chaosEquivalentValue) return;

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

  private handleChaosPricedItem(pricingContainerElement: HTMLElement, currencyValue: number, exaltValue: number) {
    if (currencyValue < EXALT_EQUIVALENCE_THRESHOLD * exaltValue) return;

    // eslint-disable-next-line no-magic-numbers
    const exaltEquivalentValue = Math.round((currencyValue / exaltValue) * 10) / 10;
    pricingContainerElement.append(this.renderExaltEquivalence(exaltEquivalentValue));
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

  private renderExaltEquivalence(exaltEquivalentValue: number): HTMLElement {
    const element = window.document.createElement('span');
    element.classList.add('bt-equivalent-pricings');
    element.classList.add('bt-equivalent-pricings-equivalent');

    element.innerHTML = `<span>${EQUAL_HTML}${exaltEquivalentValue}×<img src="${EXALT_IMAGE_URL}" alt="${EXALT_ALT}" /></span>`;

    return element;
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/equivalent-pricings': EquivalentPricings;
  }
}
