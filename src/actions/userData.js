export const SET_RESPOND_NAME = 'SET_RESPOND_NAME';

export const setRespondName = (name) => ({
  type: SET_RESPOND_NAME,
  payload: {
    name,
  },
});
