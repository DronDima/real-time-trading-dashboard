import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, EMPTY, filter, map, of, switchMap } from 'rxjs';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { HubConnectionState } from '@microsoft/signalr';

import { RootState } from '../root.state';
import { TradingSessionsService } from '../../services/trading-sessions.service';
import { WebSocketService } from '../../services/websocket.service';
import { TradingSessionActions } from './trading-session.actions';
import { selectCurrentSessionId, selectIsSessionLoaded, selectRouteSessionId, selectWebSocketStatus } from './trading-session.selectors';

@Injectable()
export class TradingSessionEffects {
  private readonly actions$ = inject(Actions);
  private readonly tradingSessionsService = inject(TradingSessionsService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly store = inject(Store<RootState>);

  readonly syncRouteSessionId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatLatestFrom(() => this.store.select(selectRouteSessionId)),
      map(([, sessionId]) => sessionId),
      filter((sessionId): sessionId is number => sessionId != null),
      map(sessionId => TradingSessionActions.enterSession({ sessionId }))
    )
  );

  readonly startWebSocket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TradingSessionActions.enterSession),
      concatLatestFrom(() => this.store.select(selectWebSocketStatus)),
      filter(([, status]) => status !== HubConnectionState.Connected && status !== HubConnectionState.Connecting),
      switchMap(async () => {
        await this.webSocketService.start();
        return EMPTY;
      })
    ),
    { dispatch: false }
  );

  readonly syncWebSocketStatus$ = createEffect(() =>
    this.webSocketService.status.pipe(
      map(status => TradingSessionActions.webSocketStatusChanged({ status }))
    )
  );

  readonly loadSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TradingSessionActions.enterSession),
      concatLatestFrom(action => this.store.select(selectIsSessionLoaded(action.sessionId))),
      switchMap(([action, isLoaded]) => {
        if (isLoaded) {
          return EMPTY;
        }

        return this.tradingSessionsService.getSession(action.sessionId).pipe(
          map(session =>
            TradingSessionActions.loadSessionSuccess({
              session,
              offers: session.offers
            })
          ),
          catchError(error => this.handleLoadSessionError(action.sessionId, error))
        );
      })
    )
  );

  readonly handleWebSocketEvents$ = createEffect(() =>
    this.webSocketService.events.pipe(
      switchMap(event => {
        switch (event.type) {
          case 'OFFER_CREATED':
            return of(TradingSessionActions.offerCreated({ offer: event.payload }));
          case 'OFFER_UPDATED':
            return of(TradingSessionActions.offerUpdated({ offer: event.payload }));
          case 'OFFER_DELETED':
            return of(TradingSessionActions.offerDeleted({ id: event.payload.id }));
          default:
            return EMPTY;
        }
      })
    )
  );

  readonly reloadOffersOnReconnect$ = createEffect(() =>
    this.webSocketService.reconnected.pipe(
      concatLatestFrom(() => this.store.select(selectCurrentSessionId)),
      filter(([, sessionId]) => sessionId != null),
      switchMap(([, sessionId]) => {
        return this.tradingSessionsService.getSession(sessionId!).pipe(
          map(session =>
            TradingSessionActions.loadSessionSuccess({
              session,
              offers: session.offers
            })
          ),
          catchError(error => this.handleLoadSessionError(sessionId!, error))
        );
      })
    )
  );

  private handleLoadSessionError(sessionId: number, error: any) {
    let errorMessage = 'Unable to load session';
    if (error?.status === 404) {
      errorMessage = 'Session not found';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    console.error('Error loading session:', error);
    return of(
      TradingSessionActions.loadSessionFailure({
        sessionId,
        error: errorMessage
      })
    );
  }
}
