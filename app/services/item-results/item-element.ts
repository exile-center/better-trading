// Vendor
import Service from '@ember/service';

// Utilities
import {slugify} from 'better-trading/utilities/slugify';

// Types
import {ItemResultsParsedItem, ItemResultsType} from 'better-trading/types/item-results';

export default class ItemElement extends Service {
  parseElement(itemElement: HTMLDivElement): ItemResultsParsedItem {
    return {
      price: {
        currencySlug: this.priceCurrencySlug(itemElement),
        value: this.priceCurrencyValue(itemElement),
      },
      socketsCount: this.socketsCount(itemElement),
      type: this.type(itemElement),
      ilvl: this.ilvl(itemElement),
      sellerAccountName: this.sellerAccountName(itemElement),
    };
  }

  private priceCurrencySlug(itemElement: HTMLDivElement) {
    const currencyNameElement = itemElement.querySelector<HTMLSpanElement>('[data-field="price"] .currency-text span');
    if (!currencyNameElement || !currencyNameElement.textContent) return null;

    return slugify(currencyNameElement.textContent);
  }

  private priceCurrencyValue(itemElement: HTMLDivElement) {
    const currencyValueElement = itemElement.querySelector<HTMLSpanElement>('[data-field="price"] > br + span');
    if (!currencyValueElement || !currencyValueElement.textContent) return null;

    return parseFloat(currencyValueElement.textContent);
  }

  private socketsCount(itemElement: HTMLDivElement) {
    return itemElement.querySelectorAll('.sockets .socket').length || 0;
  }

  // eslint-disable-next-line complexity
  private type(itemElement: HTMLDivElement) {
    const iconElement = itemElement.querySelector<HTMLImageElement>('.icon img');
    if (!iconElement) return ItemResultsType.UNKNOWN;

    const iconSrc = iconElement.src;

    if (/\/BodyArmours\//.test(iconSrc)) return ItemResultsType.ARMOR;
    if (/\/Helmets\//.test(iconSrc)) return ItemResultsType.HELMET;
    if (/\/Gloves\//.test(iconSrc)) return ItemResultsType.GLOVE;
    if (/\/Boots\//.test(iconSrc)) return ItemResultsType.BOOT;
    if (/\/Belts\//.test(iconSrc)) return ItemResultsType.BELT;
    if (/\/Amulets\//.test(iconSrc)) return ItemResultsType.AMULET;
    if (/\/Rings\//.test(iconSrc)) return ItemResultsType.RING;
    if (/\/Shields\//.test(iconSrc)) return ItemResultsType.SHIELD;
    if (/\/OneHandWeapons\//.test(iconSrc)) return ItemResultsType.ONE_HAND_WEAPON;
    if (/\/TwoHandWeapons\//.test(iconSrc)) return ItemResultsType.TWO_HAND_WEAPON;

    return ItemResultsType.UNKNOWN;
  }

  private ilvl(itemElement: HTMLDivElement) {
    const ilvlElement = itemElement.querySelector('.itemLevel');
    const ilvlMatch = ilvlElement?.textContent?.match(/(\d+)/);
    if (!ilvlMatch) return null;

    return parseInt(ilvlMatch[0], 10);
  }

  private sellerAccountName(itemElement: HTMLDivElement) {
    const pmButtonElement = itemElement.querySelector<HTMLAnchorElement>('a.pm-btn');
    if (!pmButtonElement) return null;

    const match = pmButtonElement.href.match(/compose\?to=(.+)$/);
    if (!match) return null;

    const [, accountName] = match;

    return accountName;
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/item-element': ItemElement;
  }
}
