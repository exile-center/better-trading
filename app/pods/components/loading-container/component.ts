// Vendor
import Component from '@glimmer/component';

// Types
import {Task} from 'better-trading/types/ember-concurrency';

interface Args {
  task: Task;
  size: 'small' | 'large';
}

export default class LoadingContainer extends Component<Args> {}
