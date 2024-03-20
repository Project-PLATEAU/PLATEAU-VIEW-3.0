import { Divider, Button, ButtonProps, styled } from "@mui/material";
import { type FC } from "react";

import { InspectorItem } from "../../../prototypes/ui-components";
import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";

export interface DatasetProps {
  dataset?: DatasetFragmentFragment;
}

interface CustomButtonProps extends ButtonProps {
  target?: string;
}

export const OpenDataLink: FC<DatasetProps> = ({ dataset }) => {
  const openDataUrl = dataset?.openDataUrl;
  const hasDataset = !!openDataUrl;

  return (
    <>
      {hasDataset && (
        <>
          <Divider />
          <InspectorItem>
            <CustomButton
              size="small"
              variant="outlined"
              fullWidth
              href={openDataUrl}
              target="_blank">
              オープンデータを入手
            </CustomButton>
          </InspectorItem>
        </>
      )}
    </>
  );
};

const CustomButton = styled(Button)<CustomButtonProps>({
  borderRadius: "2px",
  borderColor: "#D9D9D9",
});
