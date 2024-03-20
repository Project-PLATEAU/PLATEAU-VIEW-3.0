import styled from "@emotion/styled";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Switch from "@reearth-cms/components/atoms/Switch";
import Cards from "@reearth-cms/components/molecules/Settings/Cards";
import FormModal from "@reearth-cms/components/molecules/Settings/FormModal";
import {
  WorkspaceSettings,
  TileInput,
  TerrainInput,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  workspaceSettings: WorkspaceSettings;
  hasPrivilege: boolean;
  onWorkspaceSettingsUpdate: (
    tiles: TileInput[],
    terrains: TerrainInput[],
    isEnable?: boolean,
  ) => Promise<void>;
};

const Settings: React.FC<Props> = ({
  workspaceSettings,
  hasPrivilege,
  onWorkspaceSettingsUpdate,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>();

  useEffect(() => {
    setSettings(workspaceSettings);
  }, [workspaceSettings]);

  const tiles: TileInput[] = useMemo(() => {
    if (!settings?.tiles?.resources) return [];
    return settings?.tiles?.resources?.map(resource => ({ tile: resource }));
  }, [settings]);

  const terrains: TerrainInput[] = useMemo(() => {
    if (!settings?.terrains?.resources) return [];
    return settings?.terrains?.resources?.map(resource => ({ terrain: resource }));
  }, [settings]);

  const isTileRef = useRef(true);
  const indexRef = useRef<undefined | number>(undefined);

  const onTileModalOpen = (index?: number) => {
    setOpen(true);
    isTileRef.current = true;
    indexRef.current = index;
  };

  const onTerrainModalOpen = (index?: number) => {
    setOpen(true);
    isTileRef.current = false;
    indexRef.current = index;
  };

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onChange = useCallback((checked: boolean) => {
    setSettings(prevState => {
      if (!prevState) return;
      const copySettings = structuredClone(prevState);
      if (copySettings.terrains) copySettings.terrains.enabled = checked;
      return copySettings;
    });
  }, []);

  const handleDelete = useCallback(
    (isTile: boolean, index: number) => {
      if (!settings) return;
      const copySettings = structuredClone(settings);
      if (isTile) {
        copySettings.tiles?.resources?.splice(index, 1);
      } else {
        copySettings.terrains?.resources?.splice(index, 1);
      }
      setSettings(copySettings);
    },
    [settings],
  );

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number, isTile: boolean) => {
      if (toIndex < 0) return;
      if (!settings) return;
      const copySettings = structuredClone(settings);
      if (isTile) {
        if (!copySettings.tiles?.resources) return;
        const [removed] = copySettings.tiles.resources.splice(fromIndex, 1);
        copySettings.tiles.resources.splice(toIndex, 0, removed);
      } else {
        if (!copySettings.terrains?.resources) return;
        const [removed] = copySettings.terrains.resources.splice(fromIndex, 1);
        copySettings.terrains.resources.splice(toIndex, 0, removed);
      }
      setSettings(copySettings);
    },
    [settings],
  );

  const handleWorkspaceSettingsSave = useCallback(() => {
    onWorkspaceSettingsUpdate(tiles, terrains, settings?.terrains?.enabled);
  }, [onWorkspaceSettingsUpdate, settings?.terrains?.enabled, terrains, tiles]);

  return (
    <InnerContent title={t("Settings")}>
      <ContentSection
        title={t("Geospatial asset preview setting")}
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}>
        <Title>{t("Tiles")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
        {settings?.tiles?.resources?.length ? (
          <Cards
            resources={settings?.tiles?.resources}
            onModalOpen={onTileModalOpen}
            isTile={true}
            onDelete={handleDelete}
            onDragEnd={handleDragEnd}
          />
        ) : null}
        <Button type="link" onClick={() => onTileModalOpen()} icon={<Icon icon="plus" />}>
          {t("Add new Tiles option")}
        </Button>
        <Divider />
        <Title>{t("Terrain")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Terrain.")}</SecondaryText>
        <SwitchWrapper>
          <Switch
            checked={settings?.terrains?.enabled}
            onChange={onChange}
            disabled={!hasPrivilege}
          />
          <Text>{t("Enable")}</Text>
        </SwitchWrapper>
        {settings?.terrains?.enabled && (
          <>
            {settings?.terrains?.resources?.length ? (
              <Cards
                resources={settings?.terrains?.resources}
                onModalOpen={onTerrainModalOpen}
                isTile={false}
                onDelete={handleDelete}
                onDragEnd={handleDragEnd}
              />
            ) : null}
            <Button type="link" onClick={() => onTerrainModalOpen()} icon={<Icon icon="plus" />}>
              {t("Add new Terrain option")}
            </Button>
          </>
        )}
        <ButtonWrapper>
          <Button type="primary" onClick={handleWorkspaceSettingsSave}>
            {t("Save")}
          </Button>
        </ButtonWrapper>
        <FormModal
          open={open}
          onClose={onClose}
          isTile={isTileRef.current}
          tiles={tiles}
          terrains={terrains}
          setSettings={setSettings}
          index={indexRef.current}
        />
      </ContentSection>
    </InnerContent>
  );
};

export default Settings;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
`;

const SecondaryText = styled.p`
  color: #00000073;
  margin-bottom: 12px;
`;

const Text = styled.p`
  color: rgb(0, 0, 0, 0.85);
  font-weight: 500;
`;

const SwitchWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const ButtonWrapper = styled.div`
  padding: 12px 0;
`;
