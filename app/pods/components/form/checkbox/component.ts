// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  value: boolean;
  label: string;
  onChange: (newValue: boolean) => void;
}

export default class FormCheckbox extends Component<Args> {
  @action
  toggleValue() {
    this.args.onChange(!this.args.value);
  }
}
