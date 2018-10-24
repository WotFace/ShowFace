import { createStore, compose } from 'redux';

import rootReducer from './reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers());

// Enable webpack hot module replacement for reducers
if (module.hot && process.env.NODE_ENV !== 'production') {
  module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));
}

export default store;
