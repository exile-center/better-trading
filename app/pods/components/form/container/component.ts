// Vendor
import {action} from '@ember/object';
import Component from '@glimmer/component';

interface Args {
  submitTask: {
    perform: (entity: object) => void;
  };
  canSubmit?: boolean;
  entity: object;
}

export default class FormContainer extends Component<Args> {
  get canSubmit() {
    if (this.args.canSubmit === undefined) return true;

    return this.args.canSubmit;
  }

  @action
  handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.canSubmit) return;

    this.args.submitTask.perform(this.args.entity);
  }
}
