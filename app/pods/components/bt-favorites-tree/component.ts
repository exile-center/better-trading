// Vendors
import {A} from '@ember/array';
import Component from '@ember/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import MutableArray from '@ember/array/mutable';
import LocalStorage from 'better-trading/services/local-storage';
import {FavoritesFolder} from 'better-trading/types/favorites';

// Constants
const TMP_DATA = A([
  {
    isExpanded: true,
    items: [
      {
        slug: 'KMjkPnU5',
        title: 'Top helm'
      },
      {
        slug: 'KMjkPnU5',
        title: 'Top helm'
      },
      {
        slug: 'KMjkPnU5',
        title: 'Top helm'
      }
    ],
    title: 'Dark Pact'
  },
  {
    isExpanded: true,
    items: [
      {
        slug: 'KMjkPnU5',
        title: 'Top helm'
      },
      {
        slug: 'KMjkPnU5',
        title: 'Top helm'
      },
      {
        slug: 'KMjkPnU5',
        title: 'Top helm'
      }
    ],
    title: 'Dark Pact'
  }
]);

export default class BtFavoritesTree extends Component {
  @service('local-storage')
  localStorage: LocalStorage;

  folders: MutableArray<FavoritesFolder> = TMP_DATA;

  willInsertElement(): void {
    const savedFavorites = this.localStorage.getValue('favorites');
    if (!savedFavorites) return;

    this.folders = A(JSON.parse(savedFavorites));
  }

  @action
  persistFavorites(): void {
    this._saveFolders();
  }

  _saveFolders(): void {
    this.localStorage.setValue(
      'favorites',
      JSON.stringify(this.folders.toArray())
    );
  }
}
