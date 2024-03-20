import invariant from "tiny-invariant";

import { settingClient } from "../clients";

export const useSettingClient = () => {
  invariant(settingClient);
  return settingClient;
};
