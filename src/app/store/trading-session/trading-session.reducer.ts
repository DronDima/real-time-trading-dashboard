import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';

import { Offer } from '../../models/offer';
import { TradingSession } from '../../models/trading-session';
import { TradingSessionActions } from './trading-session.actions';

export interface TradingSessionState extends EntityState<Offer> {
  sessions: Record<number, TradingSession>;
  offersBySession: Record<number, number[]>;
  currentSessionId: number | null;
  loading: boolean;
  error: string | null;
}

export const tradingSessionAdapter = createEntityAdapter<Offer>();

const initialState: TradingSessionState = tradingSessionAdapter.getInitialState({
  sessions: {},
  offersBySession: {},
  currentSessionId: null,
  loading: false,
  error: null
});

const reducer = createReducer(
  initialState,
  on(TradingSessionActions.enterSession, (state, { sessionId }) => ({
    ...state,
    currentSessionId: sessionId,
    loading: state.sessions[sessionId] == null,
    error: null
  })),
  on(TradingSessionActions.loadSessionSuccess, (state, { session, offers }) => {
    const offerIds = offers.map(offer => offer.id);
    const isCurrentSession = state.currentSessionId === session.id;

    return tradingSessionAdapter.upsertMany(offers, {
      ...state,
      sessions: {
        ...state.sessions,
        [session.id]: {
          ...session,
          offers: []
        }
      },
      offersBySession: {
        ...state.offersBySession,
        [session.id]: offerIds
      },
      loading: isCurrentSession ? false : state.loading,
      error: isCurrentSession ? null : state.error
    });
  }),
  on(TradingSessionActions.loadSessionFailure, (state, { sessionId, error }) => {
    if (state.currentSessionId !== sessionId) {
      return state;
    }

    return {
      ...state,
      loading: false,
      error
    };
  })
);

export const tradingSessionFeature = createFeature({
  name: 'tradingSession',
  reducer
});
