// Vendor
import {computed} from '@ember/object';
import Service from '@ember/service';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import ShoeboxWriter from 'better-trading/services/apollo/shoebox-writer';

describe('Unit | Services | Apollo | shoebox-writer', () => {
  setupTest();

  let service: ShoeboxWriter;

  describe('when executing inside the browser', () => {
    beforeEach(function() {
      class ApolloStub extends Service {}

      class FastBootStub extends Service {
        isFastBoot = false;

        @computed()
        get shoebox() {
          return {
            put: sinon.stub()
          };
        }
      }

      this.owner.register('service:fastboot', FastBootStub);
      this.owner.register('service:apollo', ApolloStub);

      service = this.owner.lookup('service:apollo/shoebox-writer');
    });

    describe('write', () => {
      it('should not call the shoebox because we don’t want to write anything when we’re in the browser', () => {
        service.write();

        expect(service.fastboot.shoebox.put).to.not.have.been.called;
      });
    });
  });

  describe('when executing inside FastBoot', () => {
    describe('with no content in the shoebox', () => {
      beforeEach(function() {
        class ApolloStub extends Service {
          get client() {
            return {
              get cache() {
                return {
                  extract: sinon.stub().returns({foo: 'bar'})
                };
              }
            };
          }
        }

        class FastBootStub extends Service {
          isFastBoot = true;

          @computed()
          get shoebox() {
            return {
              put: sinon.stub()
            };
          }
        }

        this.owner.register('service:fastboot', FastBootStub);
        this.owner.register('service:apollo', ApolloStub);

        service = this.owner.lookup('service:apollo/shoebox-writer');
      });

      describe('write', () => {
        it('should write the object inside the apollo cache, serialized, to the shoebox', () => {
          service.write();

          expect(service.fastboot.shoebox.put).to.have.been.calledOnce;
          expect(service.fastboot.shoebox.put).to.have.been.calledWith(
            'test-apollo-cache',
            '{"foo":"bar"}'
          );
        });
      });
    });
  });
});
