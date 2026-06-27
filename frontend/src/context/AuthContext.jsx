import { useEffect, useReducer } from "react";
import {
  apiRequest,
  clearStoredAuthSession,
  readStoredAuthSession,
  setStoredAuthSession
} from "../api/axios.js";
import { AuthContext } from "./AuthContextObject.js";
import { authReducer, AUTH_ACTIONS, initialAuthState } from "./AuthReducer.js";

function mergeProfileUser(storedUser, profileUser, token) {
  return {
    ...(storedUser || {}),
    ...(profileUser || {}),
    token
  };
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const { token, user } = readStoredAuthSession();

    if (!token) {
      dispatch({ type: AUTH_ACTIONS.BOOTSTRAP_FAILURE });
      return;
    }

    dispatch({ type: AUTH_ACTIONS.BOOTSTRAP_START });

    apiRequest("/auth/profile", { token })
      .then((data) => {
        const mergedUser = mergeProfileUser(user, data.user, token);
        setStoredAuthSession({ token, user: mergedUser });
        dispatch({
          type: AUTH_ACTIONS.BOOTSTRAP_SUCCESS,
          payload: { token, user: mergedUser }
        });
      })
      .catch(() => {
        clearStoredAuthSession();
        dispatch({ type: AUTH_ACTIONS.BOOTSTRAP_FAILURE });
      });
  }, []);

  async function login(credentials) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: credentials
    });

    const user = {
      ...data.user,
      token: data.token
    };

    setStoredAuthSession({ token: data.token, user });
    dispatch({
      type: AUTH_ACTIONS.SESSION_SET,
      payload: { token: data.token, user }
    });

    return data;
  }

  async function register(credentials) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: credentials
    });

    const user = {
      ...data.user,
      token: data.token
    };

    setStoredAuthSession({ token: data.token, user });
    dispatch({
      type: AUTH_ACTIONS.SESSION_SET,
      payload: { token: data.token, user }
    });

    return data;
  }

  async function refreshProfile() {
    if (!state.token) {
      return null;
    }

    const data = await apiRequest("/auth/profile", { token: state.token });
    const mergedUser = mergeProfileUser(state.user, data.user, state.token);

    setStoredAuthSession({ token: state.token, user: mergedUser });
    dispatch({
      type: AUTH_ACTIONS.SESSION_UPDATE,
      payload: { user: mergedUser }
    });

    return mergedUser;
  }

  function logout() {
    clearStoredAuthSession();
    dispatch({ type: AUTH_ACTIONS.SESSION_CLEAR });
    if (window.location.hash !== "#/login") {
      window.location.hash = "#/login";
    }
  }

  const value = {
    ...state,
    isAuthenticated: Boolean(state.token),
    login,
    register,
    refreshProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
