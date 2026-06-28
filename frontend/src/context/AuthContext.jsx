import { useEffect, useReducer } from "react";
import {
  apiRequest,
  clearStoredAuthSession,
  readStoredAuthSession,
  setStoredAuthSession
} from "../api/axios.js";
import { AuthContext } from "./AuthContextObject.js";
import { authReducer, AUTH_ACTIONS, initialAuthState } from "./AuthReducer.js";

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const { token, user } = readStoredAuthSession();

    dispatch({ type: AUTH_ACTIONS.BOOTSTRAP_START });

    apiRequest("/auth/profile")
      .then((data) => {
        const mergedUser = { ...(user || {}), ...(data.user || {}) };
        setStoredAuthSession({ user: mergedUser });
        dispatch({
          type: AUTH_ACTIONS.BOOTSTRAP_SUCCESS,
          payload: { user: mergedUser }
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

    setStoredAuthSession({ user: data.user });
    dispatch({
      type: AUTH_ACTIONS.SESSION_SET,
      payload: { user: data.user }
    });

    return data;
  }

  async function register(credentials) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: credentials
    });

    setStoredAuthSession({ user: data.user });
    dispatch({
      type: AUTH_ACTIONS.SESSION_SET,
      payload: { user: data.user }
    });

    return data;
  }

  function logout() {
    apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
    clearStoredAuthSession();
    dispatch({ type: AUTH_ACTIONS.SESSION_CLEAR });
    if (window.location.hash !== "#/login") {
      window.location.hash = "#/login";
    }
  }

  const value = {
    ...state,
    isAuthenticated: Boolean(state.user),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
