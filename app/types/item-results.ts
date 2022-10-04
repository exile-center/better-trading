export enum ItemResultsType {
  ARMOR = 'armor',
  HELMET = 'helmet',
  GLOVE = 'glove',
  BOOT = 'boot',
  BELT = 'belt',
  AMULET = 'amulet',
  RING = 'ring',
  SHIELD = 'shield',
  ONE_HAND_WEAPON = 'one-hand-weapon',
  TWO_HAND_WEAPON = 'two-hand-weapon',
  UNKNOWN = 'unknown',
}

export interface ItemResultsParsedItem {
  price: {
    currencySlug: string | null;
    value: number | null;
  };
  socketsCount: number;
  type: ItemResultsType;
  ilvl: number | null;
  seller: {
    accountName: string | null;
    characterName: string | null;
  };
}

export interface ItemResultsEnhancerService {
  slug?: string;
  initialize?(): Promise<void> | void;
  prepare?(): Promise<void> | void;
  enhance(itemElement: HTMLDivElement, parsedItem: ItemResultsParsedItem): Promise<void> | void;
  clear?(): Promise<void> | void;
}

export interface ItemResultsPinnedItem {
  id: string;
  pinnedAt: string;
  detailsElement: HTMLElement;
  renderedItemElement: HTMLElement;
  pricingElement: HTMLElement;
}
