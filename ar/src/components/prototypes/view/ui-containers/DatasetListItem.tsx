import { IconButton, styled, useMediaQuery, useTheme } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState, type FC, type MouseEvent, type ReactNode } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { createRootLayerAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer } from "../../layers";
import { DatasetTreeItem, InfoIcon, UseCaseIcon, type DatasetTreeItemProps } from "../../ui-components";
import { datasetTypeIcons } from "../constants/datasetTypeIcons";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";

import { DatasetDialog } from "./DatasetDialog";

const Delimiter = styled("span")(({ theme }) => ({
  margin: `0 0.5em`,
  color: theme.palette.text.disabled,
}));

export function joinPath(values: string[]): ReactNode {
  return (values as ReactNode[]).reduce((prev, curr, index) => [
    prev,
    <Delimiter key={index}>/</Delimiter>,
    curr,
  ]);
}

export interface DatasetListItemProps
  extends Omit<DatasetTreeItemProps, "nodeId" | "icon" | "secondaryAction"> {
  municipalityCode: string;
  dataset: DatasetFragmentFragment;
}

export const DatasetListItem: FC<DatasetListItemProps> = ({
  dataset,
  municipalityCode,
  label,
  ...props
}) => {
  // TODO: Separate into hook
  const layer = useAtomValue(
    useMemo(
      // レイヤーのIDはデータセットIDが使用されている模様
      () => atom(get => get(rootLayersLayersAtom).find(layer => layer.id === dataset.id)),
      [dataset],
    ),
  );

  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const layerType = datasetTypeLayers[dataset.type.code as PlateauDatasetType] ?? datasetTypeLayers.usecase;
  const addLayer = useAddLayer();
  const removeLayer = useSetAtom(removeLayerAtom);
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  // データセット行が選択された際のコールバック
  // TODO: ここで当該のデータセットが渡ってくるので、ARViewの場合はデータセットのIDだけ使用して表示非表示を切り替えるとよさそう
  const handleClick = useCallback(() => {
    if (layerType == null) {
      return;
    }
    if (layer == null) {
      const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
      // ここでaddLayerAtomを経由してlayerAtomsAtom(rootLayersAtomのsplit)にレイヤーを追加している
      // TODO: レイヤー機能は使用しないので、こことelseで、自前のatomにdatasetのID群を持つのが簡単そう → やっぱりレイヤー機能はUIにかなり密結合なので、今回剥がすより乗っかって使う方向でいくのがよさそう
      // (ARViewのCesiumで表示するデータセットIDを管理するだけなら自前のIDリストで十分なのだが、追加中のレイヤー一覧からレイヤーを選択した際などに表出する、レイヤー詳細パネルをARViewでも使用したいはずなので、レイヤー機能に乗っかるしかなさそう)
      addLayer(
        createRootLayerAtom({
          dataset,
          settings: filteredSettings,
          templates,
          areaCode: municipalityCode,
        }),
        { autoSelect: !smDown },
      );
    } else {
      // ここでremoveLayerAtomを経由してlayerAtomsAtom(rootLayersAtomのsplit)からレイヤーを削除している
      removeLayer(layer.id);
    }
  }, [
    dataset,
    layer,
    layerType,
    addLayer,
    removeLayer,
    smDown,
    municipalityCode,
    settings,
    templates,
  ]);

  const [infoOpen, setInfoOpen] = useState(false);
  const handleInfo = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setInfoOpen(true);
  }, []);
  const handleInfoClose = useCallback(() => {
    setInfoOpen(false);
  }, []);

  // const wrappedLabel = useMemo(
  //   () =>
  //     inEditor() && dataset.year
  //       ? !Array.isArray(label)
  //         ? `[${dataset.year}]${label}`
  //         : [...label.slice(0, -1), `[${dataset.year}]${label.slice(-1)[0]}`]
  //       : label,
  //   [dataset, label],
  // );

  const Icon = datasetTypeIcons[dataset.type.code as PlateauDatasetType] ?? UseCaseIcon;
  return (
    <>
      <DatasetTreeItem
        nodeId={dataset.id}
        icon={Icon && <Icon />}
        selected={layer != null}
        disabled={layerType == null}
        secondaryAction={
          <IconButton size="small" onClick={handleInfo}>
            <InfoIcon />
          </IconButton>
        }
        onClick={handleClick}
        label={label}
        {...props}
      />
      <DatasetDialog
        open={infoOpen}
        dataset={dataset}
        municipalityCode={municipalityCode}
        onClose={handleInfoClose}
      />
    </>
  );
};
