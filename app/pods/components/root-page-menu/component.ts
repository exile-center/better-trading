// Vendor
import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

// Types
import {RootPage} from 'better-trading/pods/root/controller';
import IntlService from 'ember-intl/services/intl';

interface Args {
  currentPage: RootPage;
  onChange: (page: RootPage) => void;
}

interface MenuItem {
  page: RootPage;
  icon: string;
  label: string;
}

export default class RootPageMenu extends Component<Args> {
  @service('intl')
  intl: IntlService;

  get menuItems(): MenuItem[] {
    return [
      {
        page: RootPage.BOOKMARKS,
        icon: 'folder-open',
        label: this.intl.t('components.root-page-menu.bookmarks')
      },
      {
        page: RootPage.HISTORY,
        icon: 'history',
        label: this.intl.t('components.root-page-menu.history')
      }
    ];
  }

  get activeItemIndex() {
    return this.menuItems.findIndex(menuItem => menuItem.page === this.args.currentPage);
  }
}
