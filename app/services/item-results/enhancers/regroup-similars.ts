// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import {ItemResultsEnhancerService} from 'better-trading/types/item-results';
import IntlService from 'ember-intl/services/intl';

export default class RegroupSimilars extends Service implements ItemResultsEnhancerService {
  @service('intl')
  intl: IntlService;

  slug = 'regroup-similars';

  enhance(itemElement: HTMLElement) {
    const currentHash = this.setItemHash(itemElement);

    const originalResult = this.findOriginalResult(itemElement, currentHash);

    if (originalResult.dataset.id === itemElement.dataset.id) return;

    const buttonState = this.updateToggleButtonFor(originalResult);
    itemElement.setAttribute('bt-regroup-state', buttonState);
  }

  private findOriginalResult(result: HTMLElement, currentHash: string): HTMLElement {
    const previousResult = result.previousElementSibling as HTMLElement;
    if (!previousResult) return result;

    const previousHash = previousResult.getAttribute('bt-regroup-hash');

    if (previousHash !== currentHash) return result;
    return this.findOriginalResult(previousResult, currentHash);
  }

  private setItemHash(result: HTMLElement) {
    const seller = result
      .querySelector('.profile-link [href]')
      ?.getAttribute('href')
      ?.replace(/^\/account\/view-profile\//, '');
    const itemName = result.querySelector('.itemHeader')?.textContent?.replace(/superior/i, '');
    const price = result.querySelector('.price')?.textContent;

    const hash = btoa(
      encodeURIComponent([seller, itemName, price].filter(Boolean).join('').replace(/\s/g, '').toLowerCase())
    );
    result.setAttribute('bt-regroup-hash', hash);

    return hash;
  }

  private injectToggleButton(result: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');

    // standard button styles from pathofexile.com
    button.classList.add('btn');
    button.classList.add('btn-default');
    // our style overrides
    button.classList.add('bt-group-button');

    button.dataset.state = 'hidden';

    button.addEventListener('click', this.handleToggleClick.bind(this));

    // for consistency with sibling button layouts/styling
    const wrapper = window.document.createElement('span');
    wrapper.appendChild(button);

    const detailsElement = result.querySelector('.details .btns');
    detailsElement?.appendChild(button);

    return button;
  }

  private updateToggleButtonFor(result: HTMLElement) {
    let buttonElement: HTMLButtonElement = result.querySelector('.bt-group-button') as HTMLButtonElement;

    if (!buttonElement) {
      buttonElement = this.injectToggleButton(result);
    }

    const currentCount = buttonElement.dataset.count;
    const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 1;
    buttonElement.dataset.count = newCount.toString();

    buttonElement.innerText = this.intl.t('item-results.regroup-similars.button', {count: newCount});

    return buttonElement.dataset.state as string;
  }

  private handleToggleClick(event: MouseEvent) {
    const buttonElement = event.target as HTMLButtonElement;
    const resultElement = buttonElement.closest('[bt-enhanced]') as HTMLElement;

    const newState = buttonElement.dataset.state === 'hidden' ? 'visible' : 'hidden';
    buttonElement.dataset.state = newState;

    return this.toggleSimilarResult(resultElement, newState, resultElement.getAttribute('bt-regroup-hash') as string);
  }

  private toggleSimilarResult(result: HTMLElement, state: string, hash: string) {
    const nextResult = result.nextElementSibling as HTMLElement | undefined;
    if (!nextResult || nextResult.getAttribute('bt-regroup-hash') !== hash) return;

    nextResult.setAttribute('bt-regroup-state', state);
    this.toggleSimilarResult(nextResult, state, hash);
  }
}

declare module '@ember/service' {
  interface Registry {
    'item-results/enhancers/regroup-similars': RegroupSimilars;
  }
}
