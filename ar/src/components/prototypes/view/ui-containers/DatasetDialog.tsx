import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  listItemSecondaryActionClasses,
  styled,
  type DialogProps,
} from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, type FC } from "react";

import { useDatasetById } from "../../../shared/graphql";
import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { createRootLayerAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer } from "../../layers";
import { EntityTitle, PrefixedAddSmallIcon, PrefixedCheckSmallIcon } from "../../ui-components";
import { BUILDING_LAYER } from "../../view-layers";
import { datasetTypeIcons } from "../constants/datasetTypeIcons";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";

const StyledEntityTitle = styled(EntityTitle)(({ theme }) => ({
  minHeight: theme.spacing(6),
  [`& .${listItemSecondaryActionClasses.root}`]: {
    right: 4,
  },
}));

const StyledDialogContentText = styled(DialogContentText)(({ theme }) => ({
  color: theme.palette.text.primary,
  whiteSpace: "pre-line",
}));

const StyledButton = styled(Button, {
  shouldForwardProp: prop => prop !== "checked",
})<{
  checked?: boolean;
}>(({ theme, checked = false }) => ({
  fontSize: theme.typography.body2.fontSize,
  ...(checked && {
    color: theme.palette.primary.main,
  }),
}));

export interface DatasetDialogProps extends Omit<DialogProps, "children"> {
  municipalityCode: string;
  dataset: DatasetFragmentFragment;
}

export const DatasetDialog: FC<DatasetDialogProps> = ({ dataset, municipalityCode, ...props }) => {
  // TODO: 単一データセットを選択した際のダイアログ (Re:EarthのSTGからReactのツリーが見れるかもなのでそれ聞いて参考にしてもいいかも。プロダクションでは見れるか分からん)
  const { data } = useDatasetById(dataset.id);

  // TODO: Separate into hook
  const layer = useAtomValue(
    useMemo(
      () =>
        atom(get =>
          get(rootLayersLayersAtom).find(
            layer => layer.type === BUILDING_LAYER && layer.id === dataset.id,
          ),
        ),
      [dataset],
    ),
  );

  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const layerType = datasetTypeLayers[dataset.type.code as PlateauDatasetType];
  const addLayer = useAddLayer();
  const removeLayer = useSetAtom(removeLayerAtom);
  const handleClick = useCallback(() => {
    if (layerType == null || !data?.node) {
      return;
    }
    if (layer == null) {
      const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
      addLayer(
        createRootLayerAtom({
          dataset,
          settings: filteredSettings,
          templates,
          areaCode: municipalityCode,
        }),
      );
    } else {
      removeLayer(layer.id);
    }
  }, [
    dataset,
    data,
    layer,
    layerType,
    addLayer,
    removeLayer,
    municipalityCode,
    settings,
    templates,
  ]);

  return (
    <Dialog {...props}>
      <StyledEntityTitle
        iconComponent={datasetTypeIcons[dataset.type.code as PlateauDatasetType]}
        title={{
          primary: dataset.type.name,
          secondary: dataset?.city?.name,
        }}
        secondaryAction={
          <StyledButton
            variant="contained"
            startIcon={
              layer == null ? (
                <PrefixedAddSmallIcon fontSize="small" />
              ) : (
                <PrefixedCheckSmallIcon fontSize="small" />
              )
            }
            checked={layer != null}
            disabled={layerType == null}
            onClick={handleClick}>
            {layer == null ? "追加" : "追加済み"}
          </StyledButton>
        }
      />
      <Divider />
      <DialogContent>
        <StyledDialogContentText>{data?.node?.description}</StyledDialogContentText>
      </DialogContent>
    </Dialog>
  );
};
