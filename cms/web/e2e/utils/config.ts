export const config = {
  api: process.env["REEARTH_CMS_API"],
  userName: process.env["REEARTH_CMS_E2E_USERNAME"],
  password: process.env["REEARTH_CMS_E2E_PASSWORD"],
  workspaceId: process.env["REEARTH_CMS_E2E_WORKSPACE_ID"],
  authAudience: process.env["REEARTH_CMS_AUTH0_AUDIENCE"],
  authClientId: process.env["REEARTH_CMS_AUTH0_CLIENT_ID"],
  authUrl: process.env["REEARTH_CMS_AUTH0_DOMAIN"],
};

export type Config = typeof config;

export function setAccessToken(accessToken: string) {
  process.env.REEARTH_E2E_ACCESS_TOKEN = accessToken;
}

export function getAccessToken(): string | undefined {
  return process.env.REEARTH_E2E_ACCESS_TOKEN;
}
