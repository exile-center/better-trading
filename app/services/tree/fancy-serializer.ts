// Vendors
import Service from '@ember/service';

// Types
import {FancyTreeNode, RawTreeNode} from 'better-trading/services/tree';

export default class TreeFancySerializer extends Service {
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

declare module '@ember/service' {
  interface Registry {
    'tree/fancy-serializer': TreeFancySerializer;
  }
}
