// Vendors
import {tagName} from '@ember-decorators/component';
import Component from '@ember/component';
import {action} from '@ember/object';

@tagName('')
export default class BtCheckbox extends Component {
  value: boolean;
  label: string;
  onChange: (newValue: boolean) => void;

  @action
  toggleValue() {
    this.onChange(!this.value);
  }
}
