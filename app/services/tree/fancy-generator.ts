// Vendors
import Service from '@ember/service';

// Types
import {FancyTreeNode, RawTreeNode} from 'better-trading/services/tree';

export default class TreeFancyGenerator extends Service {
  generate(nodes: RawTreeNode[]): FancyTreeNode[] {
    return nodes.map(node => {
      if (Boolean(node.children.length)) return this._generateFolder(node);

      return this._generateItem(node);
    });
  }

  _generateFolder(node: RawTreeNode): FancyTreeNode {
    return {
      children: this.generate(node.children),
      data: node.data,
      extraClasses: node.data.type || null,
      folder: true,
      key: node.id,
      title: `<span>${node.data.name}</span><div>FOLDER BUTTONS</div>`
    };
  }

  _generateItem(node: RawTreeNode): FancyTreeNode {
    return {
      children: [],
      data: node.data,
      extraClasses: node.data.type || null,
      folder: false,
      key: node.id,
      title: `<span>${node.data.name}</span><div>ITEM BUTTONS</div>`
    };
  }
}

declare module '@ember/service' {
  interface Registry {
    'tree/fancy-generator': TreeFancyGenerator;
  }
}
