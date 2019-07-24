// Vendor
import Service from '@ember/service';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {afterEach, beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Config
import config from 'ember-boilerplate/config/environment';

// Types
import ApplicationRoute from 'ember-boilerplate/pods/application/route';

describe('Unit | Routes | application', () => {
  setupTest();

  let route: ApplicationRoute;
  const originalConfig = config;

  beforeEach(function() {
    const ApolloShoeboxWriterStub = class extends Service {
      write = sinon.stub();
    };

    this.owner.register(
      'service:apollo/shoebox-writer',
      ApolloShoeboxWriterStub
    );

    const ServiceWorkerStub = class extends Service {
      register = sinon.stub().returnsThis();
      onUpdateReady = sinon.stub();
    };

    this.owner.register('service:service-worker', ServiceWorkerStub);

    // We need to do this because ember-intl somehow always
    // overwrites our `this.owner.register` when trying to stub it.
    const intl = this.owner.lookup('service:intl');
    intl.addTranslations = sinon.stub();
    intl.setLocale = sinon.stub();

    route = this.owner.lookup('route:application');
  });

  it('should exist', () => {
    expect(route).to.be.ok;
  });

  describe('beforeModel', () => {
    it('should set the locale of the app', async () => {
      await route.beforeModel();

      expect(route.intl.setLocale).to.have.been.calledOnce;
      expect(route.intl.setLocale).to.have.been.calledWith('en-ca');
    });

    describe('when `config.intl.ASYNC_TRANSLATIONS` is true', () => {
      beforeEach(() => {
        config.intl.ASYNC_TRANSLATIONS = true;

        (route as any).fetchTranslations = sinon
          .stub()
          .returns(Promise.resolve());
      });

      afterEach(() => {
        config.intl.ASYNC_TRANSLATIONS = originalConfig.intl.ASYNC_TRANSLATIONS;

        ((route as any).fetchTranslations as sinon.SinonStub).reset();
      });

      it('should load translations asynchronously', async () => {
        await route.beforeModel();

        expect(route.intl.addTranslations).to.have.been.calledOnce;
      });
    });

    describe('when `config.intl.ASYNC_TRANSLATIONS` is false', () => {
      beforeEach(() => {
        config.intl.ASYNC_TRANSLATIONS = false;
        route.intl.setLocale('en-ca');
      });

      afterEach(() => {
        config.intl.ASYNC_TRANSLATIONS = originalConfig.intl.ASYNC_TRANSLATIONS;
      });

      it('should have translations bundled in the build', async () => {
        await route.beforeModel();

        expect(route.intl.addTranslations).to.not.have.been.called;
      });
    });
  });

  describe('didTransition', () => {
    it('should write the apollo cache to the shoebox', () => {
      route.actions.didTransition.call(route);

      expect(route.apolloShoeboxWriter.write).to.have.been.calledOnce;
    });
  });
});
