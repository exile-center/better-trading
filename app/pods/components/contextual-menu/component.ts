// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {restartableTask} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';

// Types
import {Task} from 'better-trading/types/ember-concurrency';

interface Position {
  x: number;
  y: number;
}

// Constants
const HIDE_DEBOUNCE_DELAY_IN_MILLISECONDS = 500;

export default class ContextualMenu extends Component {
  @tracked
  itemsDivElement: HTMLDivElement | null = null;

  @tracked
  displayPosition: Position | null = null;

  get itemsAreVisible() {
    return Boolean(this.displayPosition);
  }

  get positionStyles() {
    if (!this.displayPosition || !this.itemsDivElement) return {};

    const viewportHeight = window.innerHeight;
    const itemsHeight = this.itemsDivElement.clientHeight;

    let top = this.displayPosition.y;
    top -= Math.max(itemsHeight + top - viewportHeight, 0);

    return {
      top: `${top}px`,
      left: `${this.displayPosition.x}px`,
    };
  }

  @restartableTask
  *debouncedHideItemsTask() {
    yield timeout(HIDE_DEBOUNCE_DELAY_IN_MILLISECONDS);
    this.hideItems();
  }

  @action
  showItems(event: MouseEvent) {
    this.displayPosition = {
      y: event.clientY,
      x: event.clientX,
    };
  }

  @action
  hideItems() {
    this.displayPosition = null;
  }

  @action
  cancelDebouncedHideItemsTask() {
    (this.debouncedHideItemsTask as Task).cancelAll();
  }

  @action
  registerItemsElement(itemsElement: HTMLDivElement) {
    this.itemsDivElement = itemsElement;
  }

  @action
  unregisterItemsElement() {
    this.itemsDivElement = null;
  }
}
