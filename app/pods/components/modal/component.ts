// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';

interface Args {
  title: string;
  onClose: () => {};
}

export default class Modal extends Component<Args> {
  @action
  bindEscapeKey() {
    document.body.addEventListener('keyup', this.handleKeyup.bind(this));
  }

  @action
  unbindEscapeKey() {
    document.body.removeEventListener('keyup', this.handleKeyup.bind(this));
  }

  private handleKeyup(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;

    this.args.onClose();
  }
}
