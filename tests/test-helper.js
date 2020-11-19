import Application from '../app';
import config from '../config/environment';
import {setApplication} from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import {mocha} from 'mocha';

chai.use(sinonChai);

mocha.setup({
  slow: 500,
  timeout: 2000,
});

setApplication(Application.create(config.APP));

start();
