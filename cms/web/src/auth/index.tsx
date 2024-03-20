import { PropsWithChildren } from "react";

import { useAuthenticationRequired } from "./useAuth";

export { AuthProvider } from "./AuthProvider";
export { useAuth } from "./useAuth";

export function AuthenticationRequiredPage({
  children,
}: PropsWithChildren<unknown>): JSX.Element | null {
  const [isAuthenticated] = useAuthenticationRequired(); // TODO: show error
  return isAuthenticated && children ? <>{children}</> : null;
}
