import Application from '../app';
import config from '../config/environment';
import {setApplication} from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

setApplication(Application.create(config.APP));

start();
