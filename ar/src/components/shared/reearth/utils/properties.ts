export class Properties {
  private _layerId: string;
  private _cachedProperties?: any;

  constructor(layerId: string) {
    this._layerId = layerId;
  }

  get value() {
    if (this._cachedProperties) {
      return this._cachedProperties;
    }

    const properties = window.reearth?.layers?.findById?.(this._layerId)?.computed?.properties;
    this._cachedProperties = properties;

    return this._cachedProperties;
  }
}
