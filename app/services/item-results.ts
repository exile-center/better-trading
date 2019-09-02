// Vendors
import Service from '@ember/service';
import {task, timeout} from 'ember-concurrency';
import window from 'ember-window-mock';

// Constants
const INITIAL_WATCH_DELAY = 300;

export default class ItemResults extends Service.extend({
  tryObserveResultsTask: task(function*(this: ItemResults) {
    const resultsNode = window.document.querySelector('.resultset');
    if (resultsNode) return this.watchResults(resultsNode);

    yield timeout(INITIAL_WATCH_DELAY);
    this.tryObserveResultsTask.perform();
  })
}) {
  resultsObserver: MutationObserver;
  resultsNode: Element;

  tryObserveResults() {
    this.tryObserveResultsTask.perform();
  }

  watchResults(resultsNode: Element) {
    this.resultsNode = resultsNode;
    this.resultsObserver = new MutationObserver(() => this._enhance());

    this.resultsObserver.observe(this.resultsNode, {
      childList: true
    });
  }

  willDestroy(): void {
    this.resultsObserver.disconnect();
  }

  _enhance() {
    this.resultsNode.querySelectorAll(':scope > :not([bt-enhanced])').forEach((resultElement: Element) => {
      resultElement.toggleAttribute('bt-enhanced', true);
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results': ItemResults;
  }
}
