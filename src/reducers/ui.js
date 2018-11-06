import { PROMPT_REFRESH } from '../actions/ui';

const defaultState = {
  promptRefresh: false,
};

export default function uiReducer(state = defaultState, action) {
  switch (action.type) {
    case PROMPT_REFRESH: {
      return {
        ...state,
        promptRefresh: true,
      };
    }
    default:
      return state;
  }
}
