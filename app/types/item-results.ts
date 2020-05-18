export interface ItemResultsEnhancerService {
  initialize?(): Promise<void> | void;
  prepare?(): Promise<void> | void;
  enhance(itemResultElement: HTMLElement): Promise<void> | void;
}
