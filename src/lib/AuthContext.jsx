import React, { createContext, useState, useContext, useEffect } from "react";

// ---------------------------------------------------------------------------
// AuthContext — independent implementation (Base44 SDK removed)
//
// The original implementation used the Base44 SDK for:
//   1. base44.app.getPublicSettings() — platform app settings gate
//   2. base44.auth.me()              — fetch current user from Base44 backend
//   3. base44.auth.logout()          — clear token + redirect via Base44
//   4. base44.auth.redirectToLogin() — redirect to Base44 login page
//
// This version:
//   - Skips the platform app-settings gate (sets appPublicSettings to {})
//   - Reads the stored token from localStorage to determine auth state
//   - Decodes a minimal user object from the stored JWT (if present)
//   - Navigates to /login for logout and redirectToLogin
//
// NOTE: The app's Login/Register/ForgotPassword/ResetPassword pages call the
// Base44 auth backend which is no longer available. Those pages will render
// their UI but display an informative error when the user submits. This is
// expected behavior for an independent deployment without a custom auth server.
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'base44_access_token';

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token') || null;
  } catch {
    return null;
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
  } catch {}
}

/**
 * Attempt to parse a minimal user object from a stored JWT payload.
 * Returns null if the token is missing or malformed.
 */
function parseUserFromToken(token) {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      email: decoded.email || decoded.sub || null,
      role: decoded.role || 'user',
      id: decoded.sub || decoded.id || null,
      ...decoded,
    };
  } catch {
    // Token exists but is opaque (not a JWT) — return a minimal user object
    return { role: 'user' };
  }
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // No platform app-settings endpoint — resolve immediately
      setAppPublicSettings({});
      setIsLoadingPublicSettings(false);

      await checkUserAuth();
    } catch (error) {
      console.error("Unexpected error:", error);
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred",
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      const token = readStoredToken();
      if (token) {
        const parsedUser = parseUserFromToken(token);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("User auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    clearStoredToken();
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
