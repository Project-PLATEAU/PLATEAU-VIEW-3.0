import { Feature } from "../../reearth/types/layer";

export class TileFeatureIndex {
  private _layerId: string;
  private _selectedFeatureIds: Set<string>;

  constructor(layerId: string) {
    this._layerId = layerId;
    this._selectedFeatureIds = new Set();
  }

  get featureIds(): string[] {
    return (
      window.reearth?.layers
        ?.findById?.(this._layerId)
        ?.computed?.originalFeatures.map(f => f.id) ?? []
    );
  }

  get features(): Feature[] {
    return window.reearth?.layers?.findById?.(this._layerId)?.computed?.originalFeatures ?? [];
  }

  get selectedFeatureIds() {
    return this._selectedFeatureIds;
  }

  get selectedFeatureIdsArray() {
    return Array.from(this._selectedFeatureIds.values());
  }

  get layerId() {
    return this._layerId;
  }

  has(id: string) {
    return this._selectedFeatureIds.has(id);
  }

  select(features: string[]) {
    for (const f of features) {
      this._selectedFeatureIds.add(f);
    }
  }

  unselect(features: string[]) {
    for (const f of features) {
      this._selectedFeatureIds.delete(f);
    }
  }
}
