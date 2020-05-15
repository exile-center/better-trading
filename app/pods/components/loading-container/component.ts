// Vendor
import Component from '@glimmer/component';

// Types
import {Task} from 'better-trading/types/ember-concurrency';

interface Args {
  task: Task;
}

export default class LoadingContainer extends Component<Args> {
  get isLoading(): boolean {
    return this.args.task.isRunning;
  }
}
