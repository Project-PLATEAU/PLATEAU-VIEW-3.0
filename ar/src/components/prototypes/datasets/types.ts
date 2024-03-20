// export type TilesetPrimitiveConstructorOptions = {
//   [K in keyof Cesium3DTileset.ConstructorOptions]: Cesium3DTileset.ConstructorOptions[K] extends Primitive
//     ? Cesium3DTileset.ConstructorOptions[K]
//     : never;
// };

export type EvaluateFeatureColor = (result: string) => string | undefined;
