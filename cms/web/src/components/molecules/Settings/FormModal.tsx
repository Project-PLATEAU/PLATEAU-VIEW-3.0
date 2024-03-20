import { useCallback, useState, useEffect, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  TileType,
  TerrainType,
  TileInput,
  TerrainInput,
  WorkspaceSettings,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";
import { validateURL } from "@reearth-cms/utils/regex";

type FormValues = {
  type: TileType | TerrainType;
  name?: string;
  url?: string;
  image?: string;
  cesiumIonAssetId?: string;
  cesiumIonAccessToken?: string;
};

const TileTypeFormat: { [key in TileType]: string } = {
  DEFAULT: "Default",
  LABELLED: "Labelled",
  ROAD_MAP: "Road Map",
  OPEN_STREET_MAP: "OpenStreetMap",
  ESRI_TOPOGRAPHY: "ESRI Topography",
  EARTH_AT_NIGHT: "Earth at night",
  JAPAN_GSI_STANDARD_MAP: "Japan GSI Standard Map",
  URL: "URL",
};

const TerrainTypeFormat: { [key in TerrainType]: string } = {
  CESIUM_WORLD_TERRAIN: "Cesium World Terrain",
  ARC_GIS_TERRAIN: "ArcGIS Terrain",
  CESIUM_ION: "Cesium Ion",
};

export interface Props {
  model?: Model;
  open?: boolean;
  onClose: () => void;
  tiles: TileInput[];
  terrains: TerrainInput[];
  setSettings: React.Dispatch<React.SetStateAction<WorkspaceSettings | undefined>>;
  isTile: boolean;
  index?: number;
}

const FormModal: React.FC<Props> = ({
  open,
  onClose,
  tiles,
  terrains,
  setSettings,
  isTile,
  index,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [extraOpen, setExtraOpen] = useState(false);

  const options = useMemo(() => {
    const typeFormat = isTile ? TileTypeFormat : TerrainTypeFormat;
    return Object.keys(typeFormat).map(key => ({
      value: key,
      label: typeFormat[key as keyof typeof typeFormat],
    }));
  }, [isTile]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      const value = (() => {
        if (index === undefined) {
          return options[0].value;
        } else {
          const resource = isTile ? tiles[index].tile : terrains[index].terrain;
          form.setFieldsValue(resource.props);
          return resource.type;
        }
      })();
      form.setFieldValue("type", value);
      if (value === "URL" || value === "CESIUM_ION") {
        setExtraOpen(true);
      } else {
        setExtraOpen(false);
      }
    }
  }, [form, index, isTile, open, options, terrains, tiles]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((value: string) => {
    if (value === "URL" || value === "CESIUM_ION") {
      setExtraOpen(true);
    } else {
      setExtraOpen(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    const { type, name, url, image, cesiumIonAssetId, cesiumIonAccessToken } = values;
    setSettings(prevState => {
      if (!prevState) return;
      const copySettings = structuredClone(prevState);
      if (isTile) {
        if (!copySettings.tiles) {
          copySettings.tiles = {
            resources: [],
          };
        }
        const newTile = {
          id: newID(),
          type: type as TileType,
          props: { name: name ?? "", url: url ?? "", image: image ?? "" },
        };
        if (index === undefined) {
          copySettings.tiles.resources.push(newTile);
        } else {
          copySettings.tiles.resources[index] = newTile;
        }
      } else {
        if (!copySettings.terrains) {
          copySettings.terrains = {
            resources: [],
          };
        }
        const newTerrain = {
          id: newID(),
          type: type as TerrainType,
          props: {
            name: name ?? "",
            url: url ?? "",
            image: image ?? "",
            cesiumIonAssetId: cesiumIonAssetId ?? "",
            cesiumIonAccessToken: cesiumIonAccessToken ?? "",
          },
        };
        if (index === undefined) {
          copySettings.terrains.resources.push(newTerrain);
        } else {
          copySettings.terrains.resources[index] = newTerrain;
        }
      }
      return copySettings;
    });
    onClose();
  }, [form, index, isTile, onClose, setSettings]);

  const urlRules = useMemo(
    () => [
      {
        message: t("URL is not valid"),
        validator: async (_: any, value: string) => {
          return value && !validateURL(value) ? Promise.reject() : Promise.resolve();
        },
      },
    ],
    [t],
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={isTile ? t("New Tiles") : t("New Terrain")}
      footer={[
        <Button key="submit" type="primary" onClick={handleSubmit}>
          OK
        </Button>,
      ]}>
      <Form form={form} layout="vertical">
        <Form.Item name="type" label={isTile ? t("Tiles type") : t("Terrain type")}>
          <Select options={options} onSelect={handleSelect} />
        </Form.Item>
        {extraOpen ? (
          isTile ? (
            <>
              <Form.Item name="name" label={t("Name")} extra={t("Name of tiles")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="url" label={t("URL")} rules={urlRules}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="image" label={t("Image URL")} rules={urlRules}>
                <Input placeholder={t("example")} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="name" label={t("Name")} extra={t("Name of terrain")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="cesiumIonAssetId" label={t("Terrain Cesium Ion asset ID")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="cesiumIonAccessToken" label={t("Terrain Cesium Ion access token")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="url" label={t("Terrain URL")} rules={urlRules}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="image" label={t("Image URL")} rules={urlRules}>
                <Input placeholder={t("example")} />
              </Form.Item>
            </>
          )
        ) : undefined}
      </Form>
    </Modal>
  );
};

export default FormModal;
