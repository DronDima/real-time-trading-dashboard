export enum TradingSessionStatus {
  Active = 'active',
  Scheduled = 'scheduled',
  Completed = 'completed',
}

export interface TradingSession {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: TradingSessionStatus;
  products: string[];
  createdAt: string;
}
