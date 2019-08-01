// Vendors
import Service, {inject as service} from '@ember/service';

// Services
import TreeFancyGenerator from 'better-trading/services/tree/fancy-generator';
import TreeFancySerializer from 'better-trading/services/tree/fancy-serializer';

// Types
export interface NodeData {
  type?: string;
  name: string;
  trade?: string;
}

export interface RawTreeNode {
  id: string;
  data: NodeData;
  children: RawTreeNode[];
}

export interface FancyTreeNode {
  title: string;
  key: string;
  extraClasses: string | null;
  folder: boolean;
  data: NodeData;
  children: FancyTreeNode[];
}

export default class Tree extends Service {
  @service('tree/fancy-generator')
  treeFancyGenerator: TreeFancyGenerator;

  @service('tree/fancy-serializer')
  treeFancySerializer: TreeFancySerializer;

  serializeFancyNodes(nodes: FancyTreeNode[]): RawTreeNode[] {
    return this.treeFancySerializer.serialize(nodes);
  }

  generateFancyNodes(nodes: RawTreeNode[]): FancyTreeNode[] {
    return this.treeFancyGenerator.generate(nodes);
  }
}
