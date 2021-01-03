// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';

interface Args {
  label?: string;
  icon?: string;
  href?: string;
  fileAccept?: string;
  theme: 'blue' | 'gold' | 'red';
  onClick?: () => {};
  onFileChange?: () => {};
}

export default class Button extends Component<Args> {
  @action
  handleClick() {
    if (!this.args.onClick) return;

    this.args.onClick();
  }

  get fileAccept() {
    return this.args.fileAccept || '*';
  }
}
