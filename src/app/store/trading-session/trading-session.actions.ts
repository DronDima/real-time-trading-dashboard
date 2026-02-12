import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { TradingSession } from '../../models/trading-session';
import { Offer } from '../../models/offer';
import { HubConnectionState } from '@microsoft/signalr';

export const TradingSessionActions = createActionGroup({
  source: 'Trading Session',
  events: {
    'Enter Session': props<{ sessionId: number }>(),
    'Load Sessions': emptyProps(),
    'Load Sessions Success': props<{ sessions: TradingSession[] }>(),
    'Load Sessions Failure': props<{ error: string }>(),
    'Load Session Success': props<{ session: TradingSession; offers: Offer[] }>(),
    'Load Session Failure': props<{ sessionId: number; error: string }>(),
    'Offer Created': props<{ offer: Offer }>(),
    'Offer Updated': props<{ offer: Offer }>(),
    'Offer Deleted': props<{ id: number }>(),
    'Offer Batch': props<{ created: Offer[]; updated: Offer[]; deleted: number[] }>(),
    'WebSocket Status Changed': props<{ status: HubConnectionState }>()
  }
});
