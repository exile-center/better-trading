export interface ItemResultsEnhancerService {
  initialize?(): Promise<void> | void;
  prepare?(): Promise<void> | void;
  enhance(itemResultElement: HTMLElement): Promise<void> | void;
}

export interface ItemResultsPinnedItem {
  id: string;
  pinnedAt: string;
  detailsElement: HTMLElement;
  socketsElement: HTMLElement;
  pricingElement: HTMLElement;
}
