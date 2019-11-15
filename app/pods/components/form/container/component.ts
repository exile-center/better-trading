// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Task {
  perform: () => void;
}

interface Args {
  submitTask: Task;
}

export default class FormContainer extends Component<Args> {
  @action
  handleSubmit(event: Event) {
    event.preventDefault();

    this.args.submitTask.perform();
  }
}
