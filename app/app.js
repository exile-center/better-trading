import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

// Initialize the extension root container
const extensionContainer = document.createElement('div');
extensionContainer.id = 'better-trading-container';
document.body.appendChild(extensionContainer);

const {modulePrefix, podModulePrefix} = config;
const App = Application.extend({
  rootElement: extensionContainer,
  modulePrefix,
  podModulePrefix,
  Resolver
});

loadInitializers(App, modulePrefix);

export default App;
