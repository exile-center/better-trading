// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default class Input extends Component<Args> {
  @action
  handleInput(event: {target: {value: string}}) {
    this.args.onChange(event.target.value);
  }
}
