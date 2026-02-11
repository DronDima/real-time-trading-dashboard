import { Offer } from "./offer";

export enum TradingSessionStatus {
  Active = 'Active',
  Scheduled = 'Scheduled',
  Completed = 'Completed',
}

export interface TradingSession {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: TradingSessionStatus;
  products: string[];
  createdAt: string;
  offers: Offer[];
}
