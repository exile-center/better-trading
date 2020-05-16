// Vendor
import Component from '@glimmer/component';

interface Args {
  theme: 'warning' | 'error';
  message: string;
}

export default class AlertMessage extends Component<Args> {}
