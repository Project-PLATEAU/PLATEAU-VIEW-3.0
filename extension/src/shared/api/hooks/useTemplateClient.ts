import invariant from "tiny-invariant";

import { templateClient } from "../clients";

export const useTemplateClient = () => {
  invariant(templateClient);
  return templateClient;
};
