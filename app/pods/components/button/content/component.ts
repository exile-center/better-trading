// Vendor
import Component from '@glimmer/component';

interface Args {
  label?: string;
  icon?: string;
}

export default class ButtonContent extends Component<Args> {
  get iconPrefix() {
    if (!this.args.icon) return;
    if (['github', 'discord'].includes(this.args.icon)) return 'fab';

    return 'fas';
  }
}
