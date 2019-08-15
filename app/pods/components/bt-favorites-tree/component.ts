// Vendors
import {A} from '@ember/array';
import Component from '@ember/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

// Types
import MutableArray from '@ember/array/mutable';
import LocalStorage from 'better-trading/services/local-storage';
import {FavoritesItem} from 'better-trading/types/favorites';

interface MoveActionParams {
  sourceList: MutableArray<FavoritesItem>;
  sourceIndex: number;
  targetList: MutableArray<FavoritesItem>;
  targetIndex: number;
}

// Constants
const TMP_DATA = A([
  {
    isExpanded: true,
    items: A([
      {
        slug: 'KMjkPnU5',
        title: 'First list item'
      },
      {
        isExpanded: false,
        items: A([
          {
            slug: 'KMjkPnU5',
            title: 'Second list item'
          }
        ]),
        title: 'Sub Dark 1'
      },
      {
        isExpanded: false,
        items: A([]),
        title: 'Empty folder'
      }
    ]),
    title: 'Dark 1'
  },
  {
    isExpanded: true,
    items: A([
      {
        slug: 'KMjkPnU5',
        title: 'Top helm 1'
      },
      {
        slug: 'KMjkPnU5',
        title: 'Top helm 2'
      },
      {
        slug: 'KMjkPnU5',
        title: 'Top helm 3'
      }
    ]),
    title: 'Dark 2'
  },
  {
    slug: 'KMjkPnU5',
    title: 'Root item'
  }
]);

export default class BtFavoritesTree extends Component {
  @service('local-storage')
  localStorage: LocalStorage;

  items: MutableArray<FavoritesItem> = TMP_DATA;

  willInsertElement(): void {
    this.items = TMP_DATA;

    /*
    const savedFavorites = this.localStorage.getValue('favorites');
    if (!savedFavorites) return;

    this.folders = A(JSON.parse(savedFavorites));
    */
  }

  @action
  persistFavorites(): void {
    console.log("persist");
  }

  @action
  moveItem({sourceList, sourceIndex, targetList, targetIndex}: MoveActionParams) {
    if (sourceList === targetList && sourceIndex === targetIndex) return;

    const item = sourceList.objectAt(sourceIndex);
    if (!item) return;

    sourceList.removeAt(sourceIndex);
    targetList.insertAt(targetIndex, item);
  }
}
