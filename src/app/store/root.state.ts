import { RouterReducerState } from '@ngrx/router-store';

import { TradingSessionState } from './trading-session/trading-session.reducer';

export interface RootState {
  router: RouterReducerState;
  tradingSession: TradingSessionState;
}
