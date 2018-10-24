import { SET_RESPOND_NAME } from '../actions/userData';

const defaultState = {
  name: '',
};

export default function userDataReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_RESPOND_NAME: {
      return {
        ...state,
        name: action.name,
      };
    }
    default:
      return state;
  }
}
