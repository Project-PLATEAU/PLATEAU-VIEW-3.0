import { Input, inputClasses } from "@mui/base/Input";
import AddIcon from "@mui/icons-material/Add";
import { Button, Typography, styled } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { ChangeEvent, Fragment, useCallback, useState } from "react";

import { AdditionalData } from "../../../../../tools/plateau-api-migrator/src/types/view2/core";
import { getExtension } from "../../utils/file";

import { Label } from "./Label";
import { StyledButton } from "./StyledButton";
import { UserDataItem } from "./types";
import { getAdditionalData } from "./utils";
import WebFileTypeSelect, { FileType, getSupportedType } from "./WebFileTypeSelect";

type Props = {
  onSubmit: (selectedItem: UserDataItem) => void;
};
const WebDataTab: React.FC<Props> = ({ onSubmit }) => {
  const [fileType, setFileType] = useState<FileType>("auto");
  const [dataUrl, setDataUrl] = useState("");
  const [selectedWebItem, setSelectedWebItem] = useState<UserDataItem>();
  const [requireLayerName, setRequireLayerName] = useState<boolean>(false);
  const [layers, setLayers] = useState<string[]>([]);

  const handleFileTypeSelect = useCallback((type: string) => {
    setFileType(type as FileType);
  }, []);

  const handleSetUrl = useCallback((value: string) => {
    setDataUrl(value);
  }, []);

  const setDataFormat = useCallback((type: FileType, filename: string) => {
    if (type === "auto") {
      let extension = getSupportedType(filename);
      if (!extension) extension = getExtension(filename);
      return extension;
    }
    return type;
  }, []);

  const needsLayerName = useCallback((url: string): boolean => {
    const serviceTypes = ["mvt", "wms", "wmts"];
    for (const serviceType of serviceTypes) {
      if (url.includes(serviceType)) {
        return true;
      }
    }
    return false;
  }, []);

  const handleClick = useCallback(async () => {
    const filename = dataUrl.substring(dataUrl.lastIndexOf("/") + 1);
    const id = "id" + Math.random().toString(16).slice(2);
    const format = setDataFormat(fileType, filename);

    let additionalData: AdditionalData | undefined;
    if (format === "csv") {
      const csv = await fetch(dataUrl);
      if (csv.status === 200) {
        const content = await csv.text();
        additionalData = getAdditionalData(content, format);
      }
    }

    const item: UserDataItem = {
      type: "item",
      id: id,
      dataID: id,
      description: `著作権や制約に関する情報などの詳細については、このデータの提供者にお問い合わせください。${
        format === "csv"
          ? "パフォーマンス上の問題が発生するため、6000レコード以上を含むCSVファイルをアップロードしないでください。"
          : ""
      }`,
      name: filename,
      url: dataUrl,
      visible: true,
      format,
      additionalData,
    };
    const requireLayerName = needsLayerName(dataUrl);
    setRequireLayerName(requireLayerName);
    if (setSelectedWebItem) setSelectedWebItem(item);
  }, [dataUrl, fileType, needsLayerName, setDataFormat]);

  const handleLayersAddOnDataset = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!selectedWebItem) return;
      const newValue = event.target.value;
      const newLayersArray = newValue.split(",");
      setLayers(newLayersArray);
    },
    [selectedWebItem],
  );

  const handleSubmit = useCallback(() => {
    if (!selectedWebItem) return;
    const terminalDataset = selectedWebItem && selectedWebItem;
    if (layers.length) terminalDataset.layers = layers;
    onSubmit(terminalDataset);
    setSelectedWebItem(undefined);
  }, [layers, onSubmit, selectedWebItem]);

  return (
    <Fragment>
      <FormControl fullWidth size="small">
        <Label>ファイルタイプを選択</Label>
        <WebFileTypeSelect fileType={fileType} onFileTypeSelect={handleFileTypeSelect} />
      </FormControl>
      <FormControl fullWidth size="small">
        <Label>データのURLを入力</Label>
        <UrlWrapper>
          <StyledInput
            placeholder="URLを入力してください"
            value={dataUrl}
            onChange={e => handleSetUrl(e.target.value)}
          />
          <BrowseButton size="medium" disabled={!dataUrl} onClick={handleClick}>
            データの閲覧
          </BrowseButton>
        </UrlWrapper>
        {dataUrl && selectedWebItem && (
          <>
            {requireLayerName && (
              <FormControl>
                <Label>表示したいレイヤー名を入力してください。</Label>
                <LayerInput
                  sx={{ width: "95%" }}
                  placeholder="レイヤー名"
                  onChange={handleLayersAddOnDataset}
                />{" "}
              </FormControl>
            )}
            <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }}>
              {selectedWebItem?.description}
            </Typography>
          </>
        )}
      </FormControl>
      <StyledButton
        startIcon={<AddIcon />}
        disabled={!selectedWebItem}
        type="submit"
        onClick={handleSubmit}>
        シーンに追加
      </StyledButton>
    </Fragment>
  );
};

const UrlWrapper = styled("section")(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(3),
}));

const StyledInput = styled(Input)(
  ({ theme }) => `
    .${inputClasses.input} {
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 6px 12px;
      border-radius: 4px 0 0 4px;
      border: solid 2px #eee;
      outline: none;
      width: 370px;
      ${theme.breakpoints.down("mobile")} {
        width: 124px;
      }
    }
  `,
);

const LayerInput = styled(Input)(
  () => `
    .${inputClasses.input} {
      width: 99%;
      font-size: 0.875rem;
      line-height: 1.5;
      padding: 6px 12px;
      border-radius: 4px;
      border: solid 2px #eee;
      margin-bottom: 12px;
      outline: none;
    }
    `,
);

const BrowseButton = styled(Button)(({ theme, disabled }) => ({
  color: theme.palette.text.primary,
  backgroundColor: disabled ? theme.palette.grey[50] : theme.palette.primary.main,
  borderRadius: "0 4px 4px 0",
  padding: "0 16px",
  "&:hover": {
    backgroundColor: !disabled && theme.palette.primary.main,
  },
  [theme.breakpoints.down("mobile")]: {
    minWidth: "auto",
    padding: "2px",
    fontSize: "12px",
  },
}));

export default WebDataTab;
