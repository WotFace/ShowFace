import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import store from './store';
import * as serviceWorker from './serviceWorker';

// Polyfills
import 'pepjs';

const rootEl = document.getElementById('root');

function renderApp(App) {
  ReactDOM.render(<App store={store} />, rootEl);
}
renderApp(App);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// TODO: Provide config dict with onUpdate callback
serviceWorker.register();

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    renderApp(NextApp);
  });
}
