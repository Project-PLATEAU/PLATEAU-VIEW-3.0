import { Button, Typography, styled } from "@mui/material";
import { Stack } from "@mui/system";
import { useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { ParameterList } from "../../../prototypes/ui-components";
import { CustomLegendIconLegend } from "../../../prototypes/ui-components/CustomLegendIconLegend";
import { customLegendSchemeSelectionAtom } from "../../../prototypes/view-layers";
import { CommonContentWrapper } from "../../ui-components/CommonContentWrapper";
import { LayerModel } from "../../view-layers";
import {
  makeCustomLegendSchemeAtomForComponent,
  makeCustomLegendSchemeForComponent,
} from "../state/customLegendSchemeForComponent";

export interface CustomLegendSchemeSectionForComponentFieldProps {
  layers: readonly LayerModel[];
}

const StyledButton = styled(Button)(({ theme }) => ({
  ...theme.typography.body2,
  display: "block",
  width: `calc(100% + ${theme.spacing(2)})`,
  margin: 0,
  padding: `0 ${theme.spacing(1)}`,
  marginLeft: theme.spacing(-1),
  marginRight: theme.spacing(-1),
  textAlign: "left",
}));

export const CustomLegendSchemeSectionForComponentField: FC<
  CustomLegendSchemeSectionForComponentFieldProps
> = ({ layers }) => {
  const customLegendSchemeAtom = useMemo(
    () => makeCustomLegendSchemeAtomForComponent(layers),
    [layers],
  );
  const customLegendSchemeValueAtom = useMemo(
    () => makeCustomLegendSchemeForComponent(customLegendSchemeAtom),
    [customLegendSchemeAtom],
  );

  return (
    <ParameterList>
      <CommonContentWrapper>
        <Legend layers={layers} customLegendSchemeValueAtom={customLegendSchemeValueAtom} />
      </CommonContentWrapper>
    </ParameterList>
  );
};

const Legend: FC<{
  layers: readonly LayerModel[];
  customLegendSchemeValueAtom: ReturnType<typeof makeCustomLegendSchemeForComponent>;
}> = ({ layers, customLegendSchemeValueAtom }) => {
  const customLegendScheme = useAtomValue(customLegendSchemeValueAtom);
  const setSelection = useSetAtom(customLegendSchemeSelectionAtom);
  const handleClick = useCallback(() => {
    // Assume that every layer as the same image scheme.
    setSelection([layers[0].id]);
  }, [layers, setSelection]);

  if (customLegendScheme == null) {
    return null;
  }
  return (
    <StyledButton variant="text" onClick={handleClick}>
      <Stack spacing={1} width="100%" marginY={1}>
        {!!customLegendScheme.name && (
          <Typography variant="body2">{customLegendScheme.name}</Typography>
        )}
        <CustomLegendIconLegend customLegends={customLegendScheme.customLegends} />
      </Stack>
    </StyledButton>
  );
};
