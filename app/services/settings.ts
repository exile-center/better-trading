// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import LocalStorage from 'better-trading/services/local-storage';

export default class Settings extends Service {
  @service('local-storage')
  localStorage: LocalStorage;

  itemResultsEquivalentPricingsEnabled: boolean = true;
  itemResultsHighlightStatFiltersEnabled: boolean = true;

  init(): void {
    const rawPersistedSettings = this.localStorage.getValue('settings');
    if (!rawPersistedSettings) return;

    this.setProperties(JSON.parse(rawPersistedSettings));
  }

  setItemResultsEquivalentPricingsEnabled(value: boolean): void {
    this.set('itemResultsEquivalentPricingsEnabled', value);
    this._persist();
  }

  setItemResultsHighlightStatFiltersEnabled(value: boolean): void {
    this.set('itemResultsHighlightStatFiltersEnabled', value);
    this._persist();
  }

  _persist(): void {
    const settings = this.getProperties(
      'itemResultsEquivalentPricingsEnabled',
      'itemResultsHighlightStatFiltersEnabled'
    );

    this.localStorage.setValue('settings', JSON.stringify(settings));
  }
}

declare module '@ember/service' {
  interface Registry {
    settings: Settings;
  }
}
