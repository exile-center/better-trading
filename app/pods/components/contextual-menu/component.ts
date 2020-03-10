// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';

export default class ContextualMenu extends Component {
  @tracked
  itemsAreVisible: boolean = false;

  fadeTransition = fade;

  @action
  showItems() {
    this.itemsAreVisible = true;
  }

  @action
  hideItems() {
    this.itemsAreVisible = false;
  }
}
