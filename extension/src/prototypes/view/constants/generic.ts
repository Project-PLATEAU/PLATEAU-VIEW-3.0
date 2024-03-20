export enum GenericDatasetType {
  UseCase = "usecase",
  Sample = "sample",
}

export const isGenericDatasetType = (type: string) =>
  type === GenericDatasetType.UseCase || type === GenericDatasetType.Sample;
