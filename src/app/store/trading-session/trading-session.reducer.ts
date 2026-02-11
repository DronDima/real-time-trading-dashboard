import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { HubConnectionState } from '@microsoft/signalr';

import { Offer } from '../../models/offer';
import { TradingSession } from '../../models/trading-session';
import { TradingSessionActions } from './trading-session.actions';

export interface TradingSessionState extends EntityState<Offer> {
  sessions: Record<number, TradingSession>;
  offersBySession: Record<number, number[]>;
  currentSessionId: number | null;
  loading: boolean;
  error: string | null;
  websocketStatus: HubConnectionState;
}

export const tradingSessionAdapter = createEntityAdapter<Offer>();

const initialState: TradingSessionState = tradingSessionAdapter.getInitialState({
  sessions: {},
  offersBySession: {},
  currentSessionId: null,
  loading: false,
  error: null,
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
  on(TradingSessionActions.webSocketStatusChanged, (state, { status }) => ({
    ...state,
    websocketStatus: status
  }))
);

export const tradingSessionFeature = createFeature({
  name: 'tradingSession',
  reducer
});
