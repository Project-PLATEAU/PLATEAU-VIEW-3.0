import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { MenuItem } from "@mui/material";
import Select from "@mui/material/Select";
import React from "react";

export const fileFormats = ".kml,.csv,.czml,.gpx,.geojson,.georss,.shapefile,.zip,.glb,.gltf";

type Props = {
  fileType: string;
  onFileTypeSelect: (value: string) => void;
};

export type FileType =
  | "auto"
  | "geojson"
  | "kml"
  | "csv"
  | "czml"
  | "gpx"
  | "georss"
  | "shapefile"
  | "gltf";

const FileTypeSelect: React.FC<Props> = ({ fileType, onFileTypeSelect }) => {
  const options = [
    {
      value: "auto",
      label: "自動検出",
    },
    {
      value: "geojson",
      label: "GeoJSON",
    },
    {
      value: "kml",
      label: "KML・KMZ",
    },
    {
      value: "csv",
      label: "CSV",
    },
    {
      value: "czml",
      label: "CZML",
    },
    {
      value: "gpx",
      label: "GPX",
    },
    {
      value: "georss",
      label: "GeoRSS",
    },
    {
      value: "shapefile",
      label: "ShapeFile (zip)",
    },
    {
      value: "gltf",
      label: "GLTF/GLB",
    },
  ];

  return (
    <Select
      sx={{ marginBottom: "12px", "& .MuiSelect-icon": { right: 8 } }}
      MenuProps={{ sx: { maxHeight: 330 } }}
      value={fileType}
      defaultValue="auto"
      IconComponent={ArrowDropDownIcon}
      onChange={e => onFileTypeSelect(e.target.value as FileType)}>
      {options.map((option, idx) => (
        <MenuItem key={idx} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default FileTypeSelect;
