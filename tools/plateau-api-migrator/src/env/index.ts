import { config } from "dotenv";

config();

export type Environment = NodeJS.ProcessEnv & {
  PLATEAU_SIDEBAR_API: string;
  PLATEAU_SIDEBAR_DEV_API?: string;
  PLATEAU_SIDEBAR_API_TOKEN: string;
  PLATEAU_DATACATALOG_API_VIEW2: string;
  PLATEAU_API_PROJECT_NAME_VIEW2: string;
  PLATEAU_API_PROJECT_NAME_VIEW3: string;
  CONVERT_TARGET?: "dev" | "prod";
};

export const env = (): Environment => {
  return process.env as Environment;
};
