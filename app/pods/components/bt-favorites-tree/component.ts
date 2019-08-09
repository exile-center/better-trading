// Vendors
import Component from '@ember/component';

// Services
import {FavoritesFolder} from 'better-trading/favorites';

// Constants
const TMP_DATA = [
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
];

export default class BtFavoritesTree extends Component {
  folders: FavoritesFolder[] = TMP_DATA;
}
