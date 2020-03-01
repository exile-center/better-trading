// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  label: string;
  value: string;
  autofocus?: boolean;
  onChange: (value: string) => void;
}

export default class FormInput extends Component<Args> {
  @action
  handleInput(event: {target: {value: string}}) {
    this.args.onChange(event.target.value);
  }

  @action
  autofocusInput(input: HTMLInputElement) {
    if (!this.args.autofocus) return;

    input.focus();
  }
}
