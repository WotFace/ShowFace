import { combineReducers } from 'redux';

// Reducers
import ui from './ui';
import userData from './userData';

export default combineReducers({
  ui,
  userData,
});
