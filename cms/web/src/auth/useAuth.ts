import { useContext, useEffect, useState } from "react";

import { AuthContext } from "./AuthProvider";

export const errorKey = "reeartherror";

export const useAuth = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("No auth provider configured");
  }

  return auth;
};

export function useCleanUrl() {
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams(window.location.search);

    const error = params.get(errorKey);
    if (error) {
      setError(error);
    }

    params.delete("code");
    params.delete("state");
    params.delete(errorKey);

    const queries = params.toString();
    const url = `${window.location.pathname}${queries ? "?" : ""}${queries}`;

    history.replaceState(null, document.title, url);
  }, [isAuthenticated, isLoading]);

  return error;
}

export function useAuthenticationRequired(): [boolean, string | undefined] {
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    if (authError) {
      logout();
      return;
    }

    login();
  }, [authError, isAuthenticated, isLoading, login, logout]);

  const error = useCleanUrl();

  return [isAuthenticated, error];
}
