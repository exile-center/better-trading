// Vendor
import Component from '@glimmer/component';

interface Args {
  label: string;
  onClick?: () => {};
}

export default class ContextualMenuItem extends Component<Args> {}
