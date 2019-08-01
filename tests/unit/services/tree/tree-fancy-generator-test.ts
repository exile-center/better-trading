// Vendors
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {describe, it} from 'mocha';

// Services
import TreeFancyGenerator from 'better-trading/services/tree/fancy-generator';

describe('Unit | Service | Tree | Fancy Generator', () => {
  setupTest();

  it('should recursively generates the Fancy Tree data structure', function() {
    const service: TreeFancyGenerator = this.owner.lookup(
      'service:tree/fancy-generator'
    );

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

    expect(service.generate(rawNodes)).to.deep.equal([
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
    ]);
  });
});
