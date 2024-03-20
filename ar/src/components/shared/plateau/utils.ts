export function getGMLId(properties: any): string | undefined {
  try {
    // Version 2020 stores GML id in "_gml_id" while 2022 stores in "gml_id".
    return properties.gml_id ?? properties._gml_id;
  } catch (error) {
    return undefined;
  }
}
