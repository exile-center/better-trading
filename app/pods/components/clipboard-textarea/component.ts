// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

// Utilities
import {copyToClipboard} from 'better-trading/utilities/copy-to-clipboard';

// Types
import IntlService from 'ember-intl/services/intl';

interface Args {
  value: string;
}

export default class ClipboardTextarea extends Component<Args> {
  @service('intl')
  intl: IntlService;

  @tracked
  hasCopied: boolean = false;

  get copyButtonLabel() {
    if (this.hasCopied) return this.intl.t('components.clipboard-textarea.button-copied');

    return this.intl.t('components.clipboard-textarea.button');
  }

  @action
  selectAll(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  @action
  copyToClipboard() {
    copyToClipboard(this.args.value);
    this.hasCopied = true;
  }
}
