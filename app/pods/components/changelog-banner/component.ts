// Vendor
import {inject as service} from '@ember/service';
import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

// Types
import Storage from 'better-trading/services/storage';

// Config
import config from 'better-trading/config/environment';

// Constants
const DISMISSED_CHANGELOG_STORAGE_KEY = 'dismissed-changelog';

export default class ChangelogBanner extends Component {
  @service('storage')
  storage: Storage;

  @tracked
  isDismissed: boolean = false;

  @tracked
  modalChangelogIsVisible: boolean = false;

  get currentVersion() {
    return config.APP.version;
  }

  get currentChangelog() {
    return config.APP.changelog;
  }

  get bannerIsVisible() {
    if (this.isDismissed) return false;
    if (!this.currentChangelog) return false;

    const dismissedChangelog = this.storage.getLocalValue(DISMISSED_CHANGELOG_STORAGE_KEY);
    if (dismissedChangelog && dismissedChangelog === this.currentChangelog.slug) return false;

    return true;
  }

  @action
  openChangelog() {
    this.modalChangelogIsVisible = true;
  }

  @action
  dismiss() {
    if (!this.currentChangelog) return;

    this.storage.setLocalValue(DISMISSED_CHANGELOG_STORAGE_KEY, this.currentChangelog.slug);
    this.isDismissed = true;
    this.modalChangelogIsVisible = false;
  }
}
