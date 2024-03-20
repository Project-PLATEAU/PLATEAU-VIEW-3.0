/// <reference types="vite/client" />

declare module "*.yml" {
  const yml: any;
  export default yml;
}

declare module "*.yaml" {
  const yml: any;
  export default yml;
}

interface ImportMetaEnv {
  readonly REEARTH_CMS_API: string;
  readonly REEARTH_CMS_AUTH0_DOMAIN: string;
  readonly REEARTH_CMS_AUTH0_AUDIENCE: string;
  readonly REEARTH_CMS_AUTH0_CLIENT_ID: string;
  readonly REEARTH_CMS_AUTH_PROVIDER: string;
  readonly REEARTH_CMS_COGNITO_REGION: string;
  readonly REEARTH_CMS_COGNITO_USER_POOL_ID: string;
  readonly REEARTH_CMS_COGNITO_USER_POOL_WEB_CLIENT_ID: string;
  readonly REEARTH_CMS_COGNITO_OAUTH_SCOPE: string;
  readonly REEARTH_CMS_COGNITO_OAUTH_DOMAIN: string;
  readonly REEARTH_CMS_COGNITO_OAUTH_REDIRECT_SIGN_IN: string;
  readonly REEARTH_CMS_COGNITO_OAUTH_REDIRECT_SIGN_OUT: string;
  readonly REEARTH_CMS_COGNITO_OAUTH_RESPONSE_TYPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
