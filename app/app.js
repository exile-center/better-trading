import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

// Initialize the extension root container
const extensionContainer = document.createElement('div');
extensionContainer.id = 'better-trading-container';

// Check if the trading app is present (ie. not in maintenance)
if (document.querySelector('#trade')) {
  document.body.classList.add('bt-body');

  const isCollapsed = Boolean(window.localStorage.getItem('bt-side-panel-collapsed'));
  if (isCollapsed) document.body.classList.add('bt-is-collapsed');
} else {
  extensionContainer.style.display = 'none';
}

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
