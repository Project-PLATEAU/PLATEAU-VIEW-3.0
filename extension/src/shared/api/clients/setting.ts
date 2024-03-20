import { Setting } from "../types";

import { PlateauAPIClient } from "./base";

export let settingClient: PlateauAPIClient<Setting> | undefined;
export const createSettingClient = (projectId: string, url: string, token: string) => {
  settingClient = new PlateauAPIClient(projectId, url, token, "data");
};
