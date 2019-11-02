// Vendors
import Component from '@glimmer/component';

// Types
type RouteName = 'home' | 'settings';

interface Args {
  currentRouteName: RouteName;
}

export default class Navigation extends Component<Args> {}
