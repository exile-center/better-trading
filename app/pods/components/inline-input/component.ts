// Vendors
import {action} from '@ember/object';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

// Constants
const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';

interface Args {
  value: string;
  onConfirm: (newValue: string) => void;
  onCancel: () => void;
}

export default class InlineInput extends Component<Args> {
  @tracked
  stagedValue: string;

  @action
  handleInput(event: {target: {value: string}}) {
    this.stagedValue = event.target.value;
  }

  @action
  handleKeyup(event: KeyboardEvent) {
    if (event.key === ENTER_KEY) {
      this.args.onConfirm(this.stagedValue);
    } else if (event.key === ESCAPE_KEY) {
      this.args.onCancel();
    }
  }

  @action
  confirm() {
    this.args.onConfirm(this.stagedValue);
  }
}
