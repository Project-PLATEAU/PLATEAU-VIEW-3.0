import { gql } from "@apollo/client";

export const assetFileFragment = gql`
  fragment assetFileFragment on AssetFile {
    name
    path
    filePaths
  }
`;

export default assetFileFragment;
