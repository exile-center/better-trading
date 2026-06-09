import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const CONTAINER_ID = 'better-trading-container';

// Reuse an existing container to avoid duplicate panels on reinjection.
let extensionContainer = document.getElementById(CONTAINER_ID);

if (!extensionContainer) {
  extensionContainer = document.createElement('div');
  extensionContainer.id = CONTAINER_ID;
}

// Check if the trading app is present (ie. not in maintenance)
if (document.querySelector('#trade') && document.querySelector('#app')) {
  document.body.classList.add('bt-body');

  const isCollapsed = Boolean(window.localStorage.getItem('bt-side-panel-collapsed'));
  if (isCollapsed) document.body.classList.add('bt-is-collapsed');
} else {
  extensionContainer.style.display = 'none';
}

if (!extensionContainer.parentElement) {
  document.body.appendChild(extensionContainer);
}

const {modulePrefix, podModulePrefix} = config;
const App = Application.extend({
  rootElement: extensionContainer,
  modulePrefix,
  podModulePrefix,
  Resolver,
});

loadInitializers(App, modulePrefix);

export default App;
