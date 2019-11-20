// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';

interface Args {
  label?: string;
  icon?: string;
  theme: 'blue' | 'gold';
  onClick?: () => {};
}

export default class Navigation extends Component<Args> {
  @action
  handleClick() {
    if (!this.args.onClick) return;

    this.args.onClick();
  }
}
