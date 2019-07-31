// Vendors
import Service, {inject as service} from '@ember/service';

// Services
import FancyGenerator from 'better-trading/services/tree/fancy-generator';
import FancySerializer from 'better-trading/services/tree/fancy-serializer';

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
  @service()
  fancyGenerator: FancyGenerator;

  @service()
  fancySerializer: FancySerializer;

  serializeFancyNodes(nodes: FancyTreeNode[]): RawTreeNode[] {
    return this.fancySerializer.serialize(nodes);
  }

  generateFancyNodes(nodes: RawTreeNode[]): FancyTreeNode[] {
    return this.fancyGenerator.generate(nodes);
  }
}
