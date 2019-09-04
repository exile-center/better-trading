export interface PoeNinjaCurrenciesPayloadLine {
  currencyTypeName: string;
  chaosEquivalent: number;
}

export interface PoeNinjaCurrenciesPayload {
  lines: PoeNinjaCurrenciesPayloadLine[];
}

export interface PoeNinjaCurrenciesRatios {
  [key: string]: number;
}
