// Vendors
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {describe, it} from 'mocha';

// Services
import TreeFancySerializer from 'better-trading/services/tree/fancy-serializer';

describe('Unit | Service | Tree | Fancy Serializer', () => {
  setupTest();

  it('should recursively serializes the Fancy Tree data structure', function() {
    const service: TreeFancySerializer = this.owner.lookup(
      'service:tree/fancy-serializer'
    );

    const fancyNodes = [
      {
        children: [
          {
            children: [
              {
                children: [],
                data: {name: 'Lab enchant base', trade: 'q1w2e3r4'},
                extraClasses: null,
                folder: false,
                key: '1',
                title: '<span>Lab enchant base</span><div>ITEM BUTTONS</div>'
              }
            ],
            data: {name: 'Helmets'},
            extraClasses: null,
            folder: true,
            key: '2',
            title: '<span>Helmets</span><div>FOLDER BUTTONS</div>'
          }
        ],
        data: {type: 'build', name: 'Dark Pact'},
        extraClasses: 'build',
        folder: true,
        key: '3',
        title: '<span>Dark Pact</span><div>FOLDER BUTTONS</div>'
      }
    ];

    expect(service.serialize(fancyNodes)).to.deep.equal([
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
    ]);
  });
});
