// Vendor
import Component from '@glimmer/component';

interface Args {
  type: 'warning' | 'alert' | 'success';
  message: string;
}

export default class AlertMessage extends Component<Args> {
  get icon() {
    if (this.args.type === 'success') return 'check-circle';

    return 'exclamation-circle';
  }
}
