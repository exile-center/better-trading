// Vendor
import Service from '@ember/service';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import ShoeboxReader from 'ember-boilerplate/services/apollo/shoebox-reader';

describe('Unit | Services | Apollo | shoebox-reader', () => {
  setupTest();

  let service: ShoeboxReader;

  describe('when executing inside FastBoot', () => {
    beforeEach(function() {
      class FastBootStub extends Service {
        isFastBoot = true;
      }

      this.owner.register('service:fastboot', FastBootStub);

      service = this.owner.lookup('service:apollo/shoebox-reader');
    });

    describe('read', () => {
      it('should return `null` because we don’t want to restore anything when we’re server-side rendering', () => {
        expect(service.read()).to.equal(null);
      });
    });
  });

  describe('when executing inside the browser', () => {
    describe('with content in the shoebox', () => {
      beforeEach(function() {
        class FastBootStub extends Service {
          isFastBoot = false;

          get shoebox() {
            return {
              retrieve: sinon.stub().returns('{"foo": "bar"}')
            };
          }
        }

        this.owner.register('service:fastboot', FastBootStub);

        service = this.owner.lookup('service:apollo/shoebox-reader');
      });

      describe('read', () => {
        it('should return the object stored in the shoebox, parsed as a JavaScript object', () => {
          expect(service.read()).to.deep.equal({foo: 'bar'});
        });
      });
    });

    describe('with no content in the shoebox', () => {
      class FastBootStub extends Service {
        isFastBoot = false;

        get shoebox() {
          return {
            retrieve: sinon.stub().returns(undefined)
          };
        }
      }

      beforeEach(function() {
        this.owner.register('service:fastboot', FastBootStub);

        service = this.owner.lookup('service:apollo/shoebox-reader');
      });

      describe('read', () => {
        it('should return a plain object', () => {
          expect(service.read()).to.deep.equal({});
        });
      });
    });

    describe('with unparseable content in the shoebox', () => {
      class FastBootStub extends Service {
        isFastBoot = false;

        get shoebox() {
          return {
            retrieve: sinon.stub().returns("{invalid_json: 'bar'}")
          };
        }
      }

      beforeEach(function() {
        this.owner.register('service:fastboot', FastBootStub);

        service = this.owner.lookup('service:apollo/shoebox-reader');
      });

      describe('read', () => {
        it('should return a plain object', () => {
          expect(service.read()).to.deep.equal({});
        });
      });
    });
  });
});
