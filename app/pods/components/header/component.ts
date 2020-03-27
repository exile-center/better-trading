// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

// Types
import LocalStorage from 'better-trading/services/local-storage';

export default class Header extends Component {
  @service('local-storage')
  localStorage: LocalStorage;

  @tracked
  expandButtonIsVisible: boolean = Boolean(this.localStorage.getValue('side-panel-collapsed'));

  @action
  collapse() {
    this.localStorage.setValue('side-panel-collapsed', 'true');
    document.body.classList.add('bt-is-collapsed');
    this.expandButtonIsVisible = true;
  }

  @action
  expand() {
    this.localStorage.delete('side-panel-collapsed');
    document.body.classList.remove('bt-is-collapsed');
    this.expandButtonIsVisible = false;
  }
}
