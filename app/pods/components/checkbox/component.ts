// Vendors
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  value: boolean;
  label: string;
  onChange: (newValue: boolean) => void;
}

export default class Checkbox extends Component<Args> {
  @action
  toggleValue() {
    this.args.onChange(!this.value);
  }
}
