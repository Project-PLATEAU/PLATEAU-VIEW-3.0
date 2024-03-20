import { Pagination, styled, paginationItemClasses } from "@mui/material";
import { useAtom } from "jotai";
import { FC, useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";

import { ParameterList } from "../../../../prototypes/ui-components";
import { useCamera } from "../../../reearth/hooks";
import { CameraPosition } from "../../../reearth/types";
import { DatasetStoryField } from "../../../types/fieldComponents/general";
import { CommonContentWrapper } from "../../../ui-components/CommonContentWrapper";
import { WritableAtomForComponent } from "../../../view-layers/component";

const PaginationWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  margin: theme.spacing(1, 0, 0, 0),
  [`.${paginationItemClasses.root}.Mui-selected`]: {
    color: "#fff",
  },
}));

export interface LayerDatasetStoryFieldProps {
  atoms: WritableAtomForComponent<DatasetStoryField>[];
}

export const LayerDatasetStoryField: FC<LayerDatasetStoryFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const { flyTo } = useCamera();

  const handleChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1);
  }, []);

  useEffect(() => {
    if (component?.preset?.pages?.[currentPage]?.camera) {
      flyTo(component.preset.pages[currentPage].camera as CameraPosition);
    }
  }, [component.preset?.pages, currentPage, flyTo]);

  return component?.preset?.pages?.length > 0 ? (
    <ParameterList>
      <CommonContentWrapper>
        <Markdown skipHtml>{component.preset.pages[currentPage].content}</Markdown>
        <PaginationWrapper>
          <StyledPagination
            count={component.preset.pages.length}
            color="primary"
            size="small"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            onChange={handleChange}
          />
        </PaginationWrapper>
      </CommonContentWrapper>
    </ParameterList>
  ) : null;
};
