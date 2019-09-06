// Vendors
import Component from '@ember/component';
import {action} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

// Types
import Settings from 'better-trading/services/settings';

export default class BtPageSettings extends Component {
  @service('settings')
  settings: Settings;

  @readOnly('settings.itemResultsEquivalentPricingsEnabled')
  itemResultsEquivalentPricingsEnabled: boolean;

  @readOnly('settings.itemResultsHighlightStatFiltersEnabled')
  itemResultsHighlightStatFiltersEnabled: boolean;

  @action
  setItemResultsEquivalentPricingsEnabled(value: boolean): void {
    this.settings.setItemResultsEquivalentPricingsEnabled(value);
  }

  @action
  setItemResultsHighlightStatFiltersEnabled(value: boolean): void {
    this.settings.setItemResultsHighlightStatFiltersEnabled(value);
  }
}
