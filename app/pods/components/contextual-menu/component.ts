// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {restartableTask} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';

// Types
import {Task} from 'better-trading/types/ember-concurrency';

// Constants
const HIDE_DEBOUNCE_DELAY_IN_MILLISECONDS = 500;

export default class ContextualMenu extends Component {
  @tracked
  positionStyles: object | null = null;

  get itemsAreVisible() {
    return Boolean(this.positionStyles);
  }

  @restartableTask
  *debouncedHideItemsTask() {
    yield timeout(HIDE_DEBOUNCE_DELAY_IN_MILLISECONDS);
    this.hideItems();
  }

  @action
  showItems(event: MouseEvent) {
    this.positionStyles = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
    };
  }

  @action
  hideItems() {
    this.positionStyles = null;
  }

  @action
  cancelDebouncedHideItemsTask() {
    (this.debouncedHideItemsTask as Task).cancelAll();
  }
}
