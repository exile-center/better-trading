// Vendors
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {describe, it} from 'mocha';

// Services
import Tree from 'better-trading/services/tree';

describe('Unit | Service | Tree', () => {
  setupTest();

  it('fancy serialization/generation should be idempotent', function() {
    const tree: Tree = this.owner.lookup('service:tree');

    const rawNodes = [
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

    expect(
      tree.serializeFancyNodes(tree.generateFancyNodes(rawNodes))
    ).to.deep.equal(rawNodes);
  });
});
