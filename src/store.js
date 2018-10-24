import { createStore, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
import rootReducer from './reducers';

const persistConfig = {
  key: 'root',
  storage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(persistedReducer, composeEnhancers());

// Enable webpack hot module replacement for reducers
if (module.hot && process.env.NODE_ENV !== 'production') {
  module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));
}

export default store;
export const persistor = persistStore(store);
