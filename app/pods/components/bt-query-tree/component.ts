// Vendors
import Component from '@ember/component';
// @ts-ignore
import {createTree} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';

export default class BtQueryTree extends Component {
  didInsertElement(): void {
    createTree('#bt-query-tree-container', {
      extensions: ['edit', 'filter'],
      filter: {
        autoExpand: true,
        highlight: true
      },
      source: []
    });
  }

  /*
  @action
  filterNodes(event: Event) {
    if (!event.target) return;
    const inputTarget = event.target as HTMLInputElement;

    if (!inputTarget.value) return this.clearFilter();

    this.tree.filterNodes(inputTarget.value);
  }

  @action
  clearFilter(): void {
    this.tree.clearFilter();
  }
  */
}
