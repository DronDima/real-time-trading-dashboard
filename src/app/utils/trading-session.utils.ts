import { TradingSessionStatus } from '../models/trading-session';

export function getStatusClass(status: TradingSessionStatus | undefined): string {
  switch (status) {
    case TradingSessionStatus.Active:
      return 'bg-green-100 text-green-800';
    case TradingSessionStatus.Scheduled:
      return 'bg-blue-100 text-blue-800';
    case TradingSessionStatus.Completed:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
