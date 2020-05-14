// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

// Types
import IntlService from 'ember-intl/services/intl';

interface Args {
  value: string;
}

export default class ClipboardTextarea extends Component<Args> {
  @service('intl')
  intl: IntlService;

  textareaElement: HTMLInputElement;

  get copyButtonLabel() {
    if (this.hasCopied) return this.intl.t('components.clipboard-textarea.button-copied');

    return this.intl.t('components.clipboard-textarea.button');
  }

  @tracked
  hasCopied: boolean = false;

  @action
  textareaDidInsert(textareaElement: HTMLInputElement) {
    this.textareaElement = textareaElement;
  }

  @action
  selectAll(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  @action
  copyToClipboard() {
    this.textareaElement.select();
    document.execCommand('copy');
    this.hasCopied = true;
  }
}
