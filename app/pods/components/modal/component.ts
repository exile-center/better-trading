// Vendor
import Component from '@glimmer/component';

interface Args {
  title: string;
  onClose: () => {};
}

export default class Modal extends Component<Args> {}
