// Vendors
import {tagName} from '@ember-decorators/component';
import Component from '@ember/component';

// Types
type RouteName = 'home' | 'settings';

@tagName('')
export default class BtNavigation extends Component {
  currentRouteName: RouteName;
}
