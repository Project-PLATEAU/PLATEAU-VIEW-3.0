import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { MenuItem } from "@mui/material";
import Select from "@mui/material/Select";
import React from "react";

export type FileType =
  | "auto"
  | "wms"
  | "geojson"
  | "kml"
  | "csv"
  | "czml"
  | "gpx"
  | "georss"
  | "shapefile";

type Props = {
  fileType: string;
  onFileTypeSelect: (value: string) => void;
};

const SUPPORTED_TYPES: Record<string, string> = {
  zip: "shapefile",
  wms: "wms",
  gpx: "gpx",
  czml: "czml",
  xml: "georss",
  mvt: "mvt",
  kml: "kml",
  geojson: "geojson",
  gtfs: "gtfs",
  csv: "csv",
  "tileset.json": "3dtiles",
  glb: "gltf",
  gltf: "gltf",
};

export const getSupportedType = (url: string): string | undefined => {
  for (const key in SUPPORTED_TYPES) {
    if (url.includes(key)) {
      return SUPPORTED_TYPES[key];
    }
  }
  return undefined;
};

const WebFileTypeSelect: React.FC<Props> = ({ fileType, onFileTypeSelect }) => {
  const options = [
    {
      value: "auto",
      label: "自動検出",
    },
    {
      value: "wms",
      label: "Web Map Service (WMS)",
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
      value: "3dtiles",
      label: "3D Tiles",
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
      value: "mvt",
      label: "Mapbox Vector Tile (MVT)",
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

export default WebFileTypeSelect;
