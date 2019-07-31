// Vendors
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {describe, it} from 'mocha';

// Services
import FancyGenerator from 'better-trading/services/tree/fancy-generator';
import FancySerializer from 'better-trading/services/tree/fancy-serializer';

describe('Unit | Service | Tree', () => {
  setupTest();

  it('fancy serialization/generation should be idempotent', function() {
    const generator: FancyGenerator = this.owner.lookup(
      'service:tree/fancy-generator'
    );
    const serializer: FancySerializer = this.owner.lookup(
      'service:tree/fancy-serializer'
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

    expect(serializer.serialize(generator.generate(rawNodes))).to.deep.equal(
      rawNodes
    );
  });
});
