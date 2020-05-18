// Vendor
import Component from '@glimmer/component';
import {action} from '@ember/object';

// Types
import FlashMessage from 'ember-cli-flash/flash/object';

interface Args {
  flashMessages: FlashMessage[];
}

export default class FlashMessages extends Component<Args> {
  @action
  dismissFlashMessage(flashMessage: FlashMessage) {
    flashMessage.exitMessage();
  }
}
