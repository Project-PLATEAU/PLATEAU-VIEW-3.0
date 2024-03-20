import { Template } from "../types/template";

import { PlateauAPIClient } from "./base";

export let templateClient: PlateauAPIClient<Template> | undefined;
export const createTemplateClient = (projectId: string, url: string, token: string) => {
  templateClient = new PlateauAPIClient(projectId, url, token, "templates");
};
