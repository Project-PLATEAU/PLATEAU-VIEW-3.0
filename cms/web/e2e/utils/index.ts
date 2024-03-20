// eslint-disable-next-line no-restricted-imports
import { test as base, type Page } from "@playwright/test";

import { config, getAccessToken, type Config } from "./config";

// eslint-disable-next-line no-restricted-imports
export { expect } from "@playwright/test";

export type Reearth = {
  goto: Page["goto"];
  token: string | undefined;
  gql: <T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: { ignoreError?: boolean },
  ) => Promise<T>;
} & Config;

export const test = base.extend<{
  reearth: Reearth;
}>({
  reearth: async ({ page, request }, use) => {
    use({
      ...config,
      token: getAccessToken(),
      async goto(url, options) {
        const res = await page.goto(url, options);
        if (this.token) {
          await page.evaluate(`window.REEARTH_E2E_ACCESS_TOKEN = ${JSON.stringify(this.token)};`);
        }
        return res;
      },
      async gql(query, variables, options) {
        if (!this.token) throw new Error("access token is not initialized");

        const resp = await request.post(config.api + "/graphql", {
          data: {
            query,
            variables,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        const body = await resp.json();
        if (!options?.ignoreError && (!resp.ok() || body.errors)) {
          throw new Error(`GraphQL error: ${JSON.stringify(body)}`);
        }

        return body;
      },
    });
  },
});
