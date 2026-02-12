import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { HubConnectionState } from '@microsoft/signalr';

import { Offer } from '../../models/offer';
import { TradingSession } from '../../models/trading-session';
import { TradingSessionActions } from './trading-session.actions';

export interface TradingSessionState extends EntityState<Offer> {
  sessions: Record<number, TradingSession>;
  sessionsList: TradingSession[];
  offersBySession: Record<number, number[]>;
  currentSessionId: number | null;
  loading: boolean;
  sessionsListLoading: boolean;
  error: string | null;
  sessionsListError: string | null;
  websocketStatus: HubConnectionState;
}

export const tradingSessionAdapter = createEntityAdapter<Offer>();

const initialState: TradingSessionState = tradingSessionAdapter.getInitialState({
  sessions: {},
  sessionsList: [],
  offersBySession: {},
  currentSessionId: null,
  loading: false,
  sessionsListLoading: false,
  error: null,
  sessionsListError: null,
  websocketStatus: HubConnectionState.Disconnected
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
  }),
  on(TradingSessionActions.offerCreated, (state, { offer }) => {
    const sessionId = offer.tradingSessionId;
    const existingOfferIds = state.offersBySession[sessionId] || [];

    if (existingOfferIds.includes(offer.id)) {
      return state;
    }

    const newOfferIds = [...existingOfferIds, offer.id];

    return tradingSessionAdapter.addOne(offer, {
      ...state,
      offersBySession: {
        ...state.offersBySession,
        [sessionId]: newOfferIds
      }
    });
  }),
  on(TradingSessionActions.offerUpdated, (state, { offer }) => {
    const sessionId = offer.tradingSessionId;
    const existingOfferIds = state.offersBySession[sessionId] || [];

    if (!existingOfferIds.includes(offer.id)) {
      return state;
    }

    return tradingSessionAdapter.updateOne(
      { id: offer.id, changes: offer },
      state
    );
  }),
  on(TradingSessionActions.offerDeleted, (state, { id }) => {
    const offer = state.entities[id];
    if (!offer) {
      return state;
    }

    const sessionId = offer.tradingSessionId;
    const existingOfferIds = state.offersBySession[sessionId] || [];
    const newOfferIds = existingOfferIds.filter(offerId => offerId !== id);

    return tradingSessionAdapter.removeOne(id, {
      ...state,
      offersBySession: {
        ...state.offersBySession,
        [sessionId]: newOfferIds
      }
    });
  }),
  on(TradingSessionActions.offerBatch, (state, { created, updated, deleted }) => {
    let nextState = state;

    for (const id of deleted) {
      const offer = nextState.entities[id];
      if (!offer) continue;
      const sessionId = offer.tradingSessionId;
      const offerIds = nextState.offersBySession[sessionId] || [];
      nextState = tradingSessionAdapter.removeOne(id, {
        ...nextState,
        offersBySession: {
          ...nextState.offersBySession,
          [sessionId]: offerIds.filter(oid => oid !== id)
        }
      });
    }

    if (updated.length > 0) {
      nextState = tradingSessionAdapter.updateMany(
        updated.map(o => ({ id: o.id, changes: o })),
        nextState
      );
    }

    if (created.length > 0) {
      nextState = tradingSessionAdapter.addMany(created, nextState);
      const newOffersBySession = { ...nextState.offersBySession };
      for (const offer of created) {
        const sessionId = offer.tradingSessionId;
        const existing = newOffersBySession[sessionId] || [];
        if (!existing.includes(offer.id)) {
          newOffersBySession[sessionId] = [...existing, offer.id];
        }
      }
      nextState = { ...nextState, offersBySession: newOffersBySession };
    }

    return nextState;
  }),
  on(TradingSessionActions.webSocketStatusChanged, (state, { status }) => ({
    ...state,
    websocketStatus: status
  })),
  on(TradingSessionActions.loadSessions, state => ({
    ...state,
    sessionsListLoading: true,
    sessionsListError: null
  })),
  on(TradingSessionActions.loadSessionsSuccess, (state, { sessions }) => ({
    ...state,
    sessionsList: sessions,
    sessionsListLoading: false,
    sessionsListError: null
  })),
  on(TradingSessionActions.loadSessionsFailure, (state, { error }) => ({
    ...state,
    sessionsListLoading: false,
    sessionsListError: error
  }))
);

export const tradingSessionFeature = createFeature({
  name: 'tradingSession',
  reducer
});
