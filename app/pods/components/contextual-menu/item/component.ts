// Vendor
import Component from '@glimmer/component';
import {action} from "@ember/object";

interface Args {
  label: string;
  onClick: () => Promise<any> | void;
  didClick: () => {};
}

export default class ContextualMenuItem extends Component<Args> {
  @action
  async dispatchAction() {
    await this.args.onClick();
    this.args.didClick();
  }
}
