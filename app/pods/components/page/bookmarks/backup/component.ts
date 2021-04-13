// Vendor
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {dropTask} from 'ember-concurrency-decorators';

// Types
import Bookmarks from 'better-trading/services/bookmarks';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import IntlService from 'ember-intl/services/intl';
import {Task} from 'better-trading/types/ember-concurrency';

export default class Backup extends Component {
  @service('bookmarks')
  bookmarks: Bookmarks;

  @service('flash-messages')
  flashMessages: FlashMessages;

  @service('intl')
  intl: IntlService;

  @dropTask
  *generateBackupTask() {
    const dataString = yield this.bookmarks.generateBackupDataString();

    const linkFakeElement = document.createElement('a');
    const blob = new Blob([dataString], {type: 'text/plain'});

    linkFakeElement.download = 'poe-better-trading-backup.txt';
    linkFakeElement.href = window.URL.createObjectURL(blob);
    linkFakeElement.click();
  }

  @dropTask
  *restoreBackupTask([dataString]: [string]) {
    const restoreWasSuccessful = yield this.bookmarks.restoreFromDataString(dataString);

    if (!restoreWasSuccessful) {
      this.flashMessages.alert(this.intl.t('page.bookmarks.backup.restore-error-flash'));
    }
  }

  @action
  backupFileChange(event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files) return;

    const fileReader = new FileReader();

    fileReader.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (this.restoreBackupTask as Task).perform([fileReader.result]);
    };

    fileReader.readAsText(inputElement.files[0]);
  }
}
