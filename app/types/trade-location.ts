export interface TradeLocationStruct {
  baseUrl?: string,
  slug: string | null;
  type: string | null;
  league: string | null;
}

export interface TradeLocationChangeEvent {
  oldTradeLocation: TradeLocationStruct;
  newTradeLocation: TradeLocationStruct;
}

export interface TradeLocationHistoryStruct extends Required<TradeLocationStruct> {
  id: string;
  title: string;
  createdAt: string;
}
