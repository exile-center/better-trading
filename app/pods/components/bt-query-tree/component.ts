// Vendors
import Component from '@ember/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
// @ts-ignore
import {createTree} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';

// Services
import Tree from 'better-trading/services/tree';

// Constants
const TEMP_RAW_NODES = [
  {
    children: [
      {
        children: [
          {
            children: [],
            data: {name: 'Lab enchant base', trade: 'q1w2e3r4'},
            id: '1'
          }
        ],
        data: {name: 'Helmets'},
        id: '2'
      }
    ],
    data: {type: 'build', name: 'Dark Pact'},
    id: '3'
  }
];

export default class BtQueryTree extends Component {
  @service
  tree: Tree;

  private fancyTree: any;

  didInsertElement(): void {
    this.fancyTree = createTree('#bt-fancy-tree-container', {
      extensions: ['filter'],
      filter: {
        autoExpand: true,
        highlight: true
      },
      source: this.tree.generateFancyNodes(TEMP_RAW_NODES)
    });
  }

  @action
  filterNodes(event: Event) {
    if (!event.target) return;
    const inputTarget = event.target as HTMLInputElement;

    if (!inputTarget.value) return this.clearFilter();

    this.fancyTree.filterNodes(inputTarget.value);
  }

  @action
  clearFilter(): void {
    this.fancyTree.clearFilter();
  }
}
