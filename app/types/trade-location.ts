export interface TradeLocationStruct {
  slug: string | null;
  type: string | null;
  league: string | null;
  isLive: boolean;
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
