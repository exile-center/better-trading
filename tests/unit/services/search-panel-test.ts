// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, afterEach, describe, it} from 'mocha';

// HTML Samples
import AnonItem from 'better-trading/tests/html-samples/search-panel/anon-ele-res-max-life';
import UniqueItem from 'better-trading/tests/html-samples/search-panel/belly-of-the-beast-6l-no-corrupt';
import RareJewel from 'better-trading/tests/html-samples/search-panel/rare-jewel';

// Types
import SearchPanel from 'better-trading/services/search-panel';

describe('Unit | Services | Search panel', () => {
  setupTest();

  let service: SearchPanel;
  let sampleContainer: HTMLDivElement;

  beforeEach(function () {
    service = this.owner.lookup('service:search-panel');

    sampleContainer = window.document.createElement('div');
    sampleContainer.style.display = 'none';
    window.document.body.prepend(sampleContainer);
  });

  afterEach(() => {
    sampleContainer.remove();
  });

  describe('recommendTitle', () => {
    it('should return the name of a named search', () => {
      sampleContainer.insertAdjacentHTML('afterbegin', UniqueItem);

      expect(service.recommendTitle()).to.equal('Belly of the Beast Full Wyrmscale');
    });

    it('should fallback on the item type/rarity', () => {
      sampleContainer.insertAdjacentHTML('afterbegin', RareJewel);

      expect(service.recommendTitle()).to.equal('Any Jewel (Rare)');
    });

    it('should default to empty string', () => {
      sampleContainer.insertAdjacentHTML('afterbegin', AnonItem);

      expect(service.recommendTitle()).to.equal('');
    });
  });
});
