import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, EMPTY, filter, map, of, switchMap } from 'rxjs';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';

import { RootState } from '../root.state';
import { TradingSessionsService } from '../../services/trading-sessions.service';
import { TradingSessionActions } from './trading-session.actions';
import { selectIsSessionLoaded, selectRouteSessionId } from './trading-session.selectors';

@Injectable()
export class TradingSessionEffects {
  private readonly actions$ = inject(Actions);
  private readonly tradingSessionsService = inject(TradingSessionsService);
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
          catchError(error => {
            let errorMessage = 'Unable to load session';
            if (error?.status === 404) {
              errorMessage = 'Session not found';
            } else if (error?.message) {
              errorMessage = error.message;
            }
            return of(
              TradingSessionActions.loadSessionFailure({
                sessionId: action.sessionId,
                error: errorMessage
              })
            );
          })
        );
      })
    )
  );
}
