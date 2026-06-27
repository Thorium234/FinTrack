export const AUTH_ACTIONS = {
  BOOTSTRAP_START: "BOOTSTRAP_START",
  BOOTSTRAP_SUCCESS: "BOOTSTRAP_SUCCESS",
  BOOTSTRAP_FAILURE: "BOOTSTRAP_FAILURE",
  SESSION_SET: "SESSION_SET",
  SESSION_CLEAR: "SESSION_CLEAR",
  SESSION_UPDATE: "SESSION_UPDATE",
  AUTH_ERROR: "AUTH_ERROR"
};

export const initialAuthState = {
  token: null,
  user: null,
  ready: false,
  loading: false,
  error: null
};

export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.BOOTSTRAP_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_ACTIONS.BOOTSTRAP_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        ready: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.BOOTSTRAP_FAILURE:
      return {
        ...state,
        token: null,
        user: null,
        ready: true,
        loading: false,
        error: action.payload || null
      };
    case AUTH_ACTIONS.SESSION_SET:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        ready: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.SESSION_CLEAR:
      return {
        ...state,
        token: null,
        user: null,
        ready: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.SESSION_UPDATE:
      return {
        ...state,
        user: action.payload.user
      };
    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
}
