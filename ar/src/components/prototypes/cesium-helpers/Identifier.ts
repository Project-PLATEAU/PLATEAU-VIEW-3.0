export type IdentifierParam = string | number | { toString: () => string };

export interface IdentifierParams {
  type: IdentifierParam;
  subtype?: IdentifierParam;
  key: IdentifierParam;
  index?: number;
}

export function compose({ type, subtype, key, index }: IdentifierParams): string {
  return [type, subtype, key, index]
    .map(value => (value != null ? `${value}` : undefined))
    .join(":");
}
