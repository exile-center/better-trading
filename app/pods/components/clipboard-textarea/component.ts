// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

interface Args {
  value: string;
}

export default class ClipboardTextarea extends Component<Args> {
  textareaElement: HTMLInputElement;

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
