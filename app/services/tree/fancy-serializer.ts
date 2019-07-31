// Vendors
import Service from '@ember/service';

// Types
import {FancyTreeNode, RawTreeNode} from 'better-trading/services/tree/tree';

export default class FancySerializer extends Service {
  serialize(nodes: FancyTreeNode[]): RawTreeNode[] {
    return nodes.map(node => {
      if (Boolean(node.children.length)) return this._serializeFolder(node);

      return this._serializeItem(node);
    });
  }

  _serializeFolder(node: FancyTreeNode): RawTreeNode {
    return {
      children: this.serialize(node.children),
      data: node.data,
      id: node.key
    };
  }

  _serializeItem(node: FancyTreeNode): RawTreeNode {
    return {
      children: [],
      data: node.data,
      id: node.key
    };
  }
}
