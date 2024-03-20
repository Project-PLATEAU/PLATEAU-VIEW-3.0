import { type AuthInfo, getAuthInfo } from "./authInfo";
import { configureCognito } from "./aws";

export { getAuthInfo, getSignInCallbackUrl, logInToTenant, logOutFromTenant } from "./authInfo";

export type Config = {
  api: string;
  logoUrl?: string;
  coverImageUrl?: string;
  cesiumIonAccessToken?: string;
  editorUrl: string;
  multiTenant?: Record<string, AuthInfo>;
} & AuthInfo;

const env = import.meta.env;

export const defaultConfig: Config = {
  api: env.REEARTH_CMS_API || "/api",
  auth0Audience: env.REEARTH_CMS_AUTH0_AUDIENCE,
  auth0Domain: env.REEARTH_CMS_AUTH0_DOMAIN,
  auth0ClientId: env.REEARTH_CMS_AUTH0_CLIENT_ID,
  authProvider: env.REEARTH_CMS_AUTH_PROVIDER || "auth0",
  logoUrl: env.REEARTH_CMS_LOGO_URL,
  coverImageUrl: env.REEARTH_CMS_COVER_URL,
  cesiumIonAccessToken: env.REEARTH_CMS_CESIUM_ION_ACCESS_TOKEN || "",
  editorUrl: env.REEARTH_CMS_EDITOR_URL,
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };

  const authInfo = getAuthInfo(window.REEARTH_CONFIG);
  if (authInfo?.authProvider === "cognito") configureCognito(authInfo.cognito ?? authInfo);
}

export function config(): Config | undefined {
  return window.REEARTH_CONFIG;
}

export function e2eAccessToken(): string | undefined {
  return window.REEARTH_E2E_ACCESS_TOKEN;
}

declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
    REEARTH_E2E_ACCESS_TOKEN?: string;
  }
}
