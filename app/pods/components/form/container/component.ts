// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  submitTask: {
    perform: (entity: object) => void;
  };
  entity: object;
}

export default class FormContainer extends Component<Args> {
  @action
  handleSubmit(event: Event) {
    event.preventDefault();

    this.args.submitTask.perform(this.args.entity);
  }
}
