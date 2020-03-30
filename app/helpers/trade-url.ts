// Vendor
import Helper from '@ember/component/helper';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency-decorators';
import {timeout} from 'ember-concurrency';

// Types
import Location from 'better-trading/services/location';
import performTask from 'better-trading/utilities/perform-task';

// Constants
const URL_REFRESH_DELAY_IN_MILLISECONDS = 1000;

export default class TradeUrl extends Helper {
  @service('location')
  location: Location;

  @task
  *urlUpdateTask() {
    yield timeout(URL_REFRESH_DELAY_IN_MILLISECONDS);

    if (document.hasFocus()) {
      this.recompute();
    }

    performTask(this.urlUpdateTask);
  }

  init() {
    super.init();

    // TODO: maybe rework with better url tracking
    performTask(this.urlUpdateTask);
  }

  compute(params: string[]) {
    const [type, slug, suffix] = params;
    const tradeURL = this.location.getTradeUrl(type, slug);

    if (!suffix) return tradeURL;

    return tradeURL + suffix;
  }
}
