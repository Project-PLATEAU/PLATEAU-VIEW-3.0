import AddIcon from "@mui/icons-material/Add";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Typography, styled } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { getExtension } from "../../utils/file";

import { Label } from "./Label";
import FileTypeSelect, { FileType } from "./LocalFileTypeSelect";
import { StyledButton } from "./StyledButton";
import { UserDataItem } from "./types";
import { getAdditionalData } from "./utils";

type Props = {
  onSubmit: (selectedItem: UserDataItem) => void;
};

const LocalDataTab: React.FC<Props> = ({ onSubmit }) => {
  const [fileType, setFileType] = useState<FileType>("auto");
  const [selectedLocalItem, setSelectedLocalItem] = useState<UserDataItem>();

  const setDataFormat = useCallback((type: FileType, filename: string) => {
    const extension = getExtension(filename);
    if (type === "auto") {
      switch (extension) {
        // 3dtiles
        case "json":
          return "json";
        // georss
        case "rss":
          return "rss";
        // georss
        case "xml":
          return "xml";
        // shapefile
        case "zip":
          return "zip";
        default:
          return extension;
      }
    }
    return type;
  }, []);

  const proccessedData = useCallback(
    async (acceptedFiles: any) => {
      const fileName = acceptedFiles[0].name;

      const reader = new FileReader();
      const content = await new Promise<string | ArrayBuffer | null>(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(acceptedFiles[0]);
      });

      const url = (() => {
        if (!content) {
          return;
        }
        return "data:text/plain;charset=UTF-8," + encodeURIComponent(content.toString());
      })();
      const contentString =
        content instanceof ArrayBuffer ? new TextDecoder().decode(content) : content;

      const format = setDataFormat(fileType, fileName);
      const id = "id" + Math.random().toString(16).slice(2);
      const item: UserDataItem = {
        type: "item",
        id: id,
        dataID: id,
        description:
          "このファイルはローカルにのみ存在します。このデータを共有するには、データをアップロードし、パブリックなウェブブラウザで公開してください。",
        name: fileName,
        visible: true,
        url: url,
        format,
        additionalData: getAdditionalData(contentString, format),
      };
      if (setSelectedLocalItem) setSelectedLocalItem(item);
      return false;
    },
    [fileType, setDataFormat, setSelectedLocalItem],
  );

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (acceptedFiles.length > 0) {
        proccessedData(acceptedFiles);
      }
    },
    [proccessedData],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleFileTypeSelect = useCallback((type: string) => {
    setFileType(type as FileType);
  }, []);

  const handleSubmit = useCallback(() => {
    selectedLocalItem && onSubmit(selectedLocalItem);
    setSelectedLocalItem(undefined);
  }, [onSubmit, selectedLocalItem]);

  return (
    <FormControl fullWidth size="small">
      <Label>ファイルタイプを選択</Label>
      <FileTypeSelect fileType={fileType} onFileTypeSelect={handleFileTypeSelect} />

      <Label>ファイルをアップロード</Label>
      <DropzoneAreaWrapper>
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <StyledCopyIcon fontSize="large" />
          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }} variant="body1">
            ここをクリックしてファイルを選択するか <br />{" "}
            ファイルをここにドラッグ＆ドロップしてください
          </Typography>
        </div>
      </DropzoneAreaWrapper>

      {selectedLocalItem && (
        <>
          <Box sx={{ display: "flex", gap: "10px", border: "1px solid #0000001f", padding: "8px" }}>
            <DescriptionOutlinedIcon />
            <Typography>{selectedLocalItem.name}</Typography>
            <CancelIcon
              sx={{ cursor: "pointer" }}
              onClick={() => setSelectedLocalItem(undefined)}
            />
          </Box>
          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }}>
            {selectedLocalItem.description}
          </Typography>
        </>
      )}
      <StyledButton startIcon={<AddIcon />} disabled={!selectedLocalItem} onClick={handleSubmit}>
        シーンに追加
      </StyledButton>
    </FormControl>
  );
};

const DropzoneAreaWrapper = styled("section")(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(1.8),
}));

const CancelIcon = styled(ClearOutlinedIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginLeft: "auto",
}));

const StyledCopyIcon = styled(CopyAllOutlinedIcon)(({ theme }) => ({
  margin: "0 120px",
  [theme.breakpoints.down("mobile")]: {
    margin: "0 70px",
  },
}));

export default LocalDataTab;
