// Reads the session token from localStorage for use in auth-gated API calls.
const SESSION_TOKEN_KEY = 'flagatlas_session_token';

const isNode = typeof window === 'undefined';

const isClearTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredToken = () => {
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem('token');
};

const getAccessToken = () => {
  if (isNode) return null;
  return window.localStorage.getItem(SESSION_TOKEN_KEY) || window.localStorage.getItem('token') || null;
};

const getAppParams = () => {
  if (isClearTokenRequested()) {
    clearStoredToken();
  }
  return {
    appId: null,
    token: getAccessToken(),
    functionsVersion: null,
    appBaseUrl: null,
  };
};

export const appParams = {
  ...getAppParams(),
};
