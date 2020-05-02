// Vendor
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

// Types
import Storage from 'better-trading/services/storage';

// Constants
const COLLAPSED_STORAGE_KEY = 'side-panel-collapsed';

export default class Header extends Component {
  @service('storage')
  storage: Storage;

  @tracked
  expandButtonIsVisible: boolean = Boolean(this.storage.getLocalValue(COLLAPSED_STORAGE_KEY));

  @action
  collapse() {
    this.storage.setLocalValue(COLLAPSED_STORAGE_KEY, 'true');
    document.body.classList.add('bt-is-collapsed');
    this.expandButtonIsVisible = true;
  }

  @action
  expand() {
    this.storage.deleteLocalValue(COLLAPSED_STORAGE_KEY);
    document.body.classList.remove('bt-is-collapsed');
    this.expandButtonIsVisible = false;
  }
}
