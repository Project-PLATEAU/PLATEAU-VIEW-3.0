import { Auth0Provider } from "@auth0/auth0-react";
import React, { createContext, ReactNode, useState } from "react";

import { getAuthInfo, getSignInCallbackUrl, logInToTenant } from "@reearth-cms/config";

import { useAuth0Auth } from "./Auth0Auth";
import AuthHook from "./AuthHook";
import { useCognitoAuth } from "./CognitoAuth";

export const AuthContext = createContext<AuthHook | null>(null);

const Auth0Wrapper = ({ children }: { children: ReactNode }) => {
  const auth = useAuth0Auth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const CognitoWrapper = ({ children }: { children: ReactNode }) => {
  const auth = useCognitoAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authInfo] = useState(() => {
    logInToTenant(); // note that it includes side effect
    return getAuthInfo();
  });
  const authProvider = authInfo?.authProvider;

  if (authProvider === "auth0") {
    const domain = authInfo?.auth0Domain;
    const clientId = authInfo?.auth0ClientId;
    const audience = authInfo?.auth0Audience;

    return domain && clientId ? (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        audience={audience}
        useRefreshTokens
        scope="openid profile email"
        cacheLocation="localstorage"
        redirectUri={getSignInCallbackUrl()}>
        <Auth0Wrapper>{children}</Auth0Wrapper>
      </Auth0Provider>
    ) : null;
  }

  if (authProvider === "cognito") {
    // No specific provider needed for Cognito/AWS Amplify
    return <CognitoWrapper>{children}</CognitoWrapper>;
  }

  return null;
};
