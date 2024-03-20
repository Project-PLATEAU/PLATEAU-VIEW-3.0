import { StatusBlock } from "./blocks/StatusBlock";

import { EditorDataset } from ".";

type StatusPageProps = {
  dataset?: EditorDataset;
};

export const StatusPage: React.FC<StatusPageProps> = ({ dataset }) => {
  return <StatusBlock dataset={dataset} />;
};
