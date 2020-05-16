// Vendor
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {dropTask, restartableTask} from 'ember-concurrency-decorators';
import {action} from '@ember/object';

// Types
import TradeLocation from 'better-trading/services/trade-location';
import {TradeLocationHistoryStruct} from 'better-trading/types/trade-location';
import {Task} from 'better-trading/types/ember-concurrency';

export default class PageHistory extends Component {
  @service('trade-location')
  tradeLocation: TradeLocation;

  @tracked
  historyEntries: TradeLocationHistoryStruct[] = [];

  @restartableTask
  *refetchHistoryTask() {
    this.historyEntries = yield this.tradeLocation.fetchHistoryEntries();
  }

  @dropTask
  *initialFetchHistoryTask() {
    yield (this.refetchHistoryTask as Task).perform();
  }

  @dropTask
  *clearHistoryTask() {
    this.historyEntries = [];
    yield this.tradeLocation.clearHistoryEntries();
  }

  @action
  handleDidInsert() {
    this.tradeLocation.on('change', this, this.handleTradeLocationChange);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (this.initialFetchHistoryTask as Task).perform();
  }

  @action
  handleWillDestroy() {
    this.tradeLocation.on('change', this, this.handleTradeLocationChange);
  }

  private handleTradeLocationChange() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (this.refetchHistoryTask as Task).perform();
  }
}
