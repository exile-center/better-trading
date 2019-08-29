// Vendors
import Component from '@ember/component';
import {action} from '@ember/object';

// Constants
const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';

export default class BtInlineInput extends Component {
  stagedValue: string;

  value: string;
  onConfirm: (newValue: string) => void;
  onCancel: () => void;

  @action
  handleInput(event: { target: { value: string; }; }) {
    this.set('stagedValue', event.target.value);
  }

  @action
  handleKeyup(event: KeyboardEvent) {
    if (event.key === ENTER_KEY) {
      this.onConfirm(this.stagedValue);
    } else if (event.key === ESCAPE_KEY) {
      this.onCancel();
    }
  }

  @action
  confirm() {
    this.onConfirm(this.stagedValue);
  }
}
